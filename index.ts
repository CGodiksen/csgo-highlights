import fs = require("fs");
import { getHighlights } from "./services/highlights";

const demo = fs.readFileSync("data/demos/gambit-vs-virtus-pro-m1-vertigo.dem");

// void getDuration(demo).then(duration => console.log(duration));
void getHighlights(demo);