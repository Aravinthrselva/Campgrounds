const express = require("express");

// {mergeParams : true} is required - since the "/:id " (campground id reference) is not present in the routes
const router = express.Router({mergeParams: true});

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

const Campground = require('../models/campground');
const Review = require("../models/review");

const {reviewJoiSchema} = require("../schemas.js");


const validateReview = (req, res, next) => {
  const {error} = reviewJoiSchema.validate(req.body);
  if(error) {

    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  }
  else {
    next();
  }
}


router.post('/', validateReview,  catchAsync(async(req, res) => {
  const campground = await Campground.findById(req.params.id);
  console.log(req.params);
  const review = new Review(req.body.review);
  campground.reviews.push(review);

  await campground.save();
  await review.save();

  req.flash('success', 'Your review was posted');
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', catchAsync(async(req, res) => {
  const {id, reviewId} = req.params;

  await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}})           // $pull operator from mongo is used to completely remove all references to the matching Ids passed
  await Review.findByIdAndDelete(reviewId)

  req.flash('success', 'deleted a review');
  res.redirect(`/campgrounds/${id}`);

}))

module.exports = router;
