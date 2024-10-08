import {getAuthToken} from 'private.js';
const authToken = getAuthToken()

async function index() {
    // Handle all repositories form submission
    const mainForm = document.querySelector('#github-form');
    mainForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Submitting API request for all repositories");

        let formData = new FormData(mainForm);
        let username = formData.get('username'); // Correctly retrieve the username

        console.log("Username Submitted:", username); // Debugging line
        await getRepositories(username);
    });

    // Handle specific repository form submission
    const repoForm = document.querySelector('#rep-github-form');
    repoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Submitting API request for specific repository");

        let formData = new FormData(repoForm);
        let username = formData.get('username'); // Retrieve the username
        let repository = formData.get('repository'); // Retrieve the repository name

        console.log("Username Submitted:", username); // Debugging line
        console.log("Repository Submitted:", repository); // Debugging line
        await getRepositoryInfo(username, repository); // Call the function to get repo info
    });
}

async function getRepositories(username) {
    const reposUrl = `https://api.github.com/users/${username}/repos`;
    try {
        const response = await fetch(reposUrl, {
            method: 'GET',
            headers: {
                'Authorization': `token ${authToken}`, // Include the auth token in the headers
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        console.log(`Response: ${response.status}`); // Log the status code

        if (response.status === 404) {
            console.log(`User ${username} does not exist.`);
            document.getElementById('status-text').textContent = `User ${username} does not exist.`;
            return;
        }

        if (response.ok) {
            const repos = await response.json();
            if (repos.length === 0) {
                console.log(`${username} has no public repositories.`);
                document.getElementById('status-text').textContent = `${username} has no public repositories.`;
            } else {
                let repoText = '';
                console.log(`${username}'s Repositories:`);
                repos.forEach(repo => {
                    console.log(`- ${repo.name}`);
                    repoText += `- ${repo.name}\n`;
                });
                document.getElementById('status-text').textContent = `${repoText}`;
            }
        } else {
            console.error(`Failed to fetch repositories. Status: ${response.status}`);
            document.getElementById('status-text').textContent = `Failed to fetch repositories. Status: ${response.status}`;
        }
    } catch (error) {
        console.error('Error fetching from GitHub API:', error);
        document.getElementById('status-text').textContent = 'Error fetching from GitHub API.';
    }
}

async function getRepositoryInfo(username, repository) {
    const repoUrl = `https://api.github.com/repos/${username}/${repository}`; // URL to fetch specific repo info
    try {
        const response = await fetch(repoUrl, {
            method: 'GET',
            headers: {
                'Authorization': `token ${authToken}`, // Include the auth token in the headers
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        console.log(`Response: ${response.status}`); // Log the status code

        if (response.status === 404) {
            console.log(`Repository ${repository} does not exist for user ${username}.`);
            document.getElementById('rep-status-text').textContent = `Repository ${repository} does not exist for user ${username}.`;
            return;
        }

        if (response.ok) {
            const repoInfo = await response.json(); // Fetch the repository info
            console.log(`Repository Name: ${repoInfo.name}`); // Log the repo name
            console.log(`Description: ${repoInfo.description}`); // Log the repo description
            console.log(`Stars: ${repoInfo.stargazers_count}`); // Log the star count
            console.log(`Forks: ${repoInfo.forks_count}`); // Log the fork count

            // Display repository information
            document.getElementById('rep-status-text').textContent =
                `Repository: ${repoInfo.name}\n` +
                `Description: ${repoInfo.description || 'No description available.'}\n` +
                `Stars: ${repoInfo.stargazers_count}\n` +
                `Forks: ${repoInfo.forks_count}`;
        } else {
            console.error(`Failed to fetch repository info. Status: ${response.status}`);
            document.getElementById('rep-status-text').textContent = `Failed to fetch repository info. Status: ${response.status}`;
        }
    } catch (error) {
        console.error('Error fetching from GitHub API:', error);
        document.getElementById('rep-status-text').textContent = 'Error fetching from GitHub API.';
    }
}

// Call the index function to set up event listeners on page load
window.onload = function() {
    index();
}
