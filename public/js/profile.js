class Profile extends HTMLElement {
  constructor() {
    console.log("Generating Profile Page");
    super();
    this.attachShadow({ mode: "open" });
    this.initialize();
  }

  async initialize() {
    this.shadowRoot.innerHTML = "<p>Loading user data...</p>"; // Show loading state
    const data = await this.fetchUser();
    console.log(`Fetched data: ${data}`);
    
    if (data && data.user) {
        this.user = data.user
      this.shadowRoot.innerHTML = ""; // Clear loading state
      this.shadowRoot.appendChild(this.#template());
    } else {
      this.shadowRoot.innerHTML = "<p>Error fetching user data</p>";
    }
  }

  async fetchUser() {
    try {
      const response = await fetch("/api/user", { method: "GET" });
      console.log("Fetching user DATA");
      if (!response.ok) throw new Error("Failed to fetch user data");
      const data = await response.json();
      console.log("User data received:", data); // Log the user data
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  #template() {
    const template = document.createElement("template");

    if (this.user) {
      template.innerHTML = `
          <img src="${this.user.avatar_url}" alt="Image not found">
          <h1>Välkommen ${this.user.username}</h1>
          <pre>Repos: ${this.user.public_repos}</pre>
          `;
      
    } else {
        template.innerHTML = `
          <p>User Data is not available</p>
        `
    }
    return template.content.cloneNode(true);
  }
}

customElements.define("user-profile", Profile);
