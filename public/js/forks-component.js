class ForkList extends HTMLElement {
  constructor(full_name, manData, url) {
    super();
    this.attachShadow({ mode: "open" });
    this.full_name = full_name;
    this.url = url;


    if (manData) {
        this.repoScriptData = manData.scriptData || "scriptData not available";
        this.repoManifest = manData.manifest || "manifest not available";

        
      } else {
        this.repoScriptData = "scriptdata not found";
        this.repoManifest = "manifestdata not found";
      }

    

    this.shadowRoot.appendChild(this.#template());
    this.btn = this.shadowRoot.querySelector('.btn');
    this.#makeTest(this.repoScriptData, this.repoManifest)
    Prism.highlightElement(this.shadowRoot.querySelector("code"));
  }

  connectedCallback() {

    this.btn.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent the default form submission
        
        // Get the comment from the input field
        const comment = this.btn.parentNode.querySelector('input[type="text"]').value;
    
        // Get the selected radio button
        const selectedOption = this.btn.parentNode.querySelector('input[name="options"]:checked');


        // Prepare the data to send
        const data = {
            full_name: this.full_name,
            comment: comment,
            status: selectedOption ? selectedOption.value : null // Handle case if no option is selected
        };
        console.log(data)
    
        try {
        
            // Make a PUT request to the backend
            const response = await fetch(`/forks`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        
            if (response.ok) {
                const result = await response.json();
                console.log('Success:', result);
            } else {
                console.error('Error:', response.statusText);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
        
    });
    
    
  }




  #escapeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
}

#makeTest(code, manifest) {
    const container = this.shadowRoot.querySelector("#test");
    container.innerHTML = ''; // Clear previous results

    // Check if the language is supported
    if (manifest.language !== "javascript") {
        container.innerHTML = '<p>Language is not supported</p>';
        return;
    }
    if (code && manifest) {
        const functionName = manifest.functionName;  // Ensure to use `this.manifest`
        try {
            const smallestOfTwo = new Function(code + `; return ${functionName};`)(); // Correct function creation

            const tests = manifest.tests;  // Access tests from the manifest
            let results = '';

            // Run each test
            tests.forEach(test => {
                const { description, arguments: args, expected } = test;
                try {
                    console.log(`Executing test: "${description}" with args:`, args);
                    const result = smallestOfTwo(...args); // Call the function directly
                    if (result === expected) {
                        results += `<p style='color:green;'>Test "${description}"- Passed</p>`;

                    } else {
                        results += `<p style='color:red;'>Test "${description}"- Failed (Expected ${expected}, got ${result})</p>`;
                    }
                } catch (error) {
                    console.error(`Error executing test "${description}":`, error);
                    results += `<p>Test "${description}": Error (${error.message})</p>`;
                }
            });

            // Display results
            container.innerHTML = results;

        } catch (error) {
            console.error(`Failed to create function: ${error.message}`);
            container.innerHTML = `<p>Error creating function: ${error.message}</p>`;
        }
    } else {
        console.error("Code or manifest is missing.");
        container.innerHTML = '<p>Code or manifest is missing.</p>';
    }
}



  #template() {
    const template = document.createElement("template");
    template.innerHTML = `
        <style>

            @import url('https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css');
            @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
            @import url('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css');


                 .repo-card {
                 box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);
        width: 500px;
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

    pre {
    background-color: black:
                    padding: 16px;
                    border-radius: 4px;
                    overflow: auto;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                code {
                    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
                    font-size: 14px;
                }

                
            </style>



    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>

            <div class="repo-card">
    <div class="mdl-card__actions mdl-card--border">
        <p class="repo-title">${this.full_name}</p>
        <pre><code class="language-javascript">${this.#escapeHTML(this.repoScriptData)}</code></pre>
        <p><a href="${this.url}" target="_blank" style="color: blue;">Show on GitHub</a></p>
        
    </div>

    <div id="test" class="mdl-card__actions mdl-card--border" style="color: black;">
    
    </div>

    <div class="mdl-card__actions mdl-card--border">
        <form>
            <input type="text" placeholder="Comment">
            <br/><br/>
            <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-1">
                <input type="radio" id="radio-1" class="mdl-radio__button" name="options" value="done">
                <span class="mdl-radio__label" style="display: flex; align-items: center;">
                    <i class="material-icons">check</i> Klar
                </span>
            </label>
            <br/><br/>
            <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-2">
                <input type="radio" id="radio-2" class="mdl-radio__button" name="options" value="not done">
                <span class="mdl-radio__label" style="display: flex; align-items: center;">
                    <i class="material-icons">visibility_off</i> Återgärd Krävs
                </span>
            </label>
            <br/><br/>
            <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-3">
                <input type="radio" id="radio-3" class="mdl-radio__button" name="options" value="not reviewed" checked>
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


