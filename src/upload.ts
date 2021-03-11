import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
const OAuth2 = google.auth.OAuth2;
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_DIR = (process.env.HOME! || process.env.HOMEPATH! || process.env.USERPROFILE!) + '/.credentials/';
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

    // TODO: Based on the match create a title for the video.
    // TODO: Upload the highlight video with the created title 
};

const createTitle = (match: FullMatch) => {
    return `${match.team1!.name} vs ${match.team2!.name} - ${match.event.name} - HIGHLIGHTS | CSGO`;
};

// Create an OAuth2 client with the given credentials, and then execute the given callback function.
const authorize = (credentials: Credential): OAuth2Client => {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            return getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token.toString()) as Credentials;
            return oauth2Client;
        }
    });
};

export { uploadHighlightVideo };