/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fs from "fs";
import path from "path";
import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
// import { FullMatch } from "hltv/lib/models/FullMatch";

// initialize the Youtube API library
const youtube = google.youtube('v3');

// "Upload" the video by saving it to the specified location under a match specific name.
const uploadHighlightVideo = async (videoPath: string): Promise<void> => {

    // const title = createTitle(match);
    // console.log(title, savePath);

    // const filePath = `${savePath}${title.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, "")}.mp4`;

    try {
        await upload(videoPath);
        // console.log(`"Uploaded" the highlight video at ${videoPath} to ${filePath}`);
    } catch (uploadError) {
        console.error(uploadError);
    }
};

// const createTitle = (match: FullMatch) => {
//     return `${match.team1!.name} vs ${match.team2!.name} - ${match.event.name}`;
// };

// very basic example of uploading a video to youtube
const upload = async (fileName: string): Promise<void> => {
    const auth = await getOAuth2Client();
    google.options({ auth });

    const res = await youtube.videos.insert(
        {
            part: ['id,snippet,status'],
            notifySubscribers: false,
            requestBody: {
                snippet: {
                    title: 'Another test',
                    description: 'Testing YouTube upload via Google APIs Node.js Client',
                },
                status: {
                    privacyStatus: 'private',
                },
            },
            media: {
                body: fs.createReadStream(fileName),
            },
        }
    );
    console.log(res.data);
};

const getOAuth2Client = async () => {
    const refreshPath = "config/refresh.json";
    const clientSecretPath = "config/client_secret.json";

    // If a refresh token is available then use it, otherwise create one by requesting access from the user.
    if (fs.existsSync(refreshPath)) {
        const clientSecret = JSON.parse(fs.readFileSync(clientSecretPath).toString());
        const auth = new google.auth.OAuth2(clientSecret.web.client_id, clientSecret.web.client_secret, clientSecret.web.redirect_uris[0]);

        const refreshToken = JSON.parse(fs.readFileSync(refreshPath).toString());
        auth.setCredentials({ refresh_token: refreshToken.refresh_token });

        return auth;
    } else {
        return await createNewToken(clientSecretPath, refreshPath);
    }
};

// Creating a new OAuth2 access token and saving the refresh token to the given refreshPath.
const createNewToken = async (clientSecretPath: string, refreshPath: string) => {
    const auth = await authenticate({
        keyfilePath: path.join(__dirname, `../${clientSecretPath}`),
        scopes: [
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtube',
        ],
    });

    fs.writeFileSync(refreshPath, JSON.stringify({ refresh_token: auth.credentials.refresh_token! }));

    return auth;
};

export { uploadHighlightVideo };