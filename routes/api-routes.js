const db = require("../models");
const passport = require("../config/passport");
require("dotenv").config();
const NewsAPI = require("newsapi");
const newsapi = new NewsAPI(process.env.NewsAPI_Key);

module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Sending back a password, even a hashed password, isn't a good idea
    res.json({
      email: req.user.email,
      id: req.user.id
    });
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", (req, res) => {
    db.User.create({
      email: req.body.email,
      password: req.body.password
    })
      .then(() => {
        res.redirect(307, "/api/login");
      })
      .catch(err => {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", (req, res) => {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id
      });
    }
  });

  // GET route for showing all businesses
  app.get("/api/businesses", (req, res) => {
    db.Business.findAll({}).then(result => {
      res.json(result);
    });
  });

  //GET route for retrieving all businesses based on category
  app.get("/api/businesses/:category", (req, res) => {
    db.Business.findAll({
      where: {
        CategoryID: req.params.category
      },
      include: [db.Category]
    }).then(result => {
      res.json(result);
    });
  });

  //GET route for retrieving all businesses based on city
  app.get("/api/businesses/:city", (req, res) => {
    db.Business.findAll({
      where: {
        //CITY: req.params.category ***** Add city column to database?
      }
    }).then(result => {
      res.json(result);
    });
  });

  //POST route for saving a new business to the businesses table
  app.post("/api/businesses", (req, res) => {
    db.Business.create(req.body).then(result => {
      res.json(result);
    });
  });

  //GET route for querying the NewsAPI package for articles
  app.get("/api/news/:sort", (req, res) => {
    newsapi.v2
      .everything({
        q: "blm",
        sortBy: req.params.sort,
        language: "en"
      })
      .then(response => {
        res.json(response);
      });
  });
};
