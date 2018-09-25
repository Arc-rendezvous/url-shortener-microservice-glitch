const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

const urlsSchema = new mongoose.Schema({
  longurl: String,
  shorturl: Number,
});
const Url = mongoose.model('Url', urlsSchema);

module.exports.createNew = function(urlToAdd, done) {
  
  // check if collection Url is empty
  Url.count(function(err, count) {
    if (!err && count == 0) { // empty
      // create new data
      const url = new Url({longurl: urlToAdd, shorturl: 1});
      url.save((err, data) => err ? done(err) : done(null, data.shorturl));
    } 
    else if (err) {
      return done(err)
    } 
    else { // not empty
      // check if urlToAdd already exists in collection
      Url.findOne({longurl: urlToAdd}, (err, data) => {
        if (err) {
          return done(err);
        } else if (data) {
          return done(null, data.shorturl)      
        } else { // populate database with new urlToAdd adding +1 to the largest shorturl
          Url.find().sort({shorturl:-1}).limit(1).exec(function(err, data) {
            if (err) { 
              return done(err) 
            } else {
              const newshorturl = data[0].shorturl + 1;
              const url = new Url({longurl: urlToAdd, shorturl: newshorturl});
              url.save((err, data) => err ? done(err) : done(null, data.shorturl));
            }
          });
        }
      });
    }
  });
};

// get longurl name from database based on shorturl param
module.exports.getLongUrl = function (shorturl, callback) {
  Url.findOne({shorturl: shorturl}, function (err, data){
    if (data) {
      return callback(null, data.longurl)
    } else {
      return callback(err, null)
    }
  })
}
