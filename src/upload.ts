import { FullMatch } from "hltv/lib/models/FullMatch";

const uploadHighlightVideo = (videoPath: string, match: FullMatch): void => {
    console.log(videoPath, match);
    const title = createTitle(match);
    console.log(title);

    // TODO: Based on the match create a title for the video.
    // TODO: Upload the highlight video with the created title.
    // TODO: Add the video to a playlist for the event and for the teams.
};

const createTitle = (match: FullMatch) => {
    return `${match.team1!.name} vs ${match.team2!.name} - ${match.event.name} - HIGHLIGHTS | CSGO`;
};

export { uploadHighlightVideo };