/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// TODO: Add a function that can retrieve all vods of the match based on a match id.
// TODO: Add a function that first retrieves the first frame and finds when the game actually started in the vod.
// TODO: The vods should be faily precise so they start exactly at 00:20 or 00:00 on round 1.
import axios from 'axios';
import fse from "fs-extra";
import vision from '@google-cloud/vision';
import { FullMatch } from 'hltv/lib/models/FullMatch';
import { Demo } from 'hltv/lib/models/Demo';

// TODO: Make the function extract the files from the zip file and delete the original zip file.
const downloadDemo = (match: FullMatch): Promise<string> => {
    // TODO: This should not be hardcoded.
    const saveFolder = `data/2306295/`;

    return new Promise(resolve => {
        downloadDemoZip(match.demos, saveFolder)
            .then(zipFile => {
                resolve(zipFile);
            })
            .catch(e => console.log(e));
    });
};

const downloadDemoZip = (demos: Demo[], saveFolder: string): Promise<string> => {
    const demoURL = demos.find(demo => demo.name === "GOTV Demo")?.link;
    const savePath = `${saveFolder}demos.zip`;

    if (demoURL) {
        return new Promise(resolve => {
            axios.get(`https://www.hltv.org${demoURL}`, {
                responseType: 'arraybuffer',
            }).then(res => {
                console.log(res);
                fse.outputFile(savePath, res.data)
                    .then(() => resolve(savePath))
                    .catch(e => console.log(e));
            }).catch(e => console.log(e));
        });
    } else {
        throw "Could not find demo.";
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