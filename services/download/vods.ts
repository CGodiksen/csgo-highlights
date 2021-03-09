import sharp from 'sharp';
import vision from '@google-cloud/vision';

import { FullMatch } from 'hltv/lib/models/FullMatch';
import { MapResult } from 'hltv/lib/models/MapResult';

import util from 'util';
import exec from 'child_process';
const promiseExec = util.promisify(exec.exec);

interface VodInfo {
    game: number
    map: MapResult
    provider: "Twitch" | "Youtube"
    url: string
    vodStart: number
    downloadUrls: string[]
}

const downloadVods = async (match: FullMatch): Promise<void> => {
    const saveFolder = `data/${match.id}/vods/`;
    const vods = await getVodInfo(match);

    // Downloading each vod concurrently.
    Promise.all(vods.map(vod => downloadVod(vod, saveFolder))).catch(e => {console.error(e);});
};

// Return a list with a VodInfo object for each available Vod in the given match.
const getVodInfo = async (match: FullMatch): Promise<VodInfo[]> => {
    const gameCount = match.maps.filter(map => map.statsId).length;
    const vods: VodInfo[] = [];

    for (let i = 1; i <= gameCount; i++) {
        const link = match.demos.find(demo => demo.name.includes(`Map ${i}`))?.link;

        if (link) {
            vods.push(await parseLink(link, match.maps[i - 1], i));
        }
    }
    return vods;
};

// Parse a link for a vod to extract the provider, url, start time and download urls.
const parseLink = async (link: string, map: MapResult, game: number): Promise<VodInfo> => {
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

    return { provider: provider, url: url, vodStart: vodStart, downloadUrls: await getDownloadUrls(url), map: map, game: game };
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

// Return a promise to download the vod from the given link.
const downloadVod = async (vodInfo: VodInfo, saveFolder: string): Promise<void> => {
    try {
        await calibrateVodStart(vodInfo, saveFolder);

        const approxDuration = approximateMapDuration(vodInfo.map);
        const savePath = `${saveFolder}${vodInfo.game}.mp4`;

        if (vodInfo.provider == "Twitch") {
            await promiseExec(`ffmpeg -ss ${vodInfo.vodStart} -i "${vodInfo.downloadUrls[0]}" -to ${approxDuration} -c copy ${savePath}`);
        } else {
            await promiseExec(`ffmpeg -ss ${vodInfo.vodStart} -i "${vodInfo.downloadUrls[0]}" -ss ${vodInfo.vodStart} -i "${vodInfo.downloadUrls[1]}" -to ${approxDuration} -map 0:v -map 1:a -c:v libx264 -c:a aac ${savePath}`);
        }
    } catch (e) {
        console.error(e);
    }
};

// Find the actual start of the game and change the link to reflect this.
const calibrateVodStart = async (vodInfo: VodInfo, saveFolder: string): Promise<void> => {
    try {
        // Adding 20 seconds to the vodstart to ensure that the timer is visible on the first frame.
        vodInfo.vodStart += 20;

        // Downloading a single frame from the VOD.
        const fileName = `${saveFolder}${vodInfo.map.name}.jpg`;
        await promiseExec(`ffmpeg -ss ${vodInfo.vodStart} -i "${vodInfo.downloadUrls[0]}" -vframes 1 -q:v 2 ${fileName}`);

        // Cropping the downloaded frame to focus it on the scoreboard and the timer.
        const croppedFileName = `${saveFolder}${vodInfo.map.name}_cropped.jpg`;
        await sharp(fileName).extract({ width: 1280, height: 150, left: 0, top: 0 }).toFile(croppedFileName);

        const timeLeftOnFrame = await getRoundTime(croppedFileName);

        if (timeLeftOnFrame) {
            // Adjusting the start time based on the time left in the round on the first frame.
            vodInfo.vodStart = vodInfo.vodStart - (135 - timeLeftOnFrame);
        }
    } catch (e) {
        console.error(e);
    }
};

// Return the time left in the round in seconds on a specific frame of the VOD. 
const getRoundTime = async (framePath: string): Promise<number | void> => {
    // Creates a client
    const client = new vision.ImageAnnotatorClient({ keyFilename: "config/gcp_ocr.json" });

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
const approximateMapDuration = (map: MapResult): number => {
    // Example map result: 16:10.
    const roundCount = map.result?.slice(0, 5).trim().split(":").reduce((acc, current) => acc + (+current), 0);

    // A long round (with buy time) takes around 150 seconds. Adding 5 minutes for the halftime break.
    return roundCount ? (roundCount * 150) + 300 : 5000;
};

export { getRoundTime, downloadVods };