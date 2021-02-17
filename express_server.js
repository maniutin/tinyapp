const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const generateRandomString = function() {
  let result = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charLength = chars.length;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

const emailLookup = function (response, email, userDB){
  if (email === ""){
    response.sendStatus(400)
  } else {
    for (let user in userDB){
      if (userDB[user].email === email) {
        response.sendStatus(400)
      }
    }
  }
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  "randomID": {
    id: "randomID",
    email: "user@example.com",
    password: "whatever"
  }
}

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const email = req.body.email
  const password  = req.body.password
  if (emailLookup(res, email, users) !== 400){
    res.cookie('user_ID', randomID)
    res.redirect('/urls/');
  }
  const userObj = {
    id: randomID, 
    email,
    password
  }
  users[randomID] = userObj;  
});
app.get("/login", (req, res) => {
  res.render("login");
});
// app.post("/login", (req, res) => {
//   res.redirect("/urls");
// });
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
  const templateVars = {user: users[req.cookies['user_ID']], urls: urlDatabase};
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies['user_ID']]};
  res.render("urls_new", templateVars);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies['user_ID']],shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
