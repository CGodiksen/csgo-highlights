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
    providor: "Twitch" | "Youtube"
    url: string
    vodStart: string
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
    const vodLinks: string[] = [];

    for (let i = 1; i <= gameCount; i++) {
        const link = match.demos.find(demo => demo.name.includes(`Map ${i}`))?.link;

        if (link) {

            vodLinks.push(link);
        }
    }
    return vodLinks;
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
        console.log(getRoundTime("./data/test.PNG"));
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
    } catch (e) {
        console.error(e);
    }
};

// Return the time left in the round on a specific frame of the VOD. 
const getRoundTime = (framePath: string) => {
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
};

export { findGameStart, downloadVods };