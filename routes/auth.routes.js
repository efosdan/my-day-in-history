const { Router } = require("express");
const mongoose = require("mongoose");

const router = new Router();
const bcryptjs = require("bcrypt");
const saltRounds = 10;
const User = require("../models/User.model");

router.get("/signup", (req, res) => res.render("auth/signup"));
router.get("/login", (req, res) => res.render("auth/login"));

router.post("/signup", (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.render("auth/signup", {
      errorMessage:
        "All fields are mandatory. Please provide your Username, Email and password",
    });
    return;
  }
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.status(500).render("auth/signup", {
      errorMessage:
        "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      return User.create({
        username,
        email,
        passwordHash: hashedPassword,
      });
    })
    .then((userFromDb) => {
      res.redirect("/login");
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render("auth/signup", { errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).render("auth/signup", {
          errorMessage:
            "Username and email must be unique. Either username or email is already used.",
        });
      } else {
        next(error);
      }
    });
});

router.post("/login", (req, res, next) => {
  console.log("SESSION =====> ", req.session);
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.render("auth/login", {
      errorMessage: "please enter Email and Password login",
    });
    return;
  }
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        res.render("auth/login", { errorMessage: "Email is not registered" });
        return;
      } else if (bcryptjs.compareSync(password, user.passwordHash)) {
        req.session.user = user;
        res.redirect("profile");
      } else {
        res.render("auth/login", { errorMessage: "Incorrect password." });
      }
    })
    .catch((error) => next(error));
});

router.get("/profile", async (req, res) => {
  res.render("users/profile", { user: req.session.user });
});

router.get("/logout", async (req, res) => {
  req.session.user = null;
  res.render("auth/login");
});

module.exports = router;
