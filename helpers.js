// Function to check if email exists 
const getUserByEmail = function (email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
}

module.exports = { getUserByEmail }

