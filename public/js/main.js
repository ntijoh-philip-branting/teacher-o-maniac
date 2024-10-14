import {
  getRepositories,
  getForks,
  getRepositoryInfo,
  getRepositoryManifest,
} from "./api.js";

import { getClientSecret, getClientID } from "./private.js";

class MainComponent extends HTMLElement {
  static get observedAttributes() {
    return ["search", "repoName", "repoUrl", "searchName", "redirectProfile"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(this.#template());
    this.divContent = this.shadowRoot.querySelector(".content");
    this.redirectProfile = this.getAttribute("redirectProfile") === "true";
    this.addEventListener("searched", this.#showSearch.bind(this));
    this.addEventListener("forked", this.#showFork.bind(this));
    this.addEventListener("profile-checked", this.#showProfile.bind(this));
  }

  connectedCallback() {
    console.log("Connected callback running");
    if (window.location.pathname === "/profile") {
      this.#showProfile();
    }
  }

  async #showProfile() {
    console.log("Running Show Profile");
    const userStatus = await this.#fetchUserStatus();

    if (!userStatus.logged_in) {
      const clientId = getClientID();
      const redirectUrl = "http://localhost:9292/callback";
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUrl
      )}&scope=user`;

      window.location.href = githubAuthUrl;
    } else {
      const profileElement = document.createElement("user-profile");
      document.body.innerHTML = "";
      document.body.appendChild(profileElement);
    }
  }

  async #showSearch(e) {
    console.log("Running Show Search");
    this.divContent.innerHTML = "";
    this.divContent.style.gridTemplateColumns = "repeat(3,1fr)";

    const inputName = e.detail.search;
    let repos;

    try {
      const response = await fetch(`cache/${inputName}`);
      if (response.ok) {
        const cache = await response.json();
        if (cache.result === "success" && cache.data) {
          repos = cache.data;

          if (typeof repos === "string") {
            repos = JSON.parse(repos);
          }

          if (!Array.isArray(repos)) {
            repos = [repos];
          }
        } else {
          console.log(`Incorrect datatype recieved, overwriting...`);
        }
      } else {
        console.log(
          `Cache response incorrect. Resuming backup generation for ${inputName}`
        );
      }
    } catch (error) {
      console.log(
        `Cache not found, generating new cache for user ${inputName}`
      );
    }

    if (!repos) {
      repos = await getRepositories(inputName);

      const repoString = JSON.stringify(repos);
      console.log(`Stringified JSON Array Data: ${repoString}`);

      this.#cacheData(inputName, repoString);
    }

    if (repos) {
      repos.forEach((element) => {
        let repoName = element.name;
        let url = element.html_url;
        let forkCount = element.forks;

        this.divContent.appendChild(
          new RepoCard(repoName, url, inputName, forkCount)
        );
      });
    } else {
      console.error("No repositories found.");
    }
  }

  async #showFork(e) {
    console.log("Running Show Fork");
    this.divContent.innerHTML = "";
    this.divContent.style.gridTemplateColumns = "repeat(2, 1fr)";
    const mainUser = e.detail.search_name;
    const mainRepo = e.detail.repo_name;

    let forks;

    try {
      const response = await fetch(`/cache/${mainRepo}?is_fork=true`);

      if (!response.ok) {
        throw new Error("Failed to fetch forks from the backend");
      }

      const jsonResponse = await response.json();

      if (jsonResponse.result === "error") {
        console.log(`Message: ${jsonResponse.message}`);
        forks = await getForks(mainUser, mainRepo);
        this.#cacheForks(forks, mainRepo);
      } else {
        console.log(`Returned: ${jsonResponse}`)
        forks = jsonResponse.data
      }
    } catch (error) {
      console.error("Error fetching forks from backend:", error);
      // If fetching fails, use getForks as a fallback
      forks = await getForks(mainRepo, e.detail.repoName);

      this.#cacheForks(forks, mainRepo);
    }

    // Get the repository manifest data
    let manData = null;
    let repoName = [];
    let url = [];
    let full_name = [];
    let owner = [];
    let i = 0;

    // Now that we have forks, let's save additional information for each
    for (const repo of forks) {

      if (repo && repo.name ) {  
        repoName.push(repo.name);
        url.push(repo.html_url);
        full_name.push(repo.full_name);
        owner.push(repo.owner.login);

      } else {
        console.error("Invalid repository data:", repo);
      }

      try {
        manData = await getRepositoryManifest(owner[i], repoName[i]); 
      } catch (error) {
        console.error(error);
        manData = null; // Set to null on failure
      }

      // Append the forked repo to the UI
      this.divContent.appendChild(new ForkList(full_name[i], manData, url[i]));
      i++;
    }
  }

  async #fetchUserStatus() {
    const response = await fetch("/api/user", { method: "GET" });

    if (response.ok) {
      const data = await response.json();
      if (data.logged_in) {
        console.log(`User ${data.user.username} already logged in`);
        return { logged_in: true, user: data.user };
      }
    }
    console.log(`No user logged in, requesting Logon`);
    return { logged_in: false, user: null };
  }

  async #cacheForks(forks, forkOf) {
    forks.forEach((fork) => {
      console.log(`Caching data of fork ${fork.full_name}`);
      this.#cacheData(fork.full_name, JSON.stringify(fork), forkOf);
    });
  }

  async #cacheData(name, data, forkOf = "none") {
    const cacheData = new FormData();
    cacheData.append("name", name);
    cacheData.append("cacheinfo", data);
    if (forkOf != "none") {
      cacheData.append("fork_of", forkOf);
    }

    await fetch("/cache", {
      method: "POST",
      body: cacheData,
    });
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
