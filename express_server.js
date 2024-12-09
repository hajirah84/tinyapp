const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}  


app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });
 
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });

  app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });
  
  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.get("/urls/:id", (req, res) => {
   const urlId = req.params.id; 
    const templateVars = { id: urlId, longURL: urlDatabase[urlId] };
    res.render("urls_show", templateVars);
  });
 
  app.post("/urls", (req, res) => {
    console.log(req.body); // Log the POST request body to the console
   const key = generateRandomString ();
   urlDatabase [key] = req.body.longURL
   res.redirect(`/urls/${key}`); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
    console.log (req.params.id)
    const longURL = urlDatabase[req.params.id]
    res.redirect(longURL);
  });
app.post("/urls/:id/delete",(req,res) => {
    delete urlDatabase[req.params.id]
    res.redirect ("/urls")
} )
