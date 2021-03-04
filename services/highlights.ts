// TODO: Create a function that can take a filename for a demofile and return a highlight specification.
// TODO: Combine moments that are within 30 seconds of eachother (avoid too many cuts) and add 5 seconds before the first moment (maybe also after the last).
// TODO: If the bomb is planted but no kills happen the highlight video should show the bomb blowing up.
// TODO: Remove irrelevant moments (eco-rounds)
import fs = require("fs");
import demofile = require("demofile");

interface moment {
    event: string
    time: number
}

// interface highlight {
//     moments: moment[]
//     period: string
// }

// Return a list of highlights that describe the segments that should be included in a highlight video of the given demo.
const getHighlights = (): void => {
    const demo = fs.readFileSync("data/demos/gambit-vs-virtus-pro-m1-vertigo.dem");
    const rounds = getMoments(demo).then(moments => getRounds(moments));
    console.log(rounds);
};

// Return a list of moments that signify relevant events in the game.
const getMoments = (demo: Buffer): Promise<moment[]> => new Promise(resolve => {
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

const getRounds = (moments: moment[]) => {
    
}

const getDuration = (demo: Buffer): Promise<number> => new Promise(resolve => {
    const demoFile = new demofile.DemoFile();

    demoFile.on("start", ({ cancel }) => {
        const duration: number = demoFile.header.playbackTime;
        cancel();
        resolve(duration);
    });

    demoFile.parse(demo);
});

export { getMoments, getDuration };