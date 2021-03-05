// import fs = require("fs");
// import { getHighlights, getDuration } from "./services/highlighter";
import { addUpcomingMatches } from "./services/scheduler";


addUpcomingMatches(5);
// const demo = fs.readFileSync("data/demos/gambit-vs-virtus-pro-m1-vertigo.dem");
// void getDuration(demo).then(duration => console.log(duration));
// void getHighlights(demo).then(highlights => console.log(highlights));
