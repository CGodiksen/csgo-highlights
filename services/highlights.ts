import fs from "fs";
import demofile from "demofile";

fs.readFile("test.dem", (_err, buffer) => {
  const demoFile = new demofile.DemoFile();

  demoFile.gameEvents.on("player_death", e => {
    console.log(e);
    
    const victim = demoFile.entities.getByUserId(e.userid);
    const victimName = victim ? victim.name : "unnamed";

    // Attacker may have disconnected so be aware. e.g. attacker could have thrown a grenade, disconnected, 
    // then that grenade killed another player.
    const attacker = demoFile.entities.getByUserId(e.attacker);
    const attackerName = attacker ? attacker.name : "unnamed";

    const headshotText = e.headshot ? " HS" : "";
    
    console.log(`${attackerName} [${e.weapon}${headshotText}] ${victimName}`);
  });

  demoFile.parse(buffer);
});