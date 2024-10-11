class Profile extends HTMLElement {

  constructor() {
    console.log("Generating Profile Page")
    super();
    this.attachShadow({ mode: "open" });
    this.initialize();
  }

  async initialize() {
    this.user = await this.fetchUser();
    console.log(`Fetched... ${this.user}`)
    if (this.user) {
      this.shadowRoot.appendChild(this.#template());
    } else {
      this.shadowRoot.innerHTML = "<p>Error fetching user data</p>";
    }
  }

  async fetchUser() {
    try {
      const response = await fetch("/api/user", { method: "GET" });
      console.log("Fetching user DATA")
      if (!response.ok) throw new Error("Failed to fetch user data");
      return await response.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  #template() {
    const template = document.createElement("template");

    template.innerHTML = `
          <img src="${this.user.avatar_url}" alt="Image not found">
          <h1>Välkommen ${this.user.name}</h1>
          <pre>Repos: ${this.user.public_repos}</pre>
          `;
    return template.content.cloneNode(true);
  }
}

customElements.define("user-profile", Profile);