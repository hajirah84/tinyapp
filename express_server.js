const express = require("express");
const app = express();
const PORT = 8080; // Default port 8080
const cookieParser = require("cookie-parser");

const users = {
    userRandomID: {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    },
    user2RandomID: {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk",
    },
};

function generateRandomString() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
const emailExists = (email) => {
    for (let userId in users) {
      if (users[userId].email === email) {
        return true;
      }
    }
    return false;
  };

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

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
  const userId = req.cookies["user_id"];
  const user = users[userId];

  const templateVars = {
    user: user || null,
    urls: urlDatabase,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];

  const templateVars = { user: user || null };
  res.render("urls_new", templateVars);
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
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (!longURL) {
    return res.status(404).send("Short URL not found.");
  }

  const templateVars = { user: user || null, shortURL, longURL };
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
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const urlId = req.params.id;
  const longURL = urlDatabase[urlId];

  if (!longURL) {
    return res.status(404).send("Short URL not found.");
  }

  const templateVars = { user: user || null, id: urlId, longURL };
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];

  const templateVars = { user: user || null };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const userId = generateRandomString();

  if (!email || !password) {
    return res.status(400).send("Your email and password cannot be empty.");
  }

  if (emailExists(email)) {
    return res.status(400).send("Email is already registered to another account.");
  }
  const newUser = {
    id: userId,
    email,
    password,
  };

  users[userId] = newUser;
  res.cookie("user_id", userId);
  console.log("Updated users object:", users);

  res.redirect("/urls");
});

app.get("/login", (req, res) => {
    res.render("login"); 
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
