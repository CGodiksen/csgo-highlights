// TODO: Add a function that starts all the different scheduled jobs which can be called from index once the program starts.
// TODO: Once every 45 minutes a function should check if there are any new live games. 
// TODO: Once every 10 min a function should check if the live games are finished and ready to be processed.
// If so this part of the scheduler should start the processing phase from download to upload.
// This could perhaps also be done with jobs that are scheduled for specific times but that is less persistant and its hard to predict when a game is done.
import HLTV from 'hltv';
import fs = require("fs");
import { LiveMatch } from 'hltv/lib/models/LiveMatch';

const addUpcomingMatches = (): void => {
    void HLTV.getMatches().then(res => {
        const previousUpcomingMatches = fetchPreviousUpcomingMatches();
        const currentUpcomingMatches = res.filter(match => match.live && match.stars === 0) as LiveMatch[];
        
        const previousUpcomingMatchesIds = previousUpcomingMatches.map(match => match.id);
        const upcomingMatches = currentUpcomingMatches.filter(match => !previousUpcomingMatchesIds.includes(match.id)).concat(previousUpcomingMatches);

        fs.writeFileSync("./data/scheduler/upcoming.json", JSON.stringify(upcomingMatches));
    });
};

// Return the live matches currently in the live.json file. If the file does not exist it is initialized with an empty list. 
const fetchPreviousUpcomingMatches = (): LiveMatch[] => {
    const file_path = "./data/scheduler/live.json";
    if (!fs.existsSync(file_path)) {
        fs.writeFileSync("./data/scheduler/live.json", JSON.stringify([]));
        return [];
    }
    else {
        return JSON.parse(fs.readFileSync(file_path, "utf-8")) as LiveMatch[];
    }
};

export { addUpcomingMatches };