const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['7f69fa85-caec-4d9c-acd7-eebdccb368d5', 'f13b4d38-41c4-46d3-9ef6-8836d03cd8eb']
}))

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
    return false;
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
const urlsForUser = function(id) {
  let foundShortURL = {};
  for (let urls in urlDatabase) {
    if (urlDatabase[urls].userID === id) {
      foundShortURL[urls] = urlDatabase[urls];
    }
  }
  return foundShortURL;
};
//stores URLs
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "randomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "randomID"}
};

const users = {
  
};
//render register template
app.get("/register", (req, res) => {
  res.render("register");
});
//create an account
app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const email = req.body.email;
  const password  = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (lookupUserByEmail(email, users) === false) {
    req.session.user_id = randomID;
    res.redirect('/urls/');
  } else {
    res.sendStatus(400);
  }
  const userObj = {
    id: randomID,
    email,
    hashedPassword
  };
  users[randomID] = userObj;
});
//render login template
app.get("/login", (req, res) => {
  res.render("login");
});
//login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password  = req.body.password;
  if (lookupUserByEmail(email, users) === false) {
    res.sendStatus(403);
    return;
  } else {
    let foundUserObj = lookupUserByEmail(email, users);
    if (!bcrypt.compareSync(password, foundUserObj.hashedPassword)) {
      res.sendStatus(403);
      return;
    } else {
      req.session.user_id = foundUserObj.id
      res.redirect("/urls/");
      return;
    }
  }
  // res.redirect("/urls/");
});
//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
app.get("/", (req, res) => {
  const templateVars = {user: users[req.session.user_id], urls: urlsForUser(req.session.user_id)};
  if (req.session.user_id) {
    res.render("urls_index", templateVars);
    return;
  }
  res.render("urls_index_not_logged_in", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//render /urls only if user is logged in
app.get("/urls", (req, res) => {
  const templateVars = {user: users[req.session.user_id], urls: urlsForUser(req.session.user_id)};
  if (req.session.user_id) {
    res.render("urls_index", templateVars);
    return;
  }
  res.render("urls_index_not_logged_in", templateVars);
  
});
//create a new url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  if (templateVars.user === undefined) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});
//Edit
app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
  res.redirect("/urls");
});
//Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});
//render update url template
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  if (req.session.user_id) {
    res.render("urls_show", templateVars);
  }
  res.render("urls_index_not_logged_in", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
