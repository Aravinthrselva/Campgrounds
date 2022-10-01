
const ExpressError = require("../utils/ExpressError");
const {joiSchema, reviewJoiSchema} = require("../schemas.js");
const Campground = require('../models/campground');
const Review = require("../models/review");


module.exports.isLoggedIn = (req, res, next) => {
  // console.log("Requesting user details... ", req.user);
  if(!req.isAuthenticated()) {
    // console.log(req.originalUrl)
    //store the path the user is trying to access
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be logged in');
    return res.redirect('/login');
  }
  next();
}


module.exports.validateCamp = (req, res, next) => {

  const {error} = joiSchema.validate(req.body);
  if(error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400);
  }
    next();
}

module.exports.validateReview = (req, res, next) => {
  const {error} = reviewJoiSchema.validate(req.body);
  if(error) {

    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  }
  else {
    next();
  }
}


module.exports.isAuthor = async(req, res, next) => {
  const{id} = req.params;
  const campground = await Campground.findById(id);
  if(!campground.author.equals(req.user._id)) {
    req.flash('error', 'Sorry, you dont have the permission');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
  const{id, reviewId} = req.params;
  const review = await Review.findById(reviewId);
  if(!review.author.equals(req.user._id)) {
    req.flash('error', 'Sorry, you dont have the permission');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}
