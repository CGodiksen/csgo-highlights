/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// TODO: Add a function that can retrieve a demo file based on a match id
// TODO: Add a function that can retrieve all vods of the match based on a match id.
// TODO: Add a function that first retrieves the first frame and finds when the game actually started in the vod.
// TODO: The vods should be faily precise so they start exactly at 00:20 or 00:00 on round 1.
import axios from 'axios';
import vision from '@google-cloud/vision';
import { FullMatch } from 'hltv/lib/models/FullMatch';

const downloadDemo = (match: FullMatch): void => {
    const demoURL = match.demos.find(demo => demo.name === "GOTV Demo")?.link;
    const savePath = `./data/${match.id}/demos.zip`;

    if (demoURL) {
        void axios({
            url: `https://www.hltv.org${demoURL}`,
            method: 'GET',
            responseType: 'blob',
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', savePath);
            document.body.appendChild(link);
            link.click();
        });
    }
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