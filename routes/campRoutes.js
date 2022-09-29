const express = require("express");
const router = express.Router();

const Campground = require('../models/campground');
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const {joiSchema} = require("../schemas.js");



const validateCamp = (req, res, next) => {

  const {error} = joiSchema.validate(req.body);
  if(error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400);
  }
  else {
    next();
  }
}



router.get('/', catchAsync(async(req, res) =>{
  const campgrounds = await Campground.find({});
  res.render(`campgrounds/index`, {campgrounds})          // 'render' passes the {campgrounds} data over to the ejs for rendering
}));

router.get('/add', (req, res) => {
  res.render('campgrounds/add')
})

router.post('/', validateCamp, catchAsync(async(req, res, next) => {

  const campground = new Campground(req.body.campground);    // req.body needs to be parsed by express using urlencoded as above- to get a readable text
  await campground.save();
  req.flash('success', 'successfully added a new campground!');
  res.redirect(`/campgrounds/${campground._id}`)
}));



router.get('/:id', catchAsync(async(req, res) => {
  const campground = await Campground.findById(req.params.id).populate('reviews');
  if(!campground){
    req.flash('error', "That camp doesnt exist");
    res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', {campground})
}));

router.get('/:id/edit', catchAsync(async(req, res) => {
  const campground = await Campground.findById(req.params.id)
  if(!campground){
    req.flash('error', "That camp doesnt exist");
    res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', {campground})
}));

router.put('/:id',validateCamp, catchAsync(async(req, res) => {
  const {id} = req.params;                                    // destructuring the value of id from the request
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});   // using a spread operator (...) allows an iterable (such as array ) to be expanded in places where zero or more arguments are elements are expected

  req.flash('success', 'successfully updated campground!');
  res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:id', catchAsync(async(req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);                    // this triggers the findOneAndDelete mongoose middleware in campground.js

  req.flash('success', 'successfully removed that campground')
  res.redirect('/campgrounds');
}));

module.exports = router;
