// TODO: Create a function that can take a filename for a demofile and return a highlight specification.
// TODO: Parse through the demofile and find all "moments" (kills, bomb plants, bomb defusals, round ends, etc.)
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

// const getHighlights = (): moment[] => {
//     getMoments();
// };

const getMoments = new Promise(resolve => {
    const data = fs.readFileSync("data/demos/gambit-vs-virtus-pro-m1-vertigo.dem");
    const moments: moment[] = [];

    const demoFile = new demofile.DemoFile();

    demoFile.gameEvents.on("player_death", _e => {
        moments.push({ event: "player_death", time: demoFile.currentTime });
    });

    demoFile.once("end", _e => {
        resolve(moments);
    });

    demoFile.parse(data);
});

const getDuration = new Promise(resolve => {
    const data = fs.readFileSync("data/demos/gambit-vs-virtus-pro-m1-vertigo.dem");
    const demoFile = new demofile.DemoFile();

    demoFile.on("start", ({ cancel }) => {
        const duration: number = demoFile.header.playbackTime;
        cancel();
        resolve(duration);
    });

    demoFile.parse(data);
});

export { getMoments, getDuration };