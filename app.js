const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const port = 3000;
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Campground = require('./models/campground');


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


app.get('/', (req,res) =>{
  res.render(`home`);                                     // render looks into the views folder for an ejs file by default as mentioned above and so the (dot).ejs extension or the file path are NOT required
})

app.get('/campgrounds', async(req, res) =>{
  const campgrounds = await Campground.find({});
  res.render(`campgrounds/index`, {campgrounds})          // {campgrounds} passes the file over to the ejs for rendering
})

app.get('/campgrounds/add', (req, res) => {
  res.render('campgrounds/add')
})

app.post('/campground-added', async(req, res) => {
  const campground = new Campground(req.body.campground);    // req.body needs to be parsed by express using urlencoded as above- to get a readable text
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`)
})



app.get('/campgrounds/:id', async(req, res) => {
  const campground = await Campground.findById(req.params.id)
  res.render('campgrounds/show', {campground})
})

app.get('/campgrounds/:id/edit', async(req, res) => {
  const campground = await Campground.findById(req.params.id)
  res.render('campgrounds/edit', {campground})
})

app.put('/campgrounds/:id', async(req, res) => {
  const {id} = req.params;                                    // destructuring the value of id from the request
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});   // using a spread operator (...) allows an iterable (such as array ) to be expanded in places where zero or more arguments are elements are expected
  res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campground/:id', async(req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds')
})

app.listen(port, () => {
  console.log(`Listening to port: ${port}`);
})
