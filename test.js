const urlDatabase = {
  "b2xVn2": { longURL:"http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL:"http://www.google.com", userID: "userRandom2ID" }
  // shortURL: {longURL: longURL, userID: ID}
};

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

console.log(urlsForUser('userRandomID'))