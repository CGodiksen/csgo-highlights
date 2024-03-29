import fs from "fs/promises";
import path from "path";
import { HighlightSpecification } from "./common/types";
import { promiseExec } from "./common/functions";

// Cut the given VODs into a highlight video according to the given hightlight specification.
const createHighlightVideo = async (vodFolder: string, hightlightSpecifications: HighlightSpecification[]): Promise<string> => {
    console.log(`Creating a hightlight video for VODs in ${vodFolder}...`);

    try {
        const highlightOrderFiles = await Promise.all(hightlightSpecifications.map(spec => cutVod(vodFolder, spec)));

        // Merge the text files specifying the order of the clips into a single hightlight txt file.
        const mergedOrderFilePath = await mergeOrderFiles(vodFolder, highlightOrderFiles);

        // Use the ffmpeg concat demuxer method to concatenate all hightlight clips into a single hightlight video.
        const orderFileAbsolutePath = `${path.dirname(require.main!.filename)}\\${mergedOrderFilePath.replace(/\//g, "\\")}`;
        const hightlightVideoPath = `${vodFolder}highlights.mp4`;
        await promiseExec(`ffmpeg -safe 0 -f concat -i ${orderFileAbsolutePath} -c copy ${hightlightVideoPath}`);

        console.log(`Created a highlight video from ${hightlightSpecifications.length} VODs at ${hightlightVideoPath}`);
        return hightlightVideoPath;
    } catch (createVideoError) {
        console.error(createVideoError);
        return "";
    }
};

// Cut out hightlights from the vod and return a promise to deliver the file path to a txt file specifying the intended order of the clips.
const cutVod = async (vodFolder: string, hightlightSpec: HighlightSpecification): Promise<string> => {
    console.log(`Cutting the VOD at ${hightlightSpec.vodFilePath!} into ${hightlightSpec.highlights.length} clips...`);

    const mapNumber = hightlightSpec.vodFilePath!.slice(-6).slice(0, 2);
    const highlightOrderFilePath = `${vodFolder}${mapNumber}.txt`;

    for (const hightlight of hightlightSpec.highlights) {
        const clipFilePath = `${vodFolder}${mapNumber}_${hightlight.roundNumber}.mp4`;
        await promiseExec(`ffmpeg -ss ${hightlight.start} -i ${hightlightSpec.vodFilePath!} -to ${hightlight.duration} -c copy ${clipFilePath}`);

        await fs.appendFile(`${vodFolder}${mapNumber}.txt`, `file ${clipFilePath}\n`);
    }

    return highlightOrderFilePath;
};

// Return a promise to deliver the file path to the merged order file when done merging.
const mergeOrderFiles = async (vodFolder: string, orderFiles: string[]): Promise<string> => {
    const mergedFilePath = `${vodFolder}merged.txt`;
    const content = await Promise.all(orderFiles.map(orderFile => fs.readFile(orderFile)));

    await fs.writeFile(mergedFilePath, content.toString().replace(",", ""));
    return mergedFilePath;
};

export { createHighlightVideo };