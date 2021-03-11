import fs from "fs/promises";
import glob from "glob-promise";
import os from "os";

import { downloadDemos } from "./download/demos";
import { downloadVods } from "./download/vods";
import { uploadHighlightVideo } from "./upload";
import { HighlightSpecification } from "./common/types";
import { createHighlightVideo } from "./editor";
import { getHighlightSpecification } from "./highlight";
import { FullMatch } from "hltv/lib/models/FullMatch";

// Fully process a single match, from downloading to editing and finally uploading it to youtube.
const processMatch = async (match: FullMatch): Promise<void> => {
    // Set up the folder structure used throughout the process.
    await fs.mkdir(`data/${match.id}/demos`, { recursive: true });
    await fs.mkdir(`data/${match.id}/vods`, { recursive: true });

    // Download the demos and get highlights in parallel with downloading the VODs.
    const [hightlightSpecifications, vodFolder] = await Promise.all([downloadAndParseDemos(match), downloadVods(match)]);
    const vodFiles = await glob(`${vodFolder}*.mp4`);
    hightlightSpecifications.map(spec => addRelatedVod(vodFiles, spec));

    const hightlightVideoPath = await createHighlightVideo(vodFolder, hightlightSpecifications);
    await uploadHighlightVideo(hightlightVideoPath, match, `${os.homedir()}/Desktop/`);

    await fs.rmdir(`data/${match.id}`, { recursive: true });
};

const downloadAndParseDemos = async (match: FullMatch): Promise<HighlightSpecification[]> => {
    const demoFolder = await downloadDemos(match);
    const demoFiles = await fs.readdir(demoFolder);
    return await Promise.all(demoFiles.map(demoFile => getHighlightSpecification(demoFolder, demoFile)));
};

// Adding the VOD file that corresponds to the demo to the hightlight specification. 
const addRelatedVod = (vodFiles: string[], hightlightSpecification: HighlightSpecification): void => {
    const relatedVod = vodFiles.find(file => hightlightSpecification.demoFile.includes(file.slice(-6).slice(0, 2)));

    if (relatedVod) {
        hightlightSpecification.vodFilePath = relatedVod;
    } else {
        throw "Could not find a VOD for the hightlight specification.";
    }
};

export { processMatch };