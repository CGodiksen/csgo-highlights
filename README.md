# CSGO Highlights
Automatically fetching, cutting and uploading highlight videos of professional Counter Strike: Global Offensive games.

## Workflow
Scheduler is constantly running and checking HLTV.org once per day to add upcoming matches that should be processed to persistant storage. Every 15 minutes we check the upcoming matches file to see if any of the games are done and ready to be fully processed. When a game is ready we call the processor and start the full process.

The processor starts by downloading the demo file. Concurrently, we also start the process of downloading the VODs by first finding the exact start time of each game in the VOD and thereafter downloading each game. When the demo files are downloaded, we can call the highlight module and use it to get a highlight specification. When we have this highlight specification and the games are done downloading, we start the editor that cuts each highlight out of the VODs and combines them into a single video.

While this is happening we also start the upload module which creates metadata for the new highlight video. When the editor is done and metadata has been collected we can upload the video using the Youtube API. Note that currently the tool just saves the highlight video locally.
