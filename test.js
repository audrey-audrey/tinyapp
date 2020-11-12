const urlDatabase = {
  "b2xVn2": { longURL:"http://www.lighthouselabs.ca", userID: 'a'},
  "9sm5xK": { longURL:"http://www.google.com", userID: 'a' },
  "fhdfhf": { longURL:"http://www.google.ca", userID: 'b' },
  "fnebdt": { longURL:"http://www.youtube.com", userID: 'b' },
  "9erhtr": { longURL:"http://www.facebook.com", userID: 'a' },
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

console.log(urlsForUser('a'))