/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// TODO: Workflow should be downloadVods -> find the links that should be downloaded, for each link find the actual game start and
// estimate the max duration of the match. Then download each vod. 
// TODO: Add a function that first retrieves the first frame and finds when the game actually started in the vod.
// TODO: The vods should be faily precise so they start exactly at 00:20 or 00:00 on round 1.
import vision from '@google-cloud/vision';
import { FullMatch } from 'hltv/lib/models/FullMatch';

const downloadVods = (match: FullMatch): void => {
    const saveFolder = `data/${match.id}/vods/`;

    console.log(saveFolder);
    console.log(match);
    console.log(getVodLinks(match));
};

const getVodLinks = (match: FullMatch) => {
    const gameCount = match.maps.filter(map => map.statsId).length;
    const vodLinks: string | unknown[] = [];
    
    for (let i = 1; i <= gameCount; i++) {
        vodLinks.push(match.demos.find(demo => demo.name.includes(`Map ${i}`))?.link);
    }

    return vodLinks;
};

// Return the exact timestamp of when the game started in the VOD.
const findGameStart = (): void => {
    console.log(getRoundTime("./data/test.PNG"));
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