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
      this.user = data.user;
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
        <style>
          /* Add your CSS styles here */

          :host {
            display: block;
            font-family: 'Arial', sans-serif;
            color: #fff;
            background: linear-gradient(135deg, #ff6b81, #8e44ad); /* Pink to Purple gradient */
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 400px;
            margin: 20px auto;
          }
          img {
            border-radius: 50%;
            width: 100px;
            height: 100px;
            margin-bottom: 15px;
          }
          h1 {
            color: #f9c74f; /* Soft yellow color */
            font-size: 24px;
            margin: 10px 0;
          }
          pre {
            background-color: rgba(255, 255, 255, 0.1);
            padding: 10px;
            border-radius: 5px;
          }
          button {
            background-color: #f9c74f; /* Soft yellow button */
            color: #8e44ad; /* Purple text */
            border: none;
            border-radius: 5px;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            margin-top: 20px;
          }
          button:hover {
            background-color: #f8c45d; /* Slightly darker yellow */
          }
          button:focus {
            outline: none;
            box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
          }

          img {
            border-radius: 50%;
            width: 100px;
            height: 100px;
          }
          h1 {
            color: #8e44ad; /* Purple */
          }
          pre {
            background-color: #f9c74f; /* Soft yellow */
            padding: 10px;
            border-radius: 5px;
          }
          a {
            display: inline-block; /* Make it behave like a button */
            background-color: #f9c74f; /* Soft yellow */
            color: #8e44ad; /* Purple text */
            border: none;
            border-radius: 5px;
            padding: 10px 20px;
            font-size: 16px;
            text-decoration: none; /* Remove underline */
            transition: background-color 0.3s ease;
            margin-top: 20px;
          }
          a:hover {
            background-color: #f8c45d; /* Slightly darker yellow */
          }
        </style>
        <img src="${this.user.avatar_url}" alt="Image not found">
        <h1>Välkommen ${this.user.username}</h1>
        <pre>Repos: ${this.user.public_repos}</pre>
        <a id="return-home" href="/">Return to Home</a>
      `;
    } else {
      template.innerHTML = `
        <style>
        :host {
            display: block;
            font-family: 'Arial', sans-serif;
            color: #fff;
            background: linear-gradient(135deg, #ff6b81, #8e44ad); /* Pink to Purple gradient */
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 400px;
            margin: 20px auto;
          }
          img {
            border-radius: 50%;
            width: 100px;
            height: 100px;
            margin-bottom: 15px;
          }
          h1 {
            color: #f9c74f; /* Soft yellow color */
            font-size: 24px;
            margin: 10px 0;
          }
          pre {
            background-color: rgba(255, 255, 255, 0.1);
            padding: 10px;
            border-radius: 5px;
          }
          button {
            background-color: #f9c74f; /* Soft yellow button */
            color: #8e44ad; /* Purple text */
            border: none;
            border-radius: 5px;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            margin-top: 20px;
          }
          button:hover {
            background-color: #f8c45d; /* Slightly darker yellow */
          }
          button:focus {
            outline: none;
            box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
          }

          a {
            display: inline-block; /* Make it behave like a button */
            background-color: #f9c74f; /* Soft yellow */
            color: #8e44ad; /* Purple text */
            border: none;
            border-radius: 5px;
            padding: 10px 20px;
            font-size: 16px;
            text-decoration: none; /* Remove underline */
            transition: background-color 0.3s ease;
            margin-top: 20px;
          }
          a:hover {
            background-color: #f8c45d; /* Slightly darker yellow */
          }

        </style>
        <p>User Data is not available</p>
        <a id="return-home" href="/">Return to Home</a>
      `;
    }

    return template.content.cloneNode(true);
  }
}

customElements.define("user-profile", Profile);
