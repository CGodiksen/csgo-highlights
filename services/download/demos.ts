import axios from 'axios';
import fse from "fs-extra";
import exec from 'child_process';
import { FullMatch } from 'hltv/lib/models/FullMatch';
import { Demo } from 'hltv/lib/models/Demo';

// Return the folder containing the downloaded demo files when done downloading and extracting.
const downloadDemos = async (match: FullMatch): Promise<string> => {
    console.log(`Downloading demos from ${match.id}...`);
    const saveFolder = `data/${match.id}/demos/`;

    try {
        const rarFile = await downloadDemoRar(match.demos, saveFolder);

        // Extracting the dem files from the downloaded rar and deleting it after.
        exec.execSync(`unrar e ${rarFile} ${saveFolder}`);
        fse.unlinkSync(rarFile);
    }
    catch (downloadDemoError) {
        console.error(downloadDemoError);
    }
    console.log(`Downloaded demos from ${match.id} to ${saveFolder}`);
    return saveFolder;
};

// Return the path to the demos rar file when the downloaded is done.
const downloadDemoRar = async (demos: Demo[], saveFolder: string): Promise<string> => {
    const demoURL = demos.find(demo => demo.name === "GOTV Demo")?.link;
    const savePath = `${saveFolder}demos.rar`;

    if (demoURL) {
        const res = await axios.get(`https://www.hltv.org${demoURL}`, { responseType: 'arraybuffer' });
        await fse.outputFile(savePath, res.data);

        return savePath;
    } else {
        throw "Could not find demo.";
    }
};

export { downloadDemos };