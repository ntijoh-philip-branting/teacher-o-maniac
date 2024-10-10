import { getAuthToken } from "./private.js";
const authToken = getAuthToken();

export async function index() {
  const mainForm = document.querySelector("#github-form");
  mainForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(mainForm);
    const username = formData.get("username");
    console.log("Submitting API request for all repositories");
    await getRepositories(username);
  });

  const repoForm = document.querySelector("#rep-github-form");
  repoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(repoForm);
    const username = formData.get("username");
    const repository = formData.get("repository");
    console.log("Submitting API request for specific repository");
    await getRepositoryInfo(username, repository);
    await getRepositoryManifest(username, repository);
  });
}

export async function getRepositories(username) {
  const reposUrl = `https://api.github.com/users/${username}/repos`;
  try {
    const response = await fetch(reposUrl, {
      method: "GET",
      headers: {
        Authorization: `token ${authToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (response.status === 404) {
      console.error(`User ${username} does not exist.`);
      return null;
    }

    if (response.ok) {
      return response.json();  // Return the raw JSON data
    } else {
      console.error(`Failed to fetch repositories. Status: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching from GitHub API:", error);
    return null;
  }
}

export async function getForks(username, repository) {
  const forksUrl = `https://api.github.com/repos/${username}/${repository}/forks`;
  try {
    const response = await fetch(forksUrl, {
      method: "GET",
      headers: {
        Authorization: `token ${authToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (response.ok) {
      return response.json();  // Return the raw JSON data
    } else {
      console.error(`Failed to fetch forks. Status: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching forks from GitHub API:", error);
    return null;
  }
}

export async function getRepositoryInfo(username, repository) {
  const repoUrl = `https://api.github.com/repos/${username}/${repository}`;
  const contentsUrl = `https://api.github.com/repos/${username}/${repository}/contents`;

  try {
    const [repoResponse, contentsResponse] = await Promise.all([
      fetch(repoUrl, {
        method: "GET",
        headers: {
          Authorization: `token ${authToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }),
      fetch(contentsUrl, {
        method: "GET",
        headers: {
          Authorization: `token ${authToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }),
    ]);

    if (repoResponse.status === 404) {
      console.error(`Repository ${repository} does not exist for user ${username}.`);
      return null;
    }

    if (repoResponse.ok && contentsResponse.ok) {
      return {
        repositoryInfo: await repoResponse.json(),  // Return raw JSON
        contents: await contentsResponse.json(),    // Return raw JSON
      };
    } else {
      console.error(`Failed to fetch repository info or contents.`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching from GitHub API:", error);
    return null;
  }
}

export async function fetchFile(username, repository, filePath) {
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
      const decodedContent = atob(fileData.content);  // Keep base64 decoding
      return decodedContent;  // Return decoded content
    } else {
      console.error(`Error fetching file ${filePath}: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching file:", error);
    return null;
  }
}

export async function getRepositoryManifest(username, repository) {
  const manifestFilePath = ".manifest.json";
  const repoManifest = await fetchFile(username, repository, manifestFilePath);

  if (repoManifest && repoManifest.filePath) {
    const scriptFileData = await fetchFile(username, repository, repoManifest.filePath);
    return {
      manifest: repoManifest,
      scriptData: scriptFileData || "No additional data found.",
    };
  } else {
    return null;
  }
}

window.onload = function () {
  index();
};
