// Function to check if email exists 
const isEmailRegistered = function (email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
}

module.exports = { isEmailRegistered }