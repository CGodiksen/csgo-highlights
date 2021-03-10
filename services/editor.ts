import { HighlightSpecification } from "./common/types";

// Cut the given VODs into a highlight video according to the given hightlight specification.
const createHighlightVideo = (vodFolder: string, hightlightSpecifications: HighlightSpecification[]): void => {
    console.log(vodFolder, hightlightSpecifications);

    const highlightOrderFiles = await Promise.all(hightlightSpecifications.map(spec => cutVod(getRelatedVodPath(vodFolder, spec), spec)));
    // For each vod do the following concurrently:
        // Create a highlight txt file.
        // Cut out hightlights from the vods.
        // When a hightlight is cut out add its filepath to the hightlight txt file.
    // Afterwards merge the text files into a single hightlight txt file.
    // Use the ffmpeg concat demuxer method to concatenate all hightlight clips into a single hightlight video.
    // Return the path to the created hightlight video.
};

// Cut out hightlights from the vod and return a promise to deliver the file path to a txt file specifying the intended order of the clips.
const cutVod = (vodFilePath: string, hightlightSpecification: HighlightSpecification): void => {
    console.log(vodFilePath, hightlightSpecification);
    
};

export { createHighlightVideo };