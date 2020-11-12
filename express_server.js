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

// url Database
const urlDatabase = {
  "b2xVn2": { longURL:"http://www.lighthouselabs.ca" },
  "9sm5xK": { longURL:"http://www.google.com" }
  // User entered URL will be stored in the following format
  // shortURL: {longURL: longURL, userID: ID}
};

// users information object
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
}

// Function for generating random URL
const generateRandomString =  function() {
  // from lecture w3-d1
  // Math.random() specifies random number between 0 and 1 => toString base 36 => substring between index 2 and 8
  return Math.random().toString(36).substring(2,8);
}

// Function to check if email exists 
const isEmailRegistered = function (email) {
  for(const user in users) {
    if(users[user].email === email) {
      return true;
    }
  } 
  return false;
}

// Function to check if password matches 
const doesPasswordMatch = function (password) {
  for(const user in users) {
    if(users[user].password === password) {
      return user;
    }
  } 
  return false;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

// example with saying Hello World!
app.get("/hello", (req, res) => {
  const user_id = req.cookies.user_id
  const user = users[user_id]

  const templateVars = { 
    greeting: 'Hello World!',
    user
   };
  res.render("hello_world", templateVars);
});


app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id
  const user = users[user_id]

  const templateVars = { 
    urls: urlDatabase,
    user
  }
  // since following views directory, no need to specify filepath
  // locals (we're using tempalteVars) need to be an object
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// need to be placed before /urls/:id (routes should be ordered from most specific to least specific)
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id
  const user = users[user_id]

  const templateVars = { 
    user
   };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const email = req.cookies.user_id.email;
  const shortURL = req.params.shortURL;
  const user_id = req.cookies.user_id
  const user = users[user_id]

  const templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL].longURL,
    user
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; // req.body comes back as an object with key longURL
  const newID = generateRandomString()
  const user_id = req.cookies.user_id
  const user = users[user_id].id

  urlDatabase[newID] = {longURL, user};
  console.log(urlDatabase)

  // redirect to /urls
  res.redirect(`/urls`); // asking the browser to do another request 'GET /urls'
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
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
  urlDatabase[shortURL].longURL = req.body.newURL;

  // how do you redirect back to /urls after editing??
  res.redirect('/urls/' + shortURL);
})

// handling a post to /login and setting cookie
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  
  if(!isEmailRegistered(userEmail)) {
    return res.status(403).send('Email cannot be found!')
  } else {
    if(!doesPasswordMatch(userPassword)) {
      return res.status(403).send('Password does not match!')
    }
  }
  currentUserID = doesPasswordMatch(userPassword);
  res.cookie('user_id', currentUserID)

  res.redirect('/urls/');
})

// handling /logout to clear cookie
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls/');
})

// create a registration page
app.get("/register", (req, res) => {
  const user_id = req.cookies.user_id
  const user = users[user_id]

  const templateVars = { 
    urls: urlDatabase,
    user: user
  }

  res.render('register', templateVars)
});

// registration handler 
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  //checking if body is empty 
  if(!email || !password) {
    return res.status(400).send('Please enter email and password!')
  } else if (isEmailRegistered(email)){
    console.log(users)
    return res.status(400).send('Email exists! Please login')
  } else {
  //adding user object to global users
    users[id] = {id, email, password};

    res.cookie('user_id', id);
    res.redirect('/urls');
  }
  
})

app.get("/login", (req, res) => {
  const user_id = req.cookies.user_id
  const user = users[user_id]
  const templateVars = { 
    urls: urlDatabase,
    user: user
  }

  res.render('login', templateVars)
});

// Starting server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});