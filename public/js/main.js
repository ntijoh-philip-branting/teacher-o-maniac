import {
  getRepositories,
  getForks,
  getRepositoryInfo,
  getRepositoryManifest,
} from "./api.js";

class MainComponent extends HTMLElement {
  static get observedAttributes() {
    return ["search", "repo_name", "repo_url", "search_name"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(this.#template());
    this.divContent = this.shadowRoot.querySelector(".content");
    this.addEventListener("searched", this.#search_item.bind(this));
    this.addEventListener("forked", this.#show_repo.bind(this));
  }

  async #search_item(e) {
    this.divContent.innerHTML = "";
    this.divContent.style.gridTemplateColumns = 'repeat(3,1fr)';

    const input_name = e.detail.search;
    let repos;

    try {
        const response = await fetch(`cache/${input_name}`);
        if (response.ok) {
            const data = await response.json(); // Parse the response
            console.log('Cache data:', data); // Log the full cache data for debugging

            // Ensure data is structured as expected
            if (data.result === 'success' && data.data && data.data.cacheinfo) {
                repos = data.data.cacheinfo; // Extract cacheinfo

                // Check if repos is a string and needs parsing
                if (typeof repos === 'string') {
                    repos = JSON.parse(repos);
                }

                // Ensure repos is an array, even if it's just a single object
                if (!Array.isArray(repos)) {
                    repos = [repos]; // Wrap in array if it's not already an array
                }
            } else {
                throw new Error('Invalid cache data structure');
            }
        } else {
            throw new Error('Failed to fetch from cache');
        }
    } catch (error) {
        console.log('Error fetching from cache:', error);

        // Fetch from the GitHub API if cache is not available
        repos = await getRepositories(input_name);

        // Insert the fetched repositories into the database by POSTing them to `/cache`
        await fetch('/cache', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: input_name,
                cacheinfo: repos, // Send the entire array of repositories to cache
            }),
        });
    }

    // Check if repos is defined before trying to iterate
    if (repos) {
        // Iterate through the repositories and display them
        repos.forEach((element) => {
            let repoName = element.name;
            let url = element.html_url;
            let forkCount = element.forks;

            // Add each repository to the content area
            this.divContent.appendChild(
                new RepoCard(repoName, url, input_name, forkCount)
            );
        });
    } else {
        console.error('No repositories found.');
    }
}



  async #show_repo(e) {
    this.divContent.innerHTML = "";
    this.divContent.style.gridTemplateColumns = 'repeat(2,1fr)';
    const input_name = e.detail.search_name;
    const forks = await getForks(input_name, e.detail.repo_name);

    

    for (const repo of forks) {
      let search_name = input_name;
      let repoName = repo.name;
      let url = repo.html_url;
      let full_name = repo.full_name;
      let owner = repo.owner.login

  
      // Declare manData here, to avoid scoping issues
      let manData = null;
      try {
        manData = await getRepositoryManifest(owner, e.detail.repo_name);

    } catch (error) {
        console.error(error);
        manData = null; // Set to null on failure
      }


      // Use manData, whether fetched successfully or set to 404
      this.divContent.appendChild(new ForkList(full_name, repoName, manData, url));
    }
  }
  

  #template() {
    const template = document.createElement("template");
    template.innerHTML = `

            <style>
                .content{
                
                display:grid;
                grid-template-columns: repeat(3,1fr);
                justify-items: center;
                row-gap: 20px;
                
                }
            </style>

            <search-item></search-item>
            <div class="content">

            </div>

  
        `;
    return template.content.cloneNode(true);
  }
}

window.customElements.define("main-component", MainComponent);
