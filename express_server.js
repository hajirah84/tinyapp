const express = require("express");
const app = express();
const PORT = 8080; // Default port 8080
const cookieParser = require("cookie-parser");

// Helper function to generate a random string
function generateRandomString() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.locals.username = req.cookies["username"] || null; // Make `username` available in all views
  next();
});

// Set the view engine to EJS
app.set("view engine", "ejs");

// URL Database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Routes
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; // No need to include `username`
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    return res.status(404).send("URL not found");
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]; // Delete the short and long URL
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (!longURL) {
    return res.status(404).send("Short URL not found.");
  }
  const templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Short URL not found.");
  }
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const urlId = req.params.id;
  const longURL = urlDatabase[urlId];
  if (!longURL) {
    return res.status(404).send("Short URL not found.");
  }
  const templateVars = { id: urlId, longURL };
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});