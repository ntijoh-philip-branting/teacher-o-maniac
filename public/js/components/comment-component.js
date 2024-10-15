class Comment extends HTMLElement {
  constructor(comment, status) {
    super();
    this.attachShadow({ mode: "open" });
    this.comment = comment;
    this.status = status;
    this.shadowRoot.appendChild(this.#template());
    this.forked = this.shadowRoot.querySelector("#fork");
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
                    <p class="repo-title">${this.comment}</p>
                  <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-3">
                      <input type="radio" id="radio-3" class="mdl-radio__button" name="options" value="not reviewed" checked>
                      <span class="mdl-radio__label" style="display: flex; align-items: center;">
                          <!-- <i class="material-icons">refresh</i>  --> ${this.status}
                      </span>
                  </label>
                </div>
    
    
          `;
    return template.content.cloneNode(true);
  }
}

window.customElements.define("comment-element", Comment);
