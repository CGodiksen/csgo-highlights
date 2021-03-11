import fs from "fs/promises";
import { FullMatch } from "hltv/lib/models/FullMatch";

// "Upload" the video by saving it to the specified location under a match specific name.
const uploadHighlightVideo = async (videoPath: string, match: FullMatch, savePath: string): Promise<void> => {
    
    const title = createTitle(match);
    const filePath = `${savePath}${title.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, "")}.mp4`;

    await fs.rename(videoPath, filePath);
    console.log(`"Uploaded" the highlight video at ${videoPath} to ${filePath}`);
};

const createTitle = (match: FullMatch) => {
    return `${match.team1!.name} vs ${match.team2!.name} - ${match.event.name}`;
};

export { uploadHighlightVideo };