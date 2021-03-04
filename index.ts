import fs = require("fs");
import { getDuration, getMoments } from "./services/highlights";

const demo = fs.readFileSync("data/demos/gambit-vs-virtus-pro-m1-vertigo.dem");

void getDuration(demo).then(duration => console.log(duration));
void getMoments(demo).then(moments => console.log(moments));