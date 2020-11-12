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
const { getUserByEmail, generateRandomString, urlsForUser, doesPasswordMatch } = require ('./helpers')

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
}

// ROUTES 

// route get /
app.get("/", (req, res) => {
  res.send("Hello!");
});

// route get /hello
app.get("/hello", (req, res) => {
  const user_id = req.session.user_id // => information saved in cookie session under key "user_id"
  const user = users[user_id] // => current user information obtained from user database

  const templateVars = { 
    greeting: 'Hello World!',
    user
   };

  res.render("hello_world", templateVars);
});

// route get /urls
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id
  const userURLs = urlsForUser(user_id, urlDatabase) // => using function urlsForUser to obtain URLs submitted by current user
  const user = users[user_id]

  const templateVars = { 
    urls: userURLs,
    user
  }

  res.render("urls_index", templateVars);
});

// route get /urls.json 
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); // => to view current urlDatabase
});

// route get /urls/new
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id
  const user = users[user_id]

  const templateVars = { 
    user
   };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id
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
  const userID = req.session.user_id

  // add to urlDatabase object
  urlDatabase[newID] = {longURL, userID};
  // const userURLs = urlsForUser(user_id)

  // redirect to /urls
  res.redirect(`/urls/${newID}`); // asking the browser to do another request 'GET /urls'
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Deleting url
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id
  const user = users[user_id]

  if(user) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
  
    return res.redirect('/urls');
  } 
  res.send('Please login to delete URL')

})

// Editing url
app.post("/urls/:shortURL", (req, res) => {
  if(req.session.user_id){
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.newURL;
  
    // how do you redirect back to /urls after editing??
    res.redirect('/urls/' + shortURL);
  } else {
    res.send('Login required to edit URL')
  }
  
})

// handling a post to /login and setting cookie
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userFound = getUserByEmail(userEmail, users)
  const currentUserID = doesPasswordMatch(userFound, userPassword)
  
  if(!userFound) {
    return res.status(403).send('Email cannot be found!')
  } else {
    if(!currentUserID) {
      return res.status(403).send('Password does not match!')
    }
  }
  
  req.session.user_id = currentUserID;

  res.redirect('/urls/');
})

// handling /logout to clear cookie
app.post("/logout", (req, res) => {
  // clear the cookies
  req.session = null;

  res.redirect('/urls/');
})

// create a registration page
app.get("/register", (req, res) => {
  const user_id = req.session.user_id
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
  const hashedPassword = bcrypt.hashSync(password, 10);

  //checking if body is empty 
  if(!email || !password) {
    return res.status(400).send('Please enter email and password!')
  } else if (getUserByEmail(email, users)){
    return res.status(400).send('Email exists! Please login')
  } else {
  //adding user object to global users
    users[id] = {id, email, password: hashedPassword};

    req.session.user_id = id;
    res.redirect('/urls');
  }
  
})

app.get("/login", (req, res) => {
  const user_id = req.session.user_id
  const user = users[user_id]
  const templateVars = { 
    urls: urlDatabase,
    user: user
  }

  res.render('login', templateVars)
});

app.get("/user", (req, res) => {
  res.send(users);
});

// Starting server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
