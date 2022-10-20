const mongoose = require("mongoose");
const Review = require('./review')


const Schema = mongoose.Schema ;

const CampgroundSchema = new Schema({
  title : String,
  price : Number,
  image : String,
  location: String,
  description : String,
  author : {
    type : Schema.Types.ObjectId,
    ref : 'User'
  },
  reviews: [
    {
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }
  ]
});

CampgroundSchema.post('findOneAndDelete', async function(doc) {   // .post middleware is only triggered after the action is performed (delete in this case)
  if(doc) {
    await Review.deleteMany({
        _id: {
          $in: doc.reviews                  // To delete all review object ID references associated with the deleted campground
        }
    })
  }
})
module.exports = mongoose.model('Campground', CampgroundSchema);
