/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import sharp from 'sharp';
import vision from '@google-cloud/vision';
import { FullMatch } from 'hltv/lib/models/FullMatch';

import util from 'util';
import exec from 'child_process';
import { MapResult } from 'hltv/lib/models/MapResult';
const promiseExec = util.promisify(exec.exec);

interface Vod {
    map: MapResult
    provider: "Twitch" | "Youtube"
    url: string
    vodStart: number
    downloadUrls: string[]
}

const downloadVods = async (match: FullMatch): Promise<void> => {
    const saveFolder = `data/${match.id}/vods/`;
    const vods = await getVods(match);

    vods.forEach(link => {
        void downloadVod(link, saveFolder);
    });
};

const getVods = async (match: FullMatch): Promise<Vod[]> => {
    const gameCount = match.maps.filter(map => map.statsId).length;
    const vods: Vod[] = [];

    for (let i = 1; i <= gameCount; i++) {
        const link = match.demos.find(demo => demo.name.includes(`Map ${i}`))!.link;
        vods.push(await parseLink(link, match.maps[i - 1]));
    }
    return vods;
};

// Parse a link for a vod to extract the provider, url, start time and download urls.
const parseLink = async (link: string, map: MapResult): Promise<Vod> => {
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

    return { provider: provider, url: url, vodStart: vodStart, downloadUrls: await getDownloadUrls(url), map: map };
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
const downloadVod = async (vod: Vod, saveFolder: string): Promise<void> => {
    await calibrateVodStart(vod, saveFolder);
    console.log(vod);
    
    // TODO: Find the approximate duration of the game.
    // TODO: Use ffmpeg to download the video from the above link with the above duration.
    // TODO: Return the save path when the download is done.
};

// Find the actual start of the game and change the link to reflect this.
const calibrateVodStart = async (vod: Vod, saveFolder: string): Promise<void> => {
    try {
        // Downloading a single frame from the VOD.
        const fileName = `${saveFolder}${vod.map.name}.jpg`;
        await promiseExec(`ffmpeg -ss ${vod.vodStart} -i "${vod.downloadUrls[0]}" -vframes 1 -q:v 2 ${fileName}`);

        // Cropping the downloaded frame to focus it on the scoreboard and the timer.
        const croppedFileName = `${saveFolder}${vod.map.name}_cropped.jpg`;
        await sharp(fileName).extract({ width: 1280, height: 150, left: 0, top: 0 }).toFile(croppedFileName);

        const timeLeftOnFrame = await getRoundTime(croppedFileName);

        if (timeLeftOnFrame) {
            // Adjusting the start time based on the time left in the round on the first frame.
            vod.vodStart = vod.vodStart - (135 - timeLeftOnFrame);
        }
    } catch (e) {
        console.error(e);
    }
};

// Return the time left in the round in seconds on a specific frame of the VOD. 
const getRoundTime = async (framePath: string): Promise<number | void> => {
    // Creates a client
    const client = new vision.ImageAnnotatorClient({keyFilename: "config/gcp_ocr.json"});

    // Performs text detection on the local file
    const result = await client.textDetection(framePath);
    const detections = result[0].textAnnotations;

    if (detections) {
        // Extracting the timer detection.
        const timer = detections.find(detection => detection.description && detection.description.includes(":") && detection.description.length === 4);

        if (timer?.description) {
            const splitTimer = timer.description.split(":");
            return (+splitTimer[0]) * 60 + (+splitTimer[1]);
        }
    }
};

// Return the approximate duration of the game based on the number of rounds.
const calculateApproxDuration = (map: MapResult): number => {
    // Example map result: 16:10.
    const roundCount = map.result!.slice(0, 5).trim().split(":").reduce((acc, current) => acc + (+current), 0);

    // A long round (with buy time) takes around 150 seconds. Adding 5 minutes for the halftime break.
    return (roundCount * 150) + 300;
};

export { getRoundTime, downloadVods };