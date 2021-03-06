// TODO: Add a function that starts all the different scheduled jobs which can be called from index once the program starts.
// TODO: Once every 45 minutes a function should check if there are any new live games. 
// TODO: Once every 10 min a function should check if the live games are finished and ready to be processed.
// If so this part of the scheduler should start the processing phase from download to upload.
// This could perhaps also be done with jobs that are scheduled for specific times but that is less persistant and its hard to predict when a game is done.
import HLTV from 'hltv';
import fs = require("fs");
import { UpcomingMatch } from 'hltv/lib/models/UpcomingMatch';

const addUpcomingMatches = (dayLookahead: number): void => {
    void HLTV.getMatches().then(res => {
        const previousUpcomingMatches = fetchPreviousUpcomingMatches();

        // The limit for how far we look ahead when parsing upcoming matches.
        const epochLimit = Date.now() + (dayLookahead * 24 * 60 * 60 * 1000);
        let upcomingMatches = res.filter(match => !match.live && match.date && match.date < epochLimit && match.stars > 0);
        
        const previousUpcomingMatchesIds = previousUpcomingMatches.map(match => match.id);
        upcomingMatches = upcomingMatches.filter(match => !previousUpcomingMatchesIds.includes(match.id));
        
        fs.writeFileSync("./data/scheduler/upcoming.json", JSON.stringify(upcomingMatches.concat(previousUpcomingMatches)));
    });
};

// Return the upcoming matches currently in the upcoming.json file. If the file does not exist it is initialized with an empty list. 
const fetchPreviousUpcomingMatches = (): UpcomingMatch[] => {
    const file_path = "./data/scheduler/upcoming.json";
    if (!fs.existsSync(file_path)) {
        return [];
    }
    else {
        return JSON.parse(fs.readFileSync(file_path, "utf-8")) as UpcomingMatch[];
    }
};

// Return the time in milliseconds we expect a match with the given format to take.
const getTimeOffset = (format: string): number => {
    switch (format) {
        case "bo5":
            return 10800000;
        case "bo3":
            return 7200000;
        default:
            return 3600000;
    }
};

export { addUpcomingMatches, getTimeOffset };