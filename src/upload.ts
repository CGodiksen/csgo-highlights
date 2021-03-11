import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
const OAuth2 = google.auth.OAuth2;
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_DIR = 'credentials/';
const TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs.json';

import { FullMatch } from "hltv/lib/models/FullMatch";
import { OAuth2Client } from 'googleapis-common';
import { Credentials } from 'google-auth-library';

interface Installed {
    client_id: string,
    project_id: string,
    auth_uri: string,
    token_uri: string,
    auth_provider_x509_cert_url: string,
    client_secret: string,
    redirect_uris: string[]
}

interface Credential {
    installed: Installed
}

const uploadHighlightVideo = (videoPath: string, match: FullMatch): void => {
    console.log(videoPath, match);
    const title = createTitle(match);
    console.log(title);
    setupYoutubeAPI();

    // TODO: Based on the match create a title for the video.
    // TODO: Upload the highlight video with the created title.
    // TODO: Add the video to a playlist for the event and for the teams.
};

const createTitle = (match: FullMatch) => {
    return `${match.team1!.name} vs ${match.team2!.name} - ${match.event.name} - HIGHLIGHTS | CSGO`;
};

const setupYoutubeAPI = () => {
    // Load client secrets from a local file.
    fs.readFile('config/client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ', err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        const oAuth2Client = authorize(JSON.parse(content.toString()));
        console.log(oAuth2Client);
    });
};

// Create an OAuth2 client with the given credentials.
const authorize = (credentials: Credential): OAuth2Client => {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            return getNewToken(oauth2Client);
        } else {
            oauth2Client.credentials = JSON.parse(token.toString()) as Credentials;
            return oauth2Client;
        }
    });
    return oauth2Client;
};

// Get and store new token after prompting for user authorization.
const getNewToken = (oauth2Client: OAuth2Client): OAuth2Client => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    console.log('Authorize this app by visiting this url: ', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token!;
            storeToken(token!);
        });
    });
    return oauth2Client;
};

// Store token to disk be used in later program executions.
const storeToken = (token: Credentials) => {
    if (!fs.existsSync(TOKEN_DIR)) {
        fs.mkdirSync(TOKEN_DIR);
    }

    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) throw err;
        console.log('Token stored to ' + TOKEN_PATH);
    });
};

export { uploadHighlightVideo };