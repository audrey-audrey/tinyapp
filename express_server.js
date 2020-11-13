// Required Modules and Settings
const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');

// Setting ejs as template
app.set("view engine", "ejs");

// body parser
app.use(bodyParser.urlencoded({extended: true}));

// cookie parser
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);
  
// Required helper functions
const { getUserByEmail, generateRandomString, urlsForUser, doesPasswordMatch } = require('./helpers');

// PORT
const PORT = 8080;

// Database for all URLs
const urlDatabase = {
  "b2xVn2": { longURL:"http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL:"http://www.google.com", userID: "userRandom2ID" }
  // format => shortURL: {longURL: longURL, userID: ID}
};

// Database for all users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// ROUTES

// route get /
app.get("/", (req, res) => {
  const user_id = req.session.user_id; // => information saved in cookie session under key "user_id"
  const user = users[user_id]; // => current user information obtained from user database
  
  if (user) {
    return res.redirect('/urls');
  }
  res.redirect('/login');
});

// route get /hello
app.get("/hello", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];

  const templateVars = {
    greeting: 'Hello World!',
    user
  };

  res.render("hello_world", templateVars);
});

// route get /urls
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const userURLs = urlsForUser(user_id, urlDatabase); // => using function urlsForUser to obtain URLs submitted by current user
  const user = users[user_id];

  const templateVars = {
    urls: userURLs,
    user
  };

  res.render("urls_index", templateVars);
});

// route post /urls
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; // => req.body comes back as an object with key longURL
  const newID = generateRandomString(); // => using function to obtain new 6 char ID
  const userID = req.session.user_id;

  // add to urlDatabase object
  urlDatabase[newID] = {longURL, userID};

  // redirect to /urls
  res.redirect(`/urls/${newID}`);
});

// route get /urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); // => to view current urlDatabase
});

// route get /urls/new
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];

  const templateVars = {
    user
  };

  res.render("urls_new", templateVars);
});

// route get /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  const user = users[user_id];

  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user
  };

  res.render("urls_show", templateVars);
});

// route post /urls/:shortURL
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    console.log(req.params);
    console.log(req.body);
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.newURL;
  
    // how do you redirect back to /urls after editing??
    res.redirect('/urls/');
  } else {
    res.send('Login required to edit URL');
  }
});

// route get /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];

  if(user) {
    const shortURL = req.params.shortURL; // => shortURL obtained from request body
    const longURL = urlDatabase[shortURL].longURL;

    return res.redirect(longURL);
  }

});

// route delete post /urls/:shortURL/delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];

  if (user) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  }
  res.send('Please login to delete URL');
});

// route get /login
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];

  const templateVars = {
    urls: urlDatabase,
    user: user
  };

  if (user) {
    return res.redirect('/urls');
  }
  res.render('login', templateVars);
});

// route post /login
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userFound = getUserByEmail(userEmail, users);
  const currentUserID = doesPasswordMatch(userFound, userPassword);
  
  if (!userFound) {
    return res.status(403).send('Email cannot be found!');
  } else if (!currentUserID) {
    return res.status(403).send('Password does not match!');
  }
  
  req.session.user_id = currentUserID;

  res.redirect('/urls/');
});

// route post /logout
app.post("/logout", (req, res) => {
  // clear the cookies
  req.session = null;

  res.redirect('/urls');
});

// route get /register
app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];

  const templateVars = {
    urls: urlDatabase,
    user: user
  };

  res.render('register', templateVars);
});

// route post /register
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //checking if body is empty
  if (!email || !password) {
    return res.status(400).send('Please enter email and password!');
  } else if (getUserByEmail(email, users)) {
    return res.status(400).send('Email exists! Please login');
  } else {
  //adding user object to global users
    users[id] = {id, email, password: hashedPassword};

    req.session.user_id = id;
    res.redirect('/urls');
  }
});

// Starting server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
