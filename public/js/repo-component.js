class ForkedEvent extends CustomEvent {
  constructor(repo_name, repo_url, search_name) {
    super("forked", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { repo_name: repo_name, repo_url: repo_url, search_name},
    });
  }
}

class RepoCard extends HTMLElement {
  constructor(repo_name, url, search_name, forkCount) {
    super();
    this.attachShadow({ mode: "open" });
    this.repo_name = repo_name;
    this.url = url;
    this.search_name = search_name;
    this.forkCount = forkCount;
    this.shadowRoot.appendChild(this.#template());
    this.forked = this.shadowRoot.querySelector("#fork");
  }

  connectedCallback() {
    this.forked.addEventListener("click", (e) => {
      e.preventDefault();
      this.#test();
    });
  }

  #test() {
    this.dispatchEvent(new ForkedEvent(this.repo_name, this.url, this.search_name));
  }

  #template() {
    const template = document.createElement("template");
    template.innerHTML = `
        <style>

            @import url('https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css');
            @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

                            .repo-card {
                            box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);
                    padding: 16px;
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                    margin-bottom: 16px;
                    background-color: #ffffff;
                }
                .repo-title {
                    font-weight: bold;
                    font-size: 18px;
                }

                
            </style>
            <div class="repo-card" style="width:300px;">
                <p class="repo-title">${this.repo_name}</p>
                <p>
                    <a id="fork" href="#" style="color: blue;">Show forks</a> | 
                    <a href="${this.url}" target="_blank" style="color: blue;">Show on GitHub</a>
                    <p>${this.forkCount}</p>
                </p>
            </div>


      `;
    return template.content.cloneNode(true);
  }
}

window.customElements.define("repo-card", RepoCard);
