/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// TODO: Add a function that can retrieve a demo file based on a match id
// TODO: Add a function that can retrieve all vods of the match based on a match id.
// TODO: Add a function that first retrieves the first frame and finds when the game actually started in the vod.
// TODO: The vods should be faily precise so they start exactly at 00:20 or 00:00 on round 1.
require('dotenv');
import vision from '@google-cloud/vision';
//import HLTV from 'hltv';

const downloadDemo = (): void => {
    console.log();
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

export { downloadDemo, findGameStart };