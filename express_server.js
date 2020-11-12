// Required Modules and Settings
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require('cookie-session');

//required functions 
const {getUserByEmail} = require ('./helpers')

app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);

const bcrypt = require('bcrypt');

app.set("view engine", "ejs");

// PORT
const PORT = 8080; 

// url Database
const urlDatabase = {
  "b2xVn2": { longURL:"http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL:"http://www.google.com", userID: "userRandom2ID" }
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

// url Database for a given user
const urlsForUser = function(id) {
  let userURLObject = {};
  for(const url in urlDatabase) {
    const longURL = urlDatabase[url].longURL;
    const userID = urlDatabase[url].userID
    if(id === userID)
    userURLObject[url] = {longURL, userID}
  }
  return userURLObject
}

// Function to check if password matches 
const doesPasswordMatch = function (userObjectInfo, userPassword) {

  console.log(userObjectInfo)
  console.log(userObjectInfo.password)
  console.log(userPassword)

  if(userObjectInfo && bcrypt.compareSync(userPassword, userObjectInfo.password)) {
    console.log('returned: ', userObjectInfo.id)
    return userObjectInfo.id;
  }
  return false;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

// example with saying Hello World!
app.get("/hello", (req, res) => {
  const user_id = req.session.user_id
  const user = users[user_id]

  const templateVars = { 
    greeting: 'Hello World!',
    user
   };
  res.render("hello_world", templateVars);
});


app.get("/urls", (req, res) => {
  const user_id = req.session.user_id
  const userURLs = urlsForUser(user_id) 
  const user = users[user_id]

  const templateVars = { 
    urls: userURLs,
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
  const emailExist = getUserByEmail(userEmail, users)
  
  if(!emailExist) {
    return res.status(403).send('Email cannot be found!')
  } else {
    if(!doesPasswordMatch(emailExist, userPassword)) {
      return res.status(403).send('Password does not match!')
    }
  }
  currentUserID = doesPasswordMatch(emailExist, userPassword);
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
