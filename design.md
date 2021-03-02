# Design
## Need to have
- Should be able to take a video of a CSGO game and produce a highlight video only showing the sections of the game that are interesting to the user. 
- The program should first be able to create a specification of when everything happens (round starts, kills, round ends). Then based on that specification it should cut the original video down to a highlight video. 
- Another option to get the specification is to download the GOTV .dem file and use https://github.com/saul/demofile to retrieve all highlights. 
- The video of the game should be downloaded using https://docs.livestreamer.io/ and cut based on the specification using an ffmpeg based library. One option to cut the video is to cut out every separate clip and merge them together after.

## Nice to have
- Showing the final scoreboard for ~5 seconds when the game is done.
- Automatically creating a thumbnail for the game.
- Automatically uploading the highlight video to Youtube.
- Continuously search hltv for interesting games and automatically start the workflow that produces the final highlight video on youtube.

## Workflow
Scheduled checks (once per day?) of the matches to check if there are any games that should be processed. If so then the processing is scheduled and saved in some kind of backlog.

The processing itself involves downloading the GOTV demo and the sections of the twitch stream that relate to the game(s). 
Then the GOTV demo should be processed to find all highlights and when they happened. This should then be further processed 
to get a specification of all the clips that are going to be used in the highlight video. This specification should be a start 
time and end time for each clip.Next the specification should be used to cut the clips out of the full video and merge them 
together into a highlight video.  Furthermore a scoreboard can be created and added as the last 5 seconds of the video. 

Based on the information from the match page on hltv (logos, tournament) a thumbnail and title should be created.The highlight 
video should then be uploaded to a Youtube channel.

## Modules
### hltv-scraper (maybe use https://github.com/gigobyte/HLTV) 
Should be able to scrape information (which games should be processed) and be able to get the download links for both the vods and the GOTV demo file.

### scheduler
Should check hltv (with the above scraper) and based on the results schedule jobs (games that should be processed). These jobs should be saved to persistent storage.

### processor
Should provide a “main” function for processing a match fully. The “main” in index.js is used to run the main event loop where the scheduler runs.

### downloader
Provides functions to download GOTV demo and the specific sections of the correct twitch stream which contain the match(es).

### highlights
Given a demo file it should be able to create a specification the clips that should be cut from the match video and merged together.

### video-cutter
Given a match video and a highlight specification it should cut the video into a highlight video. It should also add the scoreboard for 5 seconds after the game.

### youtube
Given a highlight video and the match page it should create a thumbnail, title, description, keywords and category and upload the video to youtube.
