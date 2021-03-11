import fs from "fs/promises";
import { FullMatch } from "hltv/lib/models/FullMatch";

// "Upload" the video by saving it to the specified location under a match specific name.
const uploadHighlightVideo = async (videoPath: string, match: FullMatch, savePath: string): Promise<void> => {
    const title = createTitle(match);
    await fs.rename(videoPath, `${savePath}${title.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, "")}.mp4`);
};

const createTitle = (match: FullMatch) => {
    return `${match.team1!.name} vs ${match.team2!.name} - ${match.event.name}`;
};

export { uploadHighlightVideo };