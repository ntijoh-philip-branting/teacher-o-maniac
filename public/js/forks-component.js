class ForkList extends HTMLElement {
  constructor(name, url, content) {
    super();
    this.attachShadow({ mode: "open" });
    this.name = name;
    this.url = url;
    this.content = content;
    this.shadowRoot.appendChild(this.#template());
  }

  connectedCallback() {
    Prism.highlightAll();
  }

  #template() {
    const template = document.createElement("template");
    template.innerHTML = `
        <style>

            @import url('https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css');
            @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
            @import url('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css');


                 .repo-card {
        width: 40vw;
        padding: 16px;
        border: 1px solid #e0e0e0; /* Main border for the repo card */
        border-radius: 4px;
        background-color: #ffffff;
    }

    .mdl-card__actions {
        border: 1px solid #d0d0d0; /* Thin border for action sections */
        border-radius: 4px;
        padding: 8px;
        margin-bottom: 16px; /* Space between sections */
    }

    .repo-title {
        font-weight: bold;
        font-size: 18px;
    }

    .btn {
        margin-top: 16px;
    }

                
            </style>



    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>

            <div class="repo-card">
    <div class="mdl-card__actions mdl-card--border">
        <p class="repo-title">${this.name}</p>
        <pre><code class="language-javascript">${this.content}</code></pre>
        <p><a href="${this.url}" target="_blank" style="color: blue;">Show on GitHub</a></p>
    </div>

    <div class="mdl-card__actions mdl-card--border">
        <form>
            <input type="text" placeholder="Comment">
            <br/><br/>
            <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-1">
                <input type="radio" id="radio-1" class="mdl-radio__button" name="options" value="1">
                <span class="mdl-radio__label" style="display: flex; align-items: center;">
                    <i class="material-icons">check</i> Klar
                </span>
            </label>
            <br/><br/>
            <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-2">
                <input type="radio" id="radio-2" class="mdl-radio__button" name="options" value="2">
                <span class="mdl-radio__label" style="display: flex; align-items: center;">
                    <i class="material-icons">visibility_off</i> Återgärd Krävs
                </span>
            </label>
            <br/><br/>
            <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-3">
                <input type="radio" id="radio-3" class="mdl-radio__button" name="options" value="3" checked>
                <span class="mdl-radio__label" style="display: flex; align-items: center;">
                    <i class="material-icons">refresh</i> Ej Bedömd
                </span>
            </label>
            <br/><br/>
            <button type="submit" class="btn waves-effect waves-light mdl-button mdl-js-button mdl-button--raised">
                SAVE
            </button>
        </form>
    </div>
</div>


      `;
    return template.content.cloneNode(true);
  }
}

window.customElements.define("fork-list", ForkList);
