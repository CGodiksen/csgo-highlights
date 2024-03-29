import axios from 'axios';
import fs from "fs/promises";

import { FullMatch } from 'hltv/lib/models/FullMatch';
import { Demo } from 'hltv/lib/models/Demo';
import {promiseExec} from "../common/functions";

// Return a promose to deliver the demo files folder when done downloading.
const downloadDemos = async (match: FullMatch): Promise<string> => {
    console.log(`Downloading demos from match ${match.id}...`);
    
    const saveFolder = `data/${match.id}/demos/`;
    try {
        const rarFile = await downloadDemoRar(match.demos, saveFolder);

        // Extracting the dem files from the downloaded rar and deleting it after.
        await promiseExec(`unrar e ${rarFile} ${saveFolder}`);
        await fs.unlink(rarFile);
    }
    catch (downloadDemoError) {
        console.error(downloadDemoError);
    }

    console.log(`Downloaded demos from match ${match.id} to ${saveFolder}`);
    return saveFolder;
};

// Return the path to the demos rar file when the downloaded is done.
const downloadDemoRar = async (demos: Demo[], saveFolder: string): Promise<string> => {
    const demoURL = demos.find(demo => demo.name === "GOTV Demo")?.link;
    const savePath = `${saveFolder}demos.rar`;

    if (demoURL) {
        const res = await axios.get(`https://www.hltv.org${demoURL}`, { responseType: 'arraybuffer' });
        await fs.writeFile(savePath, res.data);

        return savePath;
    } else {
        throw "Could not find demo.";
    }
};

export { downloadDemos };