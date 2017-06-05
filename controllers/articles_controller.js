//----------------Dependencies--------------
var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

// Requiring our Note and Article models
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/newYorkTimeScraping");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// ================
// ======Routes====
// ================

router.get("/scrape", function(req, res) {
	// Making a request call for nhl.com's homepage
	request("https://www.nytimes.com/", function(error, response, html) {

  	// Load the body of the HTML into cheerio
   	var $ = cheerio.load(html);

  	// With cheerio, find each h2-tag with the class "story-heading"
  	$("article.story.theme-summary").each(function(i, element) {
      // Empty array to save our scraped data
      var result = [];
      
      // Save the text of the h2-tag as "title"
      result.title = $("h2.story-heading").text();

      // // Find the h2 tag's children a-tag, and save it's href value as "link"
      result.link = $("h2.story-heading").children().attr("href");

      // // Find the h2 tag's children p-tag, and save it's as "summary"
      result.summary = $("p.summary").text();
      
      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });
    });
    // // Tell the browser that we finished scraping the text
    // res.send("Scrape Complete");
    // After the program scans each h2.story-heading, log the result
    console.log(result);
  });

});

// This will get the articles we scraped from the mongoDB
router.get("/", function(req, res) {
  res.render("index");
});

// // Grab an article by it's ObjectId
// router.get("/articles/:id", function(req, res) {
//   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
//   Article.findOne({ "_id": req.params.id })
//   // ..and populate all of the notes associated with it
//   .populate("note")
//   // now, execute our query
//   .exec(function(error, doc) {
//     // Log any errors
//     if (error) {
//       console.log(error);
//     }
//     // Otherwise, send the doc to the browser as a json object
//     else {
//       res.json(doc);
//     }
//   });
// });


// // Create a new note or replace an existing note
// router.post("/articles/:id", function(req, res) {
//   // Create a new note and pass the req.body to the entry
//   console.log("i'm trying to see this below")
//    console.log(req.body)
//   var newNote = new Note(req.body);


//   // And save the new note the db
//   newNote.save(function(error, doc) {
//     // Log any errors
//     if (error) {
//       console.log(error);
//     }
//     // Otherwise
//     else {
//       // Use the article id to find and update it's note
//       Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
//       // Execute the above query
//       .exec(function(err, doc) {
//         // Log any errors
//         if (err) {
//           console.log(err);
//         }
//         else {
//           // Or send the document to the browser
//           res.send(doc);
//         }
//       });
//     }
//   });
// });


      // for (var i = 0; i < result.length; i++) {
      //  result[i]
      // }
// router.get("/saved", function(req, res) {
//   // Grab every doc in the Articles array
//   Article.find({}, function(error, doc) {
//     // Log any errors
//     if (error) {
//       console.log(error);
//     }
//     // Or send the doc to the browser as a json object
//     else {
//       res.json(doc);
//     }
//   });
//   res.render("saved");
// });

module.exports = router;