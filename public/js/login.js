import { getClientSecret, getClientID } from "./private.js";

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('github-login').addEventListener('click', function() {
        // Replace with your GitHub OAuth App Client ID and redirect URI
        const clientId = getClientID();  // Call the function to get the Client ID
        const redirectUri = 'http://localhost:9292/callback';  // Your full callback URL

        // Construct the GitHub OAuth URL
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user`;

        // Redirect the user to GitHub's OAuth page
        window.location.href = githubAuthUrl;
    });
});
