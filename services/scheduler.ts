// TODO: Add a function that starts all the different scheduled jobs which can be called from index once the program starts.
// TODO: Once every hour the upcoming matches should be checked and if any of the games are live they should be moved to live game file. 
// TODO: Once every 1 min the other file should have it matches checked to see if they are done and can be processed. 
// If so this part of the scheduler should start the processing phase from download to upload.
// This could perhaps also be done with jobs that are scheduled for specific times but that is less persistant and its hard to predict when a game is done.
import HLTV from 'hltv';
import fs = require("fs");

const addUpcomingMatches = (dayLookhead: number): void => {
    void HLTV.getMatches().then(res => {
        // The limit for how far we look ahead when parsing upcoming matches.
        const epochLimit = Date.now() + (dayLookhead * 24 * 60 * 60 * 1000);

        const relevantMatches = res.filter(match => !match.live && match.date && match.date < epochLimit && match.stars > 0);

        const dir = "./data";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        fs.appendFile("./data/upcoming.json", JSON.stringify(relevantMatches), err => {
            if (err) throw err;
        });
    });
};

export { addUpcomingMatches };