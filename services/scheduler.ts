// TODO: Add a function that looks at upcoming matches for a given time period and saves all matches that should be processed.
// It should only add matches that have atleast one star.
// TODO: The function should use HLTV.getMatches and save the ID and date to a JSON file. 
import HLTV from 'hltv';

const addUpcomingMatches = (): void => {
    void HLTV.getMatches().then(res => {
        console.log(res);
    });
};

export { addUpcomingMatches };