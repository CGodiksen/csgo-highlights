// TODO: Remove irrelevant rounds (eco-rounds)
import demofile = require("demofile");

interface moment {
    event: string
    time: number
}

interface round {
    id: number
    moments: moment[]
}

interface highlight {
    roundNumber: number
    moments: moment[]
    start: number
    end: number
}

// Return a list of highlights that describe the segments that should be included in a highlight video of the given demo.
const getHighlights = (demo: Buffer): Promise<highlight[]> => new Promise(resolve => {
    void extractMoments(demo).then(moments => {
        const highlights: highlight[] = [];
        const rounds = splitIntoRounds(moments);

        rounds.forEach(round => {
            const withoutStart: moment[] = round.moments.filter(moment => moment.event !== "round_start");

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

        resolve(highlights);
    });
});

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

const splitIntoRounds = (moments: moment[]): round[] => {
    let round: round = { id: 1, moments: [] };
    let roundCounter = 0;
    const rounds: round[] = [];

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

export { getHighlights, getDuration };