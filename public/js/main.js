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

    const response = await fetch(`/cache/${e.detail.search}`);
    
    if (response.ok) {
      const result = await response.json();
      
      if (result.result === 'success') {
        const cacheData = result.data;
        const repoName = cacheData.name;
        const url = cacheData.cacheinfo; 
        const forkCount = 0; // Replace with appropriate data if available

        this.divContent.appendChild(
          new RepoCard(repoName, url, e.detail.search, forkCount)
        );
      }
    } else {
      console.error('Cache entry not found or request failed.');
    }

    const repos = await getRepositories(e.detail.search);
    repos.forEach((element) => {
      let repoName = element.name;
      let url = element.html_url;
      let forkCount = element.forks;

      this.divContent.appendChild(
        new RepoCard(repoName, url, e.detail.search, forkCount)
      );
    });
  }

  async #show_repo(e) {
    this.divContent.innerHTML = "";
    this.divContent.style.gridTemplateColumns = 'repeat(2,1fr)';

    const forks = await getForks(e.detail.search_name, e.detail.repo_name);

    for (const repo of forks) {
      let search_name = e.detail.search_name;
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
