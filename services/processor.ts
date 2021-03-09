import fs from "fs";
import { getHighlightSpecification } from "./highlighter";

// Fully process a single match, from downloading to editing and finally uploading it to youtube.
const processMatch = async (matchId: number): Promise<void> => {
    console.log(matchId);

    const demoFiles = fs.readdirSync("data/2346587/demos");
    const hightlightSpecifications = await Promise.all(demoFiles.map(demoFile => getHighlightSpecification(demoFile)));
    console.log(hightlightSpecifications);
    
    // TODO: Download the demos in parallel with downloading the VODs.
    // TODO: Downloading the demos should be grouped with a function that immediately sends them along to the getHightlights function.
    // TODO: When the two above parallel functions are done (downloadDemos -> getHighlights and downloadVods) we send it to the editor.
    // TODO: When the editor is done we send the filepath to the highlight video to the uploader and finish after.

};

export { processMatch };