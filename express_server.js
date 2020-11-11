// Required Modules and Settings
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const CookieParser = require('cookie-parser');
app.use(CookieParser());

app.set("view engine", "ejs");

// PORT
const PORT = 8080; 

// Function for generating random URL
function generateRandomString() {
  // from lecture w3-d1
  // Math.random() specifies random number between 0 and 1 => toString base 36 => substring between index 2 and 8
  return Math.random().toString(36).substring(2,8);
}

// url Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// example with saying Hello World!
app.get("/hello", (req, res) => {
  const templateVars = { 
    greeting: 'Hello World!',
    username: req.cookies["username"]
   };
  res.render("hello_world", templateVars);
});

// using .render()
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  }
  // syntax for res.render(view [, locals] [, callback]) 
  // since following views directory, no need to specify filepath
  // locals (we're using tempalteVars) need to be an object
  res.render("urls_index", templateVars);
});

// need to be placed before /urls/:id (routes should be ordered from most specific to least specific)
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const newURL = req.body.longURL; // req.body comes back as an object with key longURL
  const newID = generateRandomString()

  urlDatabase[newID] = newURL;

  // redirect to /urls
  res.redirect(`/urls`); // asking the browser to do another request 'GET /urls'
});

app.get("/u/:shortURL", (req, res) => {
  
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  res.redirect(longURL);
});

// Deleting url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect('/urls');
})

// Editing url
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;

  // how do you redirect back to /urls after editing??
  res.redirect('/urls/' + shortURL);
})

// handling a post to /login
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls/');
})

// Starting server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});