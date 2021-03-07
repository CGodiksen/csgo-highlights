/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import sharp from 'sharp';
import vision from '@google-cloud/vision';
import { FullMatch } from 'hltv/lib/models/FullMatch';

import util from 'util';
import exec from 'child_process';
const promiseExec = util.promisify(exec.exec);

interface VodLink {
    game: number
    provider: "Twitch" | "Youtube"
    url: string
    vodStart: number
    downloadUrls: string[]
}

const downloadVods = async (match: FullMatch): Promise<void> => {
    const saveFolder = `data/${match.id}/vods/`;
    const vodLinks = await getVodLinks(match);

    vodLinks.forEach(link => {
        void downloadVod(link, saveFolder);
    });
};

const getVodLinks = async (match: FullMatch): Promise<VodLink[]> => {
    const gameCount = match.maps.filter(map => map.statsId).length;
    const vodLinks: VodLink[] = [];

    for (let i = 1; i <= gameCount; i++) {
        const link = match.demos.find(demo => demo.name.includes(`Map ${i}`))?.link;

        if (link) {
            vodLinks.push(await parseLink(link, i));
        }
    }
    return vodLinks;
};

// Parse a link for a vod to extract the provider, url and start time.
const parseLink = async (link: string, game: number): Promise<VodLink> => {
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

    return { provider: provider, url: url, vodStart: vodStart, downloadUrls: await getDownloadUrls(url), game: game };
};

// Use youtube-dl to get the download url(s). For youtube vods this will return a seperate url for video and audio.
const getDownloadUrls = async (url: string): Promise<string[]> => {
    let downloadUrls: string[] = [];
    try {
        const { stdout } = await promiseExec(`youtube-dl --youtube-skip-dash-manifest -g ${url}`);
        downloadUrls = stdout.split("\n");

    } catch (e) {
        console.error(e);
    }
    return downloadUrls;
};

// Return a promise to deliver the save path after downloading the vod from the given link.
const downloadVod = async (link: VodLink, saveFolder: string): Promise<void> => {
    await findGameStart(link, saveFolder);
    // TODO: Find the actual start of the game and change the links to reflect this.
    // TODO: Find the approximate duration of the game.
    // TODO: Get the youtube-dl -g download link.
    // TODO: Use ffmpeg to download the video from the above link with the above duration.
    // TODO: Return the save path when the download is done.
};

// Return the exact timestamp of when the game started in the VOD.
const findGameStart = async (link: VodLink, saveFolder: string): Promise<void> => {
    try {
        const fileName = `${saveFolder}${link.game}.jpg`;
        // Downloading a single frame from the VOD.
        await promiseExec(`ffmpeg -ss ${link.vodStart} -i "${link.downloadUrls[0]}" -vframes 1 -q:v 2 ${fileName}`);
        
        // Cropping the downloaded frame to focus it on the scoreboard and the timer.
        await sharp(fileName).extract({ width: 1280, height: 150, left: 0, top: 0 }).toFile(`${saveFolder}${link.game}_cropped.jpg`);
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