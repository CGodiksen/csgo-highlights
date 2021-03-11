import fs from "fs/promises";
import { startScheduler } from "./schedule";

void fs.mkdir("data/scheduler", { recursive: true });
startScheduler(1440, 15, 2);