
const mongoose = require("mongoose");
const cities = require("./cities");
const {descriptors, places} = require("./seedHelpers")

const port = 3000;
const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/yelpcamp');
// , {
//   useNewUrlParser: true,
//   UseCreateIndex: true,
//   useUnifiedTopology: true                               // not required after the mongoose 6 release -- it treats these properties as true by default
// });

const db = mongoose.connection;
db.on("error", console.error.bind(console, " connection error: "));
db.once("open", () => {
  console.log("Database Connected to index.js");                         // This block is written to inform us that the connection is successful
});

const titlePicker = (array) => array[Math.floor(Math.random()*array.length)] ;

const seedDB = async() => {
  await Campground.deleteMany({});
  for(let i=0; i<50; i++) {
    let randompick = Math.floor(Math.random()*1000);
    let pricePick = Math.floor(Math.random()*1000)+1000;
    const camp = new Campground ({
    title : `${titlePicker(descriptors)} - ${titlePicker(places)}` ,
    location : `${cities[randompick].city}, ${cities[randompick].state}`,
    image : `https://source.unsplash.com/random/300x300?camping`,
    description : "Dare to live the life you've always wanted",
    price : `${pricePick}`,
    author : '6337ca8de388b3d5c6cca775'
  })
  await camp.save();
  }

}


seedDB()
.then( () => {
  db.close()
})
