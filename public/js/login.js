import { getClientSecret, getClientID } from "./private.js";

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("github-login")
    .addEventListener("click", async function () {
      console.log("Attempting User Verification");
      const usr_status = await fetchUserStatus();

      if (usr_status === false) {
        // Replace with your GitHub OAuth App Client ID and redirect URI
        const clientId = getClientID(); // Call the function to get the Client ID
        const redirectUri = "http://localhost:9292/callback"; // Your full callback URL

        // Construct the GitHub OAuth URL
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user`;

        // Redirect the user to GitHub's OAuth page
        window.location.href = githubAuthUrl;
      } else if (usr_status === true) {
        const profileElement = document.createElement("profile-element");
        document.body.appendChild(profileElement);
      }
    });
});

async function fetchUserStatus() {
  const response = await fetch("/api/user", { method: "GET" });

  if (response.ok) {
    const data = await response.json();
    if (data.logged_in === true) {
      console.log(`User ${data.user} already logged in`);
      return true;
    }
  }
  console.log(`No user logged in, requesting Logon`);
  return false;
}
