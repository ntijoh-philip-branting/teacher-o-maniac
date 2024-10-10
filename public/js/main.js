class MainComponent extends HTMLElement {
  static get observedAttributes() {
    return ["search", "name", "repo_url"];
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
    console.log(e.detail.search);
    const repos = [
      {
        name: "Hello-World",
        html_url: "https://github.com/octocat/Hello-World",
      },
      { name: "Bye-Bitch", html_url: "https://github.com/octocat" },
    ]; // const repos = await getRepositories(e.detail.search)
    console.log(repos);
    repos.forEach((element) => {
      let repoName = element.name;
      let url = element.html_url;
      console.log(repoName);
      this.divContent.appendChild(new RepoCard(repoName, url));
    });
  }

  async #show_repo(e) {
    this.divContent.innerHTML = "";


    // Here should the function to get code example be
    const content = `function plus(){
    return 1+1;
  }
    
`


    this.divContent.appendChild(new ForkList(e.detail.name, e.detail.repo_url, content))
    console.log(e.detail.name);
    console.log(e.detail.repo_url);
  }

  #template() {
    const template = document.createElement("template");
    template.innerHTML = `

            <style>
                .content{
                
                display:grid;
                grid-template-columns: repeat(3,1fr);
                justify-items: center;
                align-items: cetner;
                
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
