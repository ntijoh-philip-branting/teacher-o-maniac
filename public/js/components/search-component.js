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
    this.icon = this.shadowRoot.querySelector("#icon");
    this.input = this.shadowRoot.querySelector("#filter");
    this.ghostText = this.shadowRoot.querySelector("#ghostText")
    this.fullGhostText = ""
    this.possibleGhosts = []
  }

  connectedCallback() {
    this.input.addEventListener("keydown", (e) => {
      console.log(`Ctrl key is: ${e.ctrlKey} and other is: ${e.key}`)
      if (e.key === "Enter") {
        const value = this.input.value;
        this.dispatchEvent(new SearchEvent(value));
      } else if (e.key === "Tab") {
        e.preventDefault();
        console.log("Tabbed to autofill")
        this.autoFill()
      }
    });
    this.input.addEventListener("input", (e) => {  
      if (this.isNonFunctionKey(e)) {
        console.log(`Key ${e.data} Pressed. So far: ${this.input.value}`)

        this.checkPossibleCaches()
      }
    });
    this.icon.addEventListener("click", () => {
      this.dispatchEvent(new ProfileEvent());
    });
  }

  autoFill(){
    if (this.ghostText.innerText !== ""){
      this.input.value = this.input.value + this.ghostText.innerText;
      this.ghostText.innerText = "";
    }
  }

  async checkPossibleCaches(){
    console.log("Checking possibilities")
    if (this.fullGhostText !== null) {
      let ghostTextStr = this.ghostText.innerText;

      if (ghostTextStr.length > 0 && this.fullGhostText.startsWith(this.input.value)){
        ghostTextStr = this.fullGhostText.replace(this.input.value, "");

      } else if (this.possibleGhosts.length > 0) {
          const newGhosts = this.possibleGhosts.filter(e => e.startsWith(this.input.value));
        
          if (newGhosts.length > 0) {
            this.fullGhostText = newGhosts[0];
            ghostTextStr = this.fullGhostText.replace(this.input.value, "");
            this.possibleGhosts = newGhosts;
          } else {
            this.fullGhostText = null;
            ghostTextStr = "";
          }

      }else if (ghostTextStr.length === 0) {
        const response = await fetch(`/cache/${this.input.value}?is_search=true`);

        if (response.ok) {
          const content = await response.json();
          
          if (content.data && content.data.length > 0) {
            this.possibleGhosts = content.data;
            this.fullGhostText = this.possibleGhosts[0];
            ghostTextStr = this.fullGhostText.replace(this.input.value, "");
          } else {
            this.fullGhostText = null;
            ghostTextStr = "";
          }

        }

      }
      console.log("Came out of possibilities with vars:")
      console.log(`Full: ${this.fullGhostText}\nPossible: ${this.possibleGhosts}\nNormal: ${this.ghostText.innerText}`)

      this.ghostText.innerText = ghostTextStr;
    } else if (this.input.value.length === 1) {
      this.fullGhostText = "";
      this.checkPossibleCaches();
    }
  }

  isNonFunctionKey(e) {
    if (e.data) {
    const key = e.data;
    // Exclude control keys like "Enter", "Tab", "Arrow", "Escape", etc.
    const functionKeys = [
      "Enter", "Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", 
      "Escape", "Backspace", "Delete", "Shift", "Control", "Alt", "CapsLock"
    ];
  
    // Check if the key is not in the list of function keys and is a valid printable key
    return !functionKeys.includes(key) && key.length === 1;
    } 
  }

  #template() {
    const template = document.createElement("template");
    template.innerHTML = `
    <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

        .header {
            position: relative;
        }

        .input-field {
            background-color: magenta;
            margin-top: 0px;
        }

        .icon-button {
            display: inline-block;
            cursor: pointer;
            margin-right: 10px;
        }

        #ghostText {
            color: gray;
            font-style: italic;
            position: absolute;
            top: 45px; /* Adjust based on input height */
            left: 10px; /* Adjust based on padding */
            pointer-events: none; /* Prevent mouse interactions */
        }
    </style>

    <div class="header">
      <div class="input-field">
        <i id="icon" class="material-icons prefix" style="margin-top: 5px;">account_circle</i>
        <input id="filter" type="text" class="validate">
      </div>
      <p id="ghostText"></p>
    </div>
    `;
    return template.content.cloneNode(true);
  }
}

window.customElements.define("search-item", HeaderBarItem);
