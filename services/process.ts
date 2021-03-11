import fs from "fs";
import glob from "glob-promise";
import { HighlightSpecification } from "./common/types";
import { createHighlightVideo } from "./editor";
import { getHighlightSpecification } from "./highlighter";

// Fully process a single match, from downloading to editing and finally uploading it to youtube.
const processMatch = async (matchId: number): Promise<void> => {
    console.log(matchId);

    const demoFolder = "data/2346587/demos/";
    const demoFiles = fs.readdirSync(demoFolder);
    // This should be done right after the demos have been downloaded.
    const hightlightSpecifications = await Promise.all(demoFiles.map(demoFile => getHighlightSpecification(demoFolder, demoFile)));
    
    const vodFolder = "data/2346587/vods/";
    const vodFiles = await glob(`${vodFolder}*.mp4`);
    hightlightSpecifications.map(spec => addRelatedVod(vodFiles, spec));

    const hightlightVideoPath = await createHighlightVideo(vodFolder, hightlightSpecifications);
    console.log(hightlightVideoPath);

    // TODO: Download the demos in parallel with downloading the VODs.
    // TODO: Downloading the demos should be grouped with a function that immediately sends them along to the getHightlights function.
    // TODO: When the two above parallel functions are done (downloadDemos -> getHighlights and downloadVods) we send it to the editor.
    // TODO: When the editor is done we send the filepath to the highlight video to the uploader and finish after.
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