class SearchEvent extends CustomEvent {
  constructor(search) {
    super("searched", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { search: search },
    });
  }
}

class ProfileEvent extends CustomEvent {
  constructor() {
    super("profile-checked", {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
  }
}

class HeaderBarItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(this.#template());
    this.input = this.shadowRoot.querySelector("#filter");
    this.icon = this.shadowRoot.querySelector("#icon");
  }

  connectedCallback() {
    this.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const value = this.input.value;
        this.dispatchEvent(new SearchEvent(value));
      }
    });
    this.icon.addEventListener("click", () => {
      this.dispatchEvent(new ProfileEvent());
    });
  }

  #template() {
    const template = document.createElement("template");
    template.innerHTML = `
        <style>
            @import url('https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css');
            @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
    
            .input-field{
                background-color:magenta;
                margin-top:0px;
            }
    
            .icon-button {
                display: inline-block;
                cursor: pointer;
                margin-right: 10px;
            }
    
        </style>
    
        <div class="header">
          <div class="input-field">
            <i id="icon" class="material-icons prefix" style="margin-top: 5px;">account_circle</i>
            <input id="filter" type="text" class="validate">
          </div>
        </div>
      `;
    return template.content.cloneNode(true);
  }
}

window.customElements.define("search-item", HeaderBarItem);
