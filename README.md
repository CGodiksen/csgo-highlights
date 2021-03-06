# CSGO Highlights
Automatically fetching, cutting and uploading highlight videos of professional Counter Strike: Global Offensive games.

## Design
### Need to have
- Should be able to take a video of a CSGO game and produce a highlight video only showing the sections of the game that are interesting to the user. 
- The program should first be able to create a specification of when everything happens (round starts, kills, round ends). Then based on that specification it should cut the original video down to a highlight video. 
- Another option to get the specification is to download the GOTV .dem file and use https://github.com/saul/demofile to retrieve all highlights. 
- The video of the game should be downloaded using https://docs.livestreamer.io/ and cut based on the specification using an ffmpeg based library. One option to cut the video is to cut out every separate clip and merge them together after.

### Nice to have
- Showing the final scoreboard for ~5 seconds when the game is done.
- Automatically creating a thumbnail for the game.
- Automatically uploading the highlight video to Youtube.
- Continuously search hltv for interesting games and automatically start the workflow that produces the final highlight video on youtube.
- Making highlight videos for different languages (dependent on what is available).
- Add videos to playlists for teams/tournaments.

### Workflow
Scheduler is constantly running and checking HLTV once per day to add upcoming matches that should be processed to upcoming.json. Every 10 minutes we check the upcoming matches
file to see if any of the games are done and ready to be fully processed. When a game is ready we call the processor with the game as parameter and start the full process.

The processor starts by calling the downloader and downloading the demo file. While this is happening we also start the process of downloaded the vods by first finding
the exact start time of each game in the vod and thereafter downloading each game. When the demo file is downloaded we can call the highlighter module and use it to get a
highlight specification. When we have this highlight specification and the games are done downloading we start the cutter that cuts each highlight out of the vods and
combines them into a single video.

While this is happening we can also start the uploader module which creates a thumbnail, title, descripion and so on for the new highlight video. When the cutter is done
and metadata has been collected we can upload the video using the Youtube API.

### Modules
#### hltv-scraper (maybe use https://github.com/gigobyte/HLTV) 
Should be able to scrape information (which games should be processed) and be able to get the download links for both the vods and the GOTV demo file.

#### scheduler
Should check hltv (with the above scraper) and based on the results schedule jobs (games that should be processed). These jobs should be saved to persistent storage.

#### processor
Should provide a “main” function for processing a match fully. The “main” in index.js is used to run the main event loop where the scheduler runs.

#### downloader
Provides functions to download GOTV demo and the specific sections of the correct twitch stream which contain the match(es).

#### highlights
Given a demo file it should be able to create a specification the clips that should be cut from the match video and merged together.

#### video-cutter
Given a match video and a highlight specification it should cut the video into a highlight video. It should also add the scoreboard for 5 seconds after the game.

#### youtube
Given a highlight video and the match page it should create a thumbnail, title, description, keywords and category and upload the video to youtube.
