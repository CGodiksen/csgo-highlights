// TODO: Create a function that can take a filename for a demofile and return a highlight specification.
// TODO: Combine moments that are within 30 seconds of eachother (avoid too many cuts) and add 5 seconds before the first moment (maybe also after the last).
// TODO: If the bomb is planted but no kills happen the highlight video should show the bomb blowing up.
// TODO: Remove irrelevant moments (eco-rounds)
import demofile = require("demofile");

interface moment {
    event: string
    time: number
}

interface round {
    id: number
    moments: moment[]
}

// interface highlight {
//     moments: moment[]
//     period: string
// }

// Return a list of highlights that describe the segments that should be included in a highlight video of the given demo.
const getHighlights = (demo: Buffer): void => {
    void extractMoments(demo).then(moments => splitIntoRounds(moments)).then(rounds => {
        // Remove moments that are seperate from the other moments in the round.

    });
};

const extractMoments = (demo: Buffer): Promise<moment[]> => new Promise(resolve => {
    const moments: moment[] = [];

    const demoFile = new demofile.DemoFile();

    demoFile.gameEvents.on("player_death", _e => {
        moments.push({ event: "player_death", time: demoFile.currentTime });
    });

    demoFile.gameEvents.on("bomb_planted", _e => {
        moments.push({ event: "bomb_planted", time: demoFile.currentTime });
    });

    demoFile.gameEvents.on("bomb_defused", _e => {
        moments.push({ event: "bomb_defused", time: demoFile.currentTime });
    });

    demoFile.gameEvents.on("bomb_exploded", _e => {
        moments.push({ event: "bomb_exploded", time: demoFile.currentTime });
    });

    demoFile.gameEvents.on("round_start", _e => {
        moments.push({ event: "round_start", time: demoFile.currentTime });
    });

    demoFile.gameEvents.on("round_end", _e => {
        moments.push({ event: "round_end", time: demoFile.currentTime });
    });

    demoFile.once("end", _e => {
        resolve(moments);
    });

    demoFile.parse(demo);
});

const splitIntoRounds = (moments: moment[]): Promise<round[]> => new Promise(resolve => {
    let round: round = {id: 1, moments: []};
    let roundCounter = 0;
    const rounds: round[] = [];

    moments.forEach(moment => {
        if (moment.event === "round_end") {
            rounds.push(round);
            roundCounter += 1;
            round = {id: roundCounter, moments: []};
        } else {
            round = {id: round.id, moments: round.moments.concat(moment)};
        }
    });

    resolve(rounds);
});

const getDuration = (demo: Buffer): Promise<number> => new Promise(resolve => {
    const demoFile = new demofile.DemoFile();

    demoFile.on("start", ({ cancel }) => {
        const duration: number = demoFile.header.playbackTime;
        cancel();
        resolve(duration);
    });

    demoFile.parse(demo);
});

export { getHighlights, getDuration };