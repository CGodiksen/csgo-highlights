// TODO: Add a function that looks at upcoming matches for a given time period and saves all matches that should be processed.
// It should only add matches that have atleast one star.
// TODO: The function should use HLTV.getMatches and save the ID and date to a JSON file. 
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