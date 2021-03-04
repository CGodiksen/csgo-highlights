// TODO: Create a function that can take a filename for a demofile and return a highlight specification.
// TODO: Parse through the demofile and find all "moments" (kills, bomb plants, bomb defusals, round ends, etc.)
// TODO: Combine moments that are within 30 seconds of eachother (avoid too many cuts) and add 5 seconds before the first moment (maybe also after the last).
// TODO: If the bomb is planted but no kills happen the highlight video should show the bomb blowing up.
// TODO: Remove irrelevant moments (eco-rounds)
import fs = require("fs");
import demofile = require("demofile");

const getHighlightSpecification = (): void => {
    fs.readFile("data/demos/gambit-vs-virtus-pro-m1-vertigo.dem", (_err, buffer) => {
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
};

export { getHighlightSpecification };