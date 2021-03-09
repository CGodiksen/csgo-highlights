import fs from "fs";
import { createHighlightVideo } from "./editor";
import { getHighlightSpecification } from "./highlighter";

// Fully process a single match, from downloading to editing and finally uploading it to youtube.
const processMatch = async (matchId: number): Promise<void> => {
    console.log(matchId);

    const demoFolder = "data/2346587/demos/";
    const demoFiles = fs.readdirSync(demoFolder);
    // This should be done right after the demos have been downloaded.
    const hightlightSpecifications = await Promise.all(demoFiles.map(demoFile => getHighlightSpecification(demoFolder, demoFile)));
    console.log(hightlightSpecifications);
    
    const vodFolder = "data/2346587/vods";
    const hightlightVideoPath = createHighlightVideo(vodFolder, hightlightSpecifications);
    console.log(hightlightVideoPath);

    // TODO: Download the demos in parallel with downloading the VODs.
    // TODO: Downloading the demos should be grouped with a function that immediately sends them along to the getHightlights function.
    // TODO: When the two above parallel functions are done (downloadDemos -> getHighlights and downloadVods) we send it to the editor.
    // TODO: When the editor is done we send the filepath to the highlight video to the uploader and finish after.
};

export { processMatch };