const {generateRandomString, lookupUserByEmail, urlsForUser} = require("./helpers");
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['7f69fa85-caec-4d9c-acd7-eebdccb368d5', 'f13b4d38-41c4-46d3-9ef6-8836d03cd8eb']
}));


//stores URLs
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "randomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "randomID"}
};

//user database
const users = {};

//render register template
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  res.render("register");
});

//create an account
app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (lookupUserByEmail(email, users) === false && password !== "") {
    req.session.user_id = randomID;
    res.redirect('/urls/');
  } else {
    res.send("400 Bad Request: User already exists");
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
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
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
      req.session.user_id = foundUserObj.id;
      res.redirect("/urls/");
      return;
    }
  }
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
app.get("/", (req, res) => {
  const templateVars = {user: users[req.session.user_id], urls: urlsForUser(req.session.user_id, urlDatabase)};
  if (req.session.user_id) {
    res.render("urls_index", templateVars);
    return;
  }
  res.render("urls_index_not_logged_in", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//render /urls only if user is logged in
app.get("/urls", (req, res) => {
  const templateVars = {user: users[req.session.user_id], urls: urlsForUser(req.session.user_id, urlDatabase)};
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

//render new url template
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
  if (!urlDatabase[req.params.shortURL]) {
    res.sendStatus(404);
  }
  const templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    res.render("urls_show", templateVars);
    return;
  } else {
    res.sendStatus(403);
    return;
  }
});

//render shortURL template
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
