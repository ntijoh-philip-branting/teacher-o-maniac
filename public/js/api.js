import { getAuthToken } from "./private.js";
const authToken = getAuthToken();

async function index() {
  // Handle all repositories form submission
  const mainForm = document.querySelector("#github-form");
  mainForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Submitting API request for all repositories");

    let formData = new FormData(mainForm);
    let username = formData.get("username"); // Correctly retrieve the username

    console.log("Username Submitted:", username); // Debugging line
    await getRepositories(username);
  });

  // Handle specific repository form submission
  const repoForm = document.querySelector("#rep-github-form");
  repoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Submitting API request for specific repository");

    let formData = new FormData(repoForm);
    let username = formData.get("username"); // Retrieve the username
    let repository = formData.get("repository"); // Retrieve the repository name

    console.log("Username Submitted:", username); // Debugging line
    console.log("Repository Submitted:", repository); // Debugging line
    await getRepositoryInfo(username, repository); // Call the function to get repo info
    getRepositoryManifest(username, repository);
  });
}

async function getRepositories(username) {
  const reposUrl = `https://api.github.com/users/${username}/repos`;
  try {
    const response = await fetch(reposUrl, {
      method: "GET",
      headers: {
        Authorization: `token ${authToken}`, // Include the auth token in the headers
        Accept: "application/vnd.github.v3+json",
      },
    });

    console.log(`Response: ${response.status}`); // Log the status code

    if (response.status === 404) {
      console.log(`User ${username} does not exist.`);
      document.getElementById(
        "status-text"
      ).textContent = `User ${username} does not exist.`;
      return;
    }

    if (response.ok) {
      const repos = await response.json();
      if (repos.length === 0) {
        console.log(`${username} has no public repositories.`);
        document.getElementById(
          "status-text"
        ).textContent = `${username} has no public repositories.`;
      } else {
        let repoText = "";
        console.log(`${username}'s Repositories:`);
        repos.forEach((repo) => {
          console.log(`- ${repo.name}`);
          repoText += `- ${repo.name}\n`;
        });
        document.getElementById("status-text").textContent = `${repoText}`;
      }
    } else {
      console.error(`Failed to fetch repositories. Status: ${response.status}`);
      document.getElementById(
        "status-text"
      ).textContent = `Failed to fetch repositories. Status: ${response.status}`;
    }
  } catch (error) {
    console.error("Error fetching from GitHub API:", error);
    document.getElementById("status-text").textContent =
      "Error fetching from GitHub API.";
  }
}

async function getRepositoryInfo(username, repository) {
  const repoUrl = `https://api.github.com/repos/${username}/${repository}`; // URL to fetch repo info
  const contentsUrl = `https://api.github.com/repos/${username}/${repository}/contents`; // URL to fetch contents of the root directory

  try {
    // Fetch repository info
    const repoResponse = await fetch(repoUrl, {
      method: "GET",
      headers: {
        Authorization: `token ${authToken}`, // Include the auth token in the headers
        Accept: "application/vnd.github.v3+json",
      },
    });

    // Fetch root directory contents
    const contentsResponse = await fetch(contentsUrl, {
      method: "GET",
      headers: {
        Authorization: `token ${authToken}`, // Include the auth token in the headers
        Accept: "application/vnd.github.v3+json",
      },
    });

    // Handle repository info response
    if (repoResponse.status === 404) {
      console.log(
        `Repository ${repository} does not exist for user ${username}.`
      );
      document.getElementById(
        "rep-status-text"
      ).textContent = `Repository ${repository} does not exist for user ${username}.`;
      return;
    }

    if (repoResponse.ok) {
      const repoInfo = await repoResponse.json(); // Fetch repository info
      console.log(`Repository Name: ${repoInfo.name}`); // Log the repo name
      console.log(`Description: ${repoInfo.description}`); // Log the repo description
      console.log(`Stars: ${repoInfo.stargazers_count}`); // Log the star count
      console.log(`Forks: ${repoInfo.forks_count}`); // Log the fork count

      // Display repository information
      document.getElementById("rep-status-text").textContent =
        `Repository: ${repoInfo.name}\n` +
        `Description: ${
          repoInfo.description || "No description available."
        }\n` +
        `Stars: ${repoInfo.stargazers_count}\n` +
        `Forks: ${repoInfo.forks_count}`;
    } else {
      console.error(
        `Failed to fetch repository info. Status: ${repoResponse.status}`
      );
      document.getElementById(
        "rep-status-text"
      ).textContent = `Failed to fetch repository info. Status: ${repoResponse.status}`;
    }

    // Handle contents response
    if (contentsResponse.ok) {
      const contents = await contentsResponse.json(); // Fetch the root directory contents
      console.log(`Contents of the root directory for ${repository}:`);

      let contentsText = "";
      contents.forEach((item) => {
        console.log(`- ${item.name} (${item.type})`);
        contentsText += `- ${item.name} (${item.type})\n`;
      });

      // Append the root directory contents to the repository info
      document.getElementById(
        "rep-status-text"
      ).textContent += `\nContents of the root directory:\n${contentsText}`;
    } else {
      console.error(
        `Failed to fetch root directory contents. Status: ${contentsResponse.status}`
      );
      document.getElementById(
        "rep-status-text"
      ).textContent += `\nFailed to fetch root directory contents. Status: ${contentsResponse.status}`;
    }
  } catch (error) {
    console.error("Error fetching from GitHub API:", error);
    document.getElementById("rep-status-text").textContent =
      "Error fetching from GitHub API.";
  }
}

async function fetchFile(username, repository, filePath) {
  const fileUrl = `https://api.github.com/repos/${username}/${repository}/contents/${filePath}`;

  try {
    const response = await fetch(fileUrl, {
      method: "GET",
      headers: {
        Authorization: `token ${authToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (response.ok) {
      const fileData = await response.json();
      return JSON.parse(atob(fileData.content)); // Decode and parse the base64 content
    } else {
      console.error(`Error fetching file ${filePath}: ${response.status}`);
      return null; // Return null for error handling
    }
  } catch (error) {
    console.error("Caught error whilst attempting to fetch file:", error);
    return null; // Return null for error handling
  }
}

async function getRepositoryManifest(username, repository) {
  const manifestFilePath = ".manifest.json"; // The known manifest file name
  const repoManifest = await fetchFile(username, repository, manifestFilePath);

  if (repoManifest) {
    console.log(`Repository Manifest Data:`, repoManifest);

    // Check if there's a filePath key in the manifest and fetch that file's content
    if (repoManifest.filePath) {
      const scriptFileData = await fetchFile(
        username,
        repository,
        repoManifest.filePath
      );
      if (scriptFileData) {
        console.log(
          `Additional Data from ${repoManifest.filePath}:`,
          scriptFileData
        );

        // Display the additional data in the <pre> tag
        document.getElementById("manifest-data").textContent = JSON.stringify(
          scriptFileData,
          null,
          2
        ); // Pretty print JSON
      } else {
        console.log(`No additional data found in ${repoManifest.filePath}`);
        document.getElementById("manifest-data").textContent =
          "No additional data found in the specified file.";
      }
    } else {
      console.log(`No filePath key found in the manifest data.`);
      document.getElementById("manifest-data").textContent =
        "No filePath key found in the manifest data.";
    }
  } else {
    console.log(
      `Repository ${repository} at User ${username} does not have a Manifest.json file.`
    );
    document.getElementById("manifest-data").textContent =
      "No Manifest.json file found.";
  }
}

window.onload = function () {
  index();
};
