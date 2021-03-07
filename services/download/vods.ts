/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// TODO: Add a function that first retrieves the first frame and finds when the game actually started in the vod.
// TODO: The vods should be faily precise so they start exactly at 00:20 or 00:00 on round 1.
import vision from '@google-cloud/vision';
import { FullMatch } from 'hltv/lib/models/FullMatch';

import util from 'util';
import exec from 'child_process';
const promiseExec = util.promisify(exec.exec);

interface VodLink {
    provider: "Twitch" | "Youtube"
    url: string
    vodStart: number
}

const downloadVods = (match: FullMatch): void => {
    const saveFolder = `data/${match.id}/vods/`;
    const vodLinks = getVodLinks(match);

    vodLinks.forEach(link => {
        void downloadVod(link, saveFolder);
    });
};

const getVodLinks = (match: FullMatch): VodLink[] => {
    const gameCount = match.maps.filter(map => map.statsId).length;
    const vodLinks: VodLink[] = [];

    for (let i = 1; i <= gameCount; i++) {
        const link = match.demos.find(demo => demo.name.includes(`Map ${i}`))?.link;

        if (link) {
            vodLinks.push(parseLink(link));
        }
    }
    return vodLinks;
};

// Parse a link for a vod to extract the provider, url and start time.
const parseLink = (link: string): VodLink => {
    const split_link = link.split("&");
    const provider = link.includes("twitch") ? "Twitch" : "Youtube";
    let url = "";
    let vodStart = 0;

    if (provider === "Twitch") {
        // Example twitch link: https://player.twitch.tv/?video=v100653684&autoplay=true&t=4h58m14s&parent=www.hltv.org
        url = split_link[0];
        const timeStamp = split_link[2].slice(2).replace("h", ":").replace("m", ":").replace("s", "").split(":");
        vodStart = (+timeStamp[0]) * 60 * 60 + (+timeStamp[1]) * 60 + (+timeStamp[2]);
    } else {
        // Example youtube link: https://www.youtube.com/embed/c38Qu1qktJM?autoplay=1&start=32
        url = split_link[0].split("?")[0];
        vodStart = parseInt(split_link[1].slice(6));
    }
    return { provider: provider, url: url, vodStart: vodStart};
};

// Return a promise to deliver the save path after downloading the vod from the given link.
const downloadVod = async (link: VodLink, saveFolder: string): Promise<void> => {
    await findGameStart(link);
    console.log(saveFolder);
    // TODO: Find the actual start of the game and change the links to reflect this.
    // TODO: Find the approximate duration of the game.
    // TODO: Get the youtube-dl -g download link.
    // TODO: Use ffmpeg to download the video from the above link with the above duration.
    // TODO: Return the save path when the download is done.
};

// Return the exact timestamp of when the game started in the VOD.
const findGameStart = async (link: VodLink): Promise<void> => {
    try {
        const { stdout, stderr } = await promiseExec(`youtube-dl -g ${link.url}`);
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
    } catch (e) {
        console.error(e);
    }
};

// Return the time left in the round on a specific frame of the VOD. 
const getRoundTime = (framePath: string): number => {
    // Creates a client
    const client = new vision.ImageAnnotatorClient();

    // Performs text detection on the local file
    void client.textDetection(framePath).then(result => {
        const detections = result[0].textAnnotations;
        console.log('Text:');

        if (detections) {
            detections.forEach(text => console.log(text));
        }
    });
    return 0;
};

export { getRoundTime, downloadVods };