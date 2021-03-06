/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// TODO: Add a function that can retrieve a demo file based on a match id
// TODO: Add a function that can retrieve all vods of the match based on a match id.
// TODO: The vods should be faily precise so they start exactly at 00:20 or 00:00 on round 1.
require('dotenv');
import vision from '@google-cloud/vision';
//import HLTV from 'hltv';

const downloadDemo = (): void => {
    // Creates a client
    const client = new vision.ImageAnnotatorClient();

    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    const fileName = "./data/test.PNG";

    // Performs text detection on the local file
    client.textDetection(fileName).then(result => {
        const detections = result[0].textAnnotations;
        console.log('Text:');
    
        if (detections) {
            detections.forEach(text => console.log(text));
        }
    });
};

export { downloadDemo };