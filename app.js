const express = require("express");
const path = require("path");
// const Campground = require('./models/campground');
const mongoose = require("mongoose");
const port = 3000;
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
// const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
// const Joi = require("joi");
// const {joiSchema, reviewJoiSchema} = require("./schemas.js");
// const Review = require("./models/review");

const campRoutes = require("./routes/campRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const registerRoutes = require("./routes/registerRoutes");

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalPassport = require("passport-local");
const User = require("./models/user");

mongoose.connect('mongodb://localhost:27017/yelpcamp')
// , {
//   useNewUrlParser: true,
//   UseCreateIndex: true,
//   useUnifiedTopology: true                               // not required after the mongoose 6 release -- it treats these properties as true by default
// });

const db = mongoose.connection;
db.on("error", console.error.bind(console, " connection error: "));
db.once("open", () => {
  console.log("Database Connected");                         // This block is written to inform us that the connection is successful
});


const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');                            // We dont have to require ejs -- This statement wil make 'express' to automatically integrate ejs for us and the view engine looks for ejs files as mentioned
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended : true}));           //express.urlencoded() function is a built-in middleware function in Express. It parses incoming requests with urlencoded payloads and is based on body-parser.
app.use(methodOverride('_method'));                        // '_method is the query string name we have used in the edit.ejs form ACTION'

app.use(express.static(path.join(__dirname , 'public')));  // assigning express to use the 'public' folder for static files/assets , __dirname refers to the currently active folder

const sessionConfig = {
  secret: 'donttellanyone',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + (1000* 60 * 60 * 24 * 7),
    maxAge: 1000* 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());      // to have persistent login sessions
app.use(passport.session());
//autheticate static method is provided by passport-local-mongoose
passport.use(new LocalPassport(User.authenticate()));

// storing and removing user from the session

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
  // console.log(req.session); explore the details stored in the session
  res.locals.currentUser = req.user;
  // below flash middleware set up ensures we always have access to local variables sucess & error (they become global variables) -- so we dont have to pass them to templates everytime during render
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})


app.use('/campgrounds', campRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', registerRoutes);

app.get('/', (req,res) =>{
  res.render(`home`);       // render looks into the views folder for an ejs file by default as mentioned above and so the (dot).ejs extension or the file path are NOT required
})





app.all('*', (req, res, next) => {
  next(new ExpressError('Page not Found', 404));
})

app.use((err, req, res, next) => {
  const {statusCode =500} = err;  // assigning a default statuscode and error message
  if(!err.message)
  err.message = "Oops, something went wrong🙄"
  res.status(statusCode).render('error', {err});

})

app.listen(port, () => {
  console.log(`Listening to port: ${port}`);
})
