const express = require("express");
const app = express();
const PORT = 8080; // Default port 8080
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");


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

  const urlsForUser = (id) => {
    const userUrls = {};
    for (const shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === id) {
        userUrls[shortURL] = urlDatabase[shortURL];
      }
    }
    return userUrls;
  };

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Set the view engine to EJS
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
      accum[urlId] = urlDatabase[urlId].longURL
    }
    return accum
  }, {})
}

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
  if (!userId) {
    return res.status(401).send("<h1>Error: Log in or Create an Account to see your URLs.</h1><a href='/login'>Login</a> | <a href='/register'>Register</a>");
  }


  const userUrls = urlsForUser(userId); // Get URLs specific to this user
  const templateVars = { user: users[userId], urls: userUrls };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId || !(userId in users))  {
    res.redirect("/login")  
  }
  else {
    const user = users[userId];
    const templateVars = { user: user || null };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
const userId = req.cookies["user_id"];
if (!userId || !(userId in users))  {
    res.redirect ('/login')
  }
  else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {longURL: req.body.longURL, userID: userId};
    res.redirect(`/urls/${shortURL}`);
  }
});

app.get("/u/:id", (req, res) => {
    if (!(req.params.id in urlDatabase)) 
        {
    res.status(404).send("Short URL not found.");
  }
  else {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL, );
  }
  
});

app.post("/urls/:id/delete", (req, res) => {
    const userId = req.cookies["user_id"];
    const shortURL = req.params.id;
  
    if (!urlDatabase[shortURL]) {
      return res.status(404).send("<h1>Error: URL does not exist.</h1>");
    }
  
    if (!userId || !(userId in users)) {
      return res.status(401).send("<h1>Error: You must be logged in to delete URLs.</h1>");
    }
  
    if (urlDatabase[shortURL].userID !== userId) {
      return res.status(403).send("<h1>Error: You do not have permission to delete this URL.</h1>");
    }
  
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  });

app.get("/urls/:id/edit", (req, res) => {
  const userId = req.cookies["user_id"];
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
  }
   else {
    const longURL = urlDatabase[shortURL].longUrl;

  const templateVars = { user: user || null, shortURL, longURL };
  res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;  
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


app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const urlId = urlDatabase [req.params.id];

  if (!(urlId in urlDatabase)) {
    return res.status(404).send("Short URL not found.");
  }
  if (!userId) {
    return res.status(401).send("<h1>Error: You must log in to view this URL.</h1><a href='/login'>Login</a> | <a href='/register'>Register</a>");
  }

  if (!url) {
    return res.status(404).send("<h1>Error: URL not found.</h1>");
  }

  if (url.userID !== userId) {
    return res.status(403).send("<h1>Error: You do not have permission to view this URL.</h1>");
  }
  const longURL = urlDatabase[urlId].longURL;

  const templateVars = { user: users[userId], shortURL: req.params.id, longURL: url.longURL };
  res.render("urls_show", templateVars);
});


app.post("/login", (req, res) => {
  const username = req.body.username;
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

  res.cookie("user_id", foundUser.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.clearCookie("user_id");
  res.redirect("/login");
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
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: userId,
    email,
    password: hashedPassword,
  };

  users[userId] = newUser;
  res.cookie("user_id", userId);

  res.redirect("/urls");
});

app.get("/login", (req, res) => {
    const userId = req.cookies["user_id"]; 
    const user = users[userId] || null; 
    res.render("login", { user }); 
  });
  

  app.post("/login", (req, res) => {
    const { email, password } = req.body;
  
    let findUser = null;
    for (const userId in users) {
      const user = users[userId];
      if (user.email === email) {
        findUser = user;
        break;
      }
    }
  
    if (!findUser || findUser.password !== password) {
      return res.status(403).send("Invalid email or password.");
    }
  
    res.cookie("user_id", findUser.id);
    res.redirect("/urls");
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
