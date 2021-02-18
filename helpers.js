//Generates a random string to be used for shortURL or userID
const generateRandomString = function() {
  let result = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charLength = chars.length;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

//Looks up user object by email. Returns false if the email is NOT found
const lookupUserByEmail = function(email, userDB) {
  if (email === "") {
    return;
  } else {
    for (let user in userDB) {
      if (userDB[user].email === email) {
        return userDB[user];
      }
    }
    return false;
  }
};

//Filters urlDatabase by userID
const urlsForUser = function(id, urlDB) {
  let foundShortURL = {};
  for (let urls in urlDB) {
    if (urlDB[urls].userID === id) {
      foundShortURL[urls] = urlDB[urls];
    }
  }
  return foundShortURL;
};

module.exports = {generateRandomString, lookupUserByEmail, urlsForUser}