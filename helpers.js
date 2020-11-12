const bcrypt = require('bcrypt');

// Function to check if email exists 
const getUserByEmail = function (email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
}

// Function for generating random URL
const generateRandomString =  function() {
  // from lecture w3-d1
  // Math.random() specifies random number between 0 and 1 => toString base 36 => substring between index 2 and 8
  return Math.random().toString(36).substring(2,8);
}

// url Database for a given user
const urlsForUser = function(id, urlDatabase) {
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

  if(userObjectInfo && bcrypt.compareSync(userPassword, userObjectInfo.password)) {
    return userObjectInfo.id;
  }
  return false;
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser, doesPasswordMatch }

