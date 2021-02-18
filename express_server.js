const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

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
const urlsForUser = function(id){
  let foundShortURL = {};
  for(let urls in urlDatabase){
    if (urlDatabase[urls].userID === id){
      foundShortURL[urls] = urlDatabase[urls];
    }
  }
  return foundShortURL;
}
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "randomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "randomID"}
};

const users = {
  "randomID": {
    id: "randomID",
    email: "user@example.com",
    password: "whatever"
  }
};

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const email = req.body.email;
  const password  = req.body.password;
  if (lookupUserByEmail(email, users) === false) {
    res.cookie('user_ID', randomID);
    res.redirect('/urls/');
  } else {
    res.sendStatus(400)
  }
  const userObj = {
    id: randomID,
    email,
    password
  };
  users[randomID] = userObj;
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password  = req.body.password;
  if (lookupUserByEmail(email, users) === false){
    res.sendStatus(403)
    } else {
      let foundUserObj = lookupUserByEmail(email, users);
      if (foundUserObj.password !== password){
        res.sendStatus(403) 
      } else {
        res.cookie('user_ID', foundUserObj.id);
        res.redirect("/urls/");
      }
    }  
  res.redirect("/urls/");
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_ID");
  res.redirect("/urls");
});
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  const templateVars = {user: users[req.cookies['user_ID']], urls: urlsForUser(req.cookies['user_ID'])};
  if (req.cookies['user_ID']){
  res.render("urls_index", templateVars);
  } 
  res.render("urls_index_not_logged_in", templateVars);
  
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies['user_ID']};
  res.redirect(`/urls/${shortURL}`);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies['user_ID']]};
  if (templateVars.user === undefined){
    res.redirect("/login")
  }
  res.render("urls_new", templateVars);
});
//Edit
app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies['user_ID']){
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
  res.redirect("/urls");
});
//Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies['user_ID']){
  delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies['user_ID']], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  if (req.cookies['user_ID']){
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
