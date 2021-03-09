// TODO: Remove irrelevant rounds (eco-rounds)
import fs from "fs";
import demofile = require("demofile");
import { Moment, Highlight } from "./common/types";

interface Round {
    id: number
    moments: Moment[]
}

interface HighlightSpecification {
    demoFile: string
    highlights: Highlight[] 
}

// Return a highlight specification that describes the segments that should be included in a highlight video of the given demo.
const getHighlightSpecification = (demoFolder: string, demoFile: string): Promise<HighlightSpecification> => new Promise(resolve => {
    console.log(`Creating a highlight specification for the demo at ${demoFile}...`);

    const demo = fs.readFileSync(`${demoFolder}${demoFile}`);
    extractMoments(demo).then(moments => {
        const highlights: Highlight[] = [];
        const rounds = splitIntoRounds(moments);

        rounds.forEach(round => {
            const withoutStart: Moment[] = round.moments.filter(moment => moment.event !== "round_start");

            // Only adding a highlight if there is more than two events (more than bomb plant and bomb explosion).
            if (withoutStart.length > 2) {
                // Removing kills that are seperate from the actual highlight of the round.
                for (let i = 1; i >= 0; i--) {
                    if (withoutStart[i].event === "player_death" && (withoutStart[i + 1].time - withoutStart[i].time) > 30) {
                        withoutStart.splice(i, 1);
                    }
                }
                
                // Removing the bomb explosion if the other team is saving and nothing happens between bomb plant and explosion.
                if (withoutStart.slice(-1)[0].event === "bomb_exploded" && withoutStart.slice(-2)[0].event === "bomb_planted") {
                    withoutStart.splice(-1, 1);
                }
                
                const start = withoutStart[0].time - 5;
                const end = withoutStart.slice(-1)[0].time + 5;

                highlights.push({ roundNumber: round.id, moments: withoutStart, start: start, end: end });
            }
        });

        console.log(`Created a highlight specification with ${highlights.length} highlights from the demo at ${demoFile}`);
        resolve({ demoFile: demoFile, highlights: highlights});
    })
    .catch(e => console.log(e));
});

const extractMoments = (demo: Buffer): Promise<Moment[]> => new Promise(resolve => {
    const moments: Moment[] = [];

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

const splitIntoRounds = (moments: Moment[]): Round[] => {
    let round: Round = { id: 1, moments: [] };
    let roundCounter = 0;
    const rounds: Round[] = [];

    moments.forEach(moment => {
        if (moment.event === "round_end") {
            rounds.push(round);
            roundCounter += 1;
            round = { id: roundCounter, moments: [] };
        } else {
            round = { id: round.id, moments: round.moments.concat(moment) };
        }
    });

    return rounds;
};

const getDuration = (demo: Buffer): Promise<number> => new Promise(resolve => {
    const demoFile = new demofile.DemoFile();

    demoFile.on("start", ({ cancel }) => {
        const duration: number = demoFile.header.playbackTime;
        cancel();
        resolve(duration);
    });

    demoFile.parse(demo);
});

export { getHighlightSpecification, getDuration };