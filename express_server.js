const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({extended: true}));

// generate random shortURL
function generateRandomString() {
  // from lecture w3-d1
  // Math.random() specifies random number between 0 and 1 => toString base 36 => substring between index 2 and 8
  return Math.random().toString(36).substring(2,8);
}

app.set("view engine", "ejs");

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
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

// using .render()
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase}
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
  const templateVars = { shortURL, longURL: urlDatabase[shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});