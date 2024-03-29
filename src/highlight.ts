// TODO: Remove irrelevant rounds (eco-rounds) and handle pauses.
import fs from "fs/promises";
import demofile = require("demofile");
import { Moment, Highlight, HighlightSpecification } from "./common/types";

interface Round {
    id: number;
    moments: Moment[];
}

// Return a highlight specification that describes the segments that should be included in a highlight video of the given demo.
const getHighlightSpecification = async (demoFolder: string, demoFile: string): Promise<HighlightSpecification> => {
    console.log(`Creating a highlight specification for the demo at ${demoFile}...`);

    const demo = await fs.readFile(`${demoFolder}${demoFile}`);
    const moments = await extractMoments(demo);
    calibrateMomentTimes(moments);

    const highlights: Highlight[] = [];
    const rounds = splitIntoRounds(moments);

    rounds.forEach(round => {
        cleanRoundMoments(round);

        // Only adding a highlight if there is more than two events left after cleaning (more than bomb plant and bomb explosion).
        if (round.moments.length > 2) {
            const start = round.moments[0].time - 5;
            const end = round.moments.slice(-1)[0].time + 5;

            highlights.push({ roundNumber: round.id, moments: round.moments, start: Math.round(start), duration: Math.round(end - start) });
        }
    });

    console.log(`Created a highlight specification with ${highlights.length} highlights from the demo at ${demoFile}`);
    return { demoFile: demoFile, highlights: highlights };
};

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

// Calibrate the time of the moments so the first round start happens at 0 seconds.
const calibrateMomentTimes = (moments: Moment[]): void => {
    const firstRoundStartTime = moments.find(moment => moment.event === "round_start")!.time;

    moments.forEach(moment => moment.time -= firstRoundStartTime);
};

const splitIntoRounds = (moments: Moment[]): Round[] => {
    let roundCounter = 1;
    let round: Round = { id: roundCounter, moments: [] };
    const rounds: Round[] = [];

    moments.forEach(moment => {
        if (moment.event === "round_end") {
            rounds.push(round);

            roundCounter += 1;
            round = { id: roundCounter, moments: [] };
        } else {
            round.moments.push(moment);
        }
    });

    return rounds;
};

// Removing moments from the given round that would decrease the viewing quality of the highlight.
const cleanRoundMoments = (round: Round): void => {
    round.moments = round.moments.filter(moment => moment.event !== "round_start");

    if (round.moments.length >= 2) {
        // Removing kills that are seperate from the actual highlight of the round.
        for (let i = 1; i >= 0; i--) {
            if (round.moments[i].event === "player_death" && (round.moments[i + 1].time - round.moments[i].time) > 30) {
                round.moments.splice(i, 1);
            }
        }

        // Removing the bomb explosion if the CT's are saving and nothing happens between bomb plant and explosion.
        if (round.moments.slice(-1)[0].event === "bomb_exploded" && round.moments.slice(-2)[0].event === "bomb_planted") {
            round.moments.splice(-1, 1);
        }
    }
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