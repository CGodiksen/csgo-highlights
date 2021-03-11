/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// import { getHighlights, getDuration } from "./services/highlighter";
// import { startScheduler } from "./services/scheduler";
// // Adding new upcoming matches once every day and checking if any games are done every 15 minutes. 
// startScheduler(1440, 15, 2);
// void getHighlights("data/demos/gambit-vs-virtus-pro-m1-vertigo.dem").then(highlights => console.log(highlights));


// import { downloadDemos } from "./services/download/demos";
// import HLTV from 'hltv';
// void HLTV.getMatch({ id: 2306295 }).then(res => {
//     downloadDemos(res)
//         .then(demoFolder => console.log(demoFolder))
//         .catch(e => console.log(e));
// });

// import { downloadVods } from "./services/download/vods";
// import HLTV from 'hltv';
// void HLTV.getMatch({ id: 2346587 }).then(res => {
//     void downloadVods(res);
// });

// import { processMatch } from "./process";
// void processMatch(2346587);

import HLTV from 'hltv';
import { uploadHighlightVideo } from "./upload";

void HLTV.getMatch({ id: 2346587 }).then(async res => {
    await uploadHighlightVideo("data/2346587/vods/highlights.mp4", res, "");
});