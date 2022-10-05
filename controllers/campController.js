const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary/cloudinaryIndex');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken :mapBoxToken });


module.exports.index = async(req, res) =>{
  const campgrounds = await Campground.find({});
  res.render(`campgrounds/index`, {campgrounds})          // 'render' passes the {campgrounds} data over to the ejs for rendering
}


module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/add')
}


module.exports.addNewCamp = async(req, res, next) => {
  const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send()
  const campground = new Campground(req.body.campground);    // req.body needs to be parsed by express using urlencoded as above- to get a readable text
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))  // parsed using multer
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash('success', 'successfully added a new campground!');
  res.redirect(`/campgrounds/${campground._id}`)
}


module.exports.showCamp = async(req, res) => {
  // populate method helps to recover the value from the object id
  const campground = await Campground.findById(req.params.id).populate({
      path: 'reviews',
      populate: {
        path: 'author'
      }
      }).populate('author');

  if(!campground){
    req.flash('error', "That camp doesnt exist");
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', {campground})
}


module.exports.editCamp = async(req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id)
  if(!campground){
    req.flash('error', "That camp doesnt exist");
    return res.redirect('/campgrounds');
  }

  res.render('campgrounds/edit', {campground})
}



module.exports.updateCamp = async(req, res) => {
  const {id} = req.params;
  console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});   // using a spread operator (...) allows an iterable (such as array ) to be expanded in places where zero or more arguments are elements are expected
  const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
  campground.images.push(...imgs);
  await campground.save();
  if(req.body.deleteImages) {
    for(let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);              //deleting the file with that filename from cloudinary
    }
     await campground.updateOne({ $pull: {images: { filename: { $in : req.body.deleteImages}} } });
     console.log(campground);
  }
  req.flash('success', 'successfully updated campground!');
  res.redirect(`/campgrounds/${campground._id}`);
}




module.exports.deleteCamp = async(req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);                    // this triggers the findOneAndDelete mongoose middleware in campground.js

  req.flash('success', 'successfully removed that campground')
  res.redirect('/campgrounds');
}
