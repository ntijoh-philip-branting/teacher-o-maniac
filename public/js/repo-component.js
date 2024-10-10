class ForkedEvent extends CustomEvent {
  constructor(name, repo_url) {
    super("forked", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { name: name, repo_url: repo_url },
    });
  }
}

class RepoCard extends HTMLElement {
  constructor(name, url) {
    super();
    this.attachShadow({ mode: "open" });
    this.name = name;
    this.url = url;
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
    this.dispatchEvent(new ForkedEvent(this.name, this.url));
  }

  #template() {
    const template = document.createElement("template");
    template.innerHTML = `
        <style>

            @import url('https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css');
            @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

                            .repo-card {
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
            <div class="repo-card" style="width:40vw;">
                <p class="repo-title">${this.name}</p>
                <p>
                    <a id="fork" href="#" style="color: blue;">Show forks</a> | 
                    <a href="${this.url}" target="_blank" style="color: blue;">Show on GitHub</a>
                </p>
            </div>


      `;
    return template.content.cloneNode(true);
  }
}

window.customElements.define("repo-card", RepoCard);
