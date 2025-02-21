const express = require("express");
const app = express();
const PORT = 8080; // Default port 8080
const cookieSession = require("cookie-session"); //Middleware for managing cookies
const bcrypt = require("bcrypt"); // Library used to hash passwords

const { getUserByEmail } = require("./helpers"); //Helper functions

// Database for users
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

// Function to generate a random string for the shortened URL
function generateRandomString() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Check in case email already exists
const emailExists = (email) => {
    for (let userId in users) {
      if (users[userId].email === email) {
        return true;
      }
    }
    return false;
};


app.use(
    cookieSession({
      name: "session",
      keys: ["yourSecretKey1", "yourSecretKey2"], 
      maxAge: 24 * 60 * 60 * 1000, 
    })
);
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// URL Database
const urlDatabase = {
    b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW",
    },
    i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW",
    },
};

function urlsForUser(userId) {
  return Object.keys(urlDatabase).reduce( (accum, urlId) => {
    if (urlDatabase[urlId].userID === userId && urlDatabase[urlId].hasOwnProperty("longURL"))  {
      accum[urlId] = urlDatabase[urlId].longURL;
    }
    return accum;
  }, {});
}

// Routes
//main page
app.get("/", (req, res) => {
  const userId = req.session["user_id"];
  if (userId) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
});

//JSON representation of URL database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Route to display URLs for the logged in user
app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const user = users[userId];
  if (!userId) {
    return res.status(401).send("Log in or Create an Account to see your URLs.");
  }

  const userUrls = urlsForUser(userId); // Get URLs specific to this user
  const templateVars = { user: users[userId], urls: userUrls };
  res.render("urls_index", templateVars);
});

// Route to display shortened URL creation form
app.get("/urls/new", (req, res) => {
    const userId = req.session['user_id'];
  if (!userId || !(userId in users))  {
    res.redirect("/login");
  }
  else {
    const user = users[userId];
    const templateVars = { user: user || null };
    res.render("urls_new", templateVars);
  }
});

// Route to create a new URL
app.post("/urls", (req, res) => {
    const userId = req.session['user_id'];
    if (!userId || !(userId in users))  {
        res.redirect('/login');
    } else {
        const shortURL = generateRandomString();
        urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userId };
        res.redirect(`/urls/${shortURL}`);
    }
});

// Redirect to the long URL from shortened URL
app.get("/u/:id", (req, res) => {
    if (!(req.params.id in urlDatabase)) {
        return res.status(404).send("Short URL not found.");
    }
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
});

// Delete URL
app.post("/urls/:id/delete", (req, res) => {
    const userId = req.session["user_id"];
    const shortURL = req.params.id;

    if (!urlDatabase[shortURL]) {
      return res.status(404).send("<h1>Error: URL does not exist.</h1>");
    }

    if (!userId || !(userId in users)) {
      return res.status(401).send("<h1>Error: Login to delete URLs.</h1>");
    }

    if (urlDatabase[shortURL].userID !== userId) {
      return res.status(403).send("<h1>Error: You do not have permission to delete this URL.</h1>");
    }

    delete urlDatabase[shortURL];
    res.redirect("/urls");
});
// Route displays the edit page for any specific URL
app.get("/urls/:id/edit", (req, res) => {
  const userId = req.session["user_id"];
  const user = users[userId];
  const shortURL = req.params.id;
  if (!(shortURL in urlDatabase)) {
    return res.status(404).send("Short URL not found.");
  }
  if (!userId || !(userId in users)) {
    return res.status(401).send("You must be logged in to edit URLs.");
  }

  if (urlDatabase[shortURL].userID !== userId) {
    return res.status(403).send("You do not have permission to edit this URL.");
  } else {
    const longURL = urlDatabase[shortURL].longURL;
    const templateVars = { user: user || null, shortURL, longURL };
    res.render("urls_show", templateVars);
  }
});
// Route to edit/update a URL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;  
  const userId = req.session["user_id"];
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Short URL not found.");
  }
  if (!userId || !(userId in users)) {
    return res.status(401).send("<h1>Error: Login to view your URLs.</h1>");
  }

  if (urlDatabase[shortURL].userID !== userId) {
    return res.status(403).send("<h1>Error: You do not have permission to edit this URL.</h1>");
  }

  // Update the URL
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;

  res.redirect("/urls");
});

// Route to view URL
app.get("/urls/:id", (req, res) => {
  const userId = req.session["user_id"];
  const user = users[userId];
  const url = urlDatabase[req.params.id];

  if (!url) {
    return res.status(404).send("<h1>Error: URL not found.</h1>");
  }

  if (!userId) {
    return res.status(401).send("<h1>Error: Login to your account to continue");
  }

  if (url.userID !== userId) {
    return res.status(403).send("<h1>Error: You do not have permission to view this URL.</h1>");
  }

  const longURL = url.longURL;

  const templateVars = { user: users[userId], shortURL: req.params.id, longURL };
  res.render("urls_show", templateVars);
});

// Login route to authenticate user
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  let foundUser = null;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    return res.status(403).send("Error: Invalid email or password.");
  }

  const isPasswordCorrect = bcrypt.compareSync(password, foundUser.password);

  if (!isPasswordCorrect) {
    return res.status(403).send("Error: Invalid email or password.");
  }

  req.session.user_id = foundUser.id;
  res.redirect("/urls");
});

//Login page
app.get("/login", (req, res) => {
  const userId = req.session.user_id; 
  const user = users[userId] || null; 
  res.render("login", { user }); 
});

// Logout route to clear the session
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//Registration page route
app.get("/register", (req, res) => {
    const userId = req.session['user_id'];
  const user = users[userId];
  const templateVars = { user: user || null };
  res.render("register", templateVars);
});
// Registration route to create a new user
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10); 
  const userId = generateRandomString();

  if (emailExists(email)) {
    return res.status(400).send("Email is already registered to another account.");
  }
  
  if (!email || !password) {
    return res.status(400).send("Your email and password cannot be empty.");
  }
// Create new user object
  const newUser = {
    id: userId,
    email,
    password: hashedPassword,
  };

  users[userId] = newUser;
  req.session.user_id = userId;

  res.redirect("/urls");
});

//Start server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});