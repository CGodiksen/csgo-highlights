// import fs = require("fs");
// import { getHighlights, getDuration } from "./services/highlighter";
import { startScheduler } from "./services/scheduler";

// Adding new upcoming matches once every day and checking if any games are done every 15 minutes. 
startScheduler(1440, 15, 2);
// const demo = fs.readFileSync("data/demos/gambit-vs-virtus-pro-m1-vertigo.dem");
// void getDuration(demo).then(duration => console.log(duration));
// void getHighlights(demo).then(highlights => console.log(highlights));
