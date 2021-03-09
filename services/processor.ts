// Fully process a single match, from downloading to editing and finally uploading it to youtube.
const processMatch = (matchId: number): void => {
    console.log(matchId);
    // TODO: Download the demos in parallel with downloading the VODs.
    // TODO: Downloading the demos should be grouped with a function that immediately sends them along to the getHightlights function.
    // TODO: When the two above parallel functions are done (downloadDemos -> getHighlights and downloadVods) we send it to the editor.
    // TODO: When the editor is done we send the filepath to the highlight video to the uploader and finish after.
};

export { processMatch };