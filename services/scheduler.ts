import HLTV from 'hltv';
import fs = require("fs");
import { UpcomingMatch } from 'hltv/lib/models/UpcomingMatch';

// Start the different jobs and runs them according to the given interval.
const startScheduler = (addUpcomingInterval: number, checkIfDoneInterval: number, dayLookahead: number): void => {
    console.log("Started scheduler:");
    console.log(`Checking upcoming matches every ${addUpcomingInterval} minutes with a ${dayLookahead} day lookahead`);
    console.log(`Checking if any upcoming matches are done every ${checkIfDoneInterval} minutes`);
    
    addUpcomingMatches(dayLookahead);
    
    setInterval(addUpcomingMatches.bind(null, dayLookahead), addUpcomingInterval * 60000);
    setInterval(checkIfDone, checkIfDoneInterval * 60000);
};

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

// Return the upcoming matches currently in the upcoming.json file. Return empty list if the file does not exist. 
const fetchPreviousUpcomingMatches = (): UpcomingMatch[] => {
    const file_path = "./data/scheduler/upcoming.json";
    if (!fs.existsSync(file_path)) {
        return [];
    }
    else {
        return JSON.parse(fs.readFileSync(file_path, "utf-8")) as UpcomingMatch[];
    }
};

// Checks if any games are done, and stars processing if they are ready.
const checkIfDone = (matches: UpcomingMatch[]): void => {
    matches.map(match => {
        if (match.date && match.format && match.date + getTimeOffset(match.format) < Date.now()) {
            void HLTV.getMatch({ id: match.id }).then(res => {
                if (res.demos && res.streams) {
                    // Start processing here.
                    console.log(res);
                }
            });
        }
    });
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

export { startScheduler };