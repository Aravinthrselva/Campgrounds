const express = require("express");

// {mergeParams : true} is required - since the "/:id " (campground id reference) is not present in the routes
const router = express.Router({mergeParams: true});

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

const Campground = require('../models/campground');
const Review = require("../models/review");

const {reviewJoiSchema} = require("../schemas.js");

const {validateReview, isLoggedIn, isReviewAuthor} = require("../utils/middlewares")



router.post('/', isLoggedIn, validateReview,  catchAsync(async(req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);

  await review.save();
  await campground.save();

  req.flash('success', 'Your review was posted');
  res.redirect(`/campgrounds/${campground._id}`);
}));


router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req, res) => {
  const {id, reviewId} = req.params;

  await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}})           // $pull operator from mongo is used to completely remove all references to the matching Ids passed
  await Review.findByIdAndDelete(reviewId)

  req.flash('success', 'deleted a review');
  res.redirect(`/campgrounds/${id}`);

}))

module.exports = router;
