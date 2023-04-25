const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const URL = require("../../../config/keys").URL;
const client_URL = require("../../../config/keys").client_URL;
const dbConnect = require('../../../dbConnect.js');
const Venues = require("../../dbSchema/owner/Venue");
const Activities = require("../../dbSchema/owner/Activity");
const emailSender = require("../../../config/sendEmails");
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
var db;
const users = [];
dbConnect.then(d => {
  // Use the Db object as needed  
  db = d;
  
  // console.log('Db object:', db);
}).catch(err => {
  console.error('Failed to get Db object:', err);
});
// @route POST /owner/getEvent
// @desc Register user
// @access Public
router.post("/getVenues", async (req, res) => {
  console.log(req.body);
  // console.log(db)
  const collection = db.collection('Venues');
  const venues = await collection.find({venueOwnerEmail: req.body.email}).toArray();
  const jsonString = JSON.stringify(venues);
  // console.log(jsonString);
  return res.json(jsonString);
});

router.post("/deleteVenues", async (req, res) => {
  console.log("Delete Venue");
  console.log(ObjectId(req.body.id));
  
  // console.log(db)
  const collection = db.collection('Venues');
  const users = []
  var venue_name;
  collection.findOne({ _id: ObjectId(req.body.id)}).then(async venue => {
    // console.log(venue);
    const filePath = path.join("../user_dashboards/public/img/", venue.image);
    venue_name = venue.venueName;
    if (fs.existsSync(filePath)) {
      // If file exists, delete it
      fs.unlinkSync(filePath);
      console.log('File deleted successfully');
    }
  });
  console.log(venue_name);
  db.collection('reservations').find({ eventId: ObjectId(req.body.id) }).toArray((err, docs) => {
    if (err) {
      console.log(err);
    } else {
      console.log(docs);
      docs.forEach((doc) => {
        users.push(doc.userEmail);
      });      
    }
    console.log(users);
  });  
  const result = await collection.deleteOne({ _id: ObjectId(req.body.id), venueOwnerEmail: req.body.owneremail });
  if (result.deletedCount === 1) {
    console.log("Sending Emails!");
    console.log(users);
    users.forEach(async (user) => {
      console.log(user);
      var sendMail = await emailSender(user, "Event Cancellation", ` Your Booked Venue ${venue_name} has been cancelled, we are really sorry, keep on checking for new events`);
      console.log(sendMail);
    }); // array of user-email addresses
    console.log("Deleting Resevations!");
    db.collection('reservations').deleteMany({ eventId: ObjectId(req.body.id) }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        return res.json({
          success: true,
          message: "Venue Successfully Deleted!"
        });
      }
    });       
  } else {
    return res.json({
      success: false,
      message: "Failed to Delete Venue!"
    });
  }
});

router.post("/updateVenues", async (req, res) => {
  console.log("Update Venue");
  console.log(req.body.eventID);
  // console.log(db)
  const collection = db.collection('Venues');
  const result = await collection.deleteOne({ _id: ObjectId(req.body.id), venueOwnerEmail: req.body.owneremail });
  collection.findOne({ _id: ObjectId(req.body.eventID)}).then(async venue => {
    if(venue){
      // const salt = crypto.randomBytes(16).toString('hex'); 
      const facilities = JSON.parse(req.body.facilities); 
      console.log(facilities);
      const availableTimeSlots = JSON.parse(req.body.availableTimeSlots);
      console.log(availableTimeSlots);
      console.log(req.body);
      collection.updateOne({ _id: ObjectId(req.body.eventID)}, { $set: 
        { venueName: req.body.venueName, location: req.body.location, sportName: req.body.sportName, description: req.body.description, image: req.body.image,
          availableTimeSlots: availableTimeSlots, facilities: facilities, date: req.body.date, cost: req.body.cost, maxCapacity: req.body.maxCapacity
        } }, (err, result) => {
        if (err) {
          console.log(err);
          res.json({success: false,message: err})
        }
        console.log(result);
        if(result.modifiedCount === 1){
          
          console.log("Success");
          res.json({success: true, message: 'Venue Successfully Updated!'});
        }
      });
    }
    else{
      res.json({success: false, message: 'Unable to find Venue!'});
    }
  });
});

// @route POST users/login
// @desc Login user and return JWT token
// @access Public
router.post("/venueRegister", async (req, res) => {
  // Form validation
  // console.log(req.body);
  const validateVenueInput = require("../venueValidation");
  const { errors, isValid } = validateVenueInput(req.body);// Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  req.body.facilities = JSON.parse(req.body.facilities);
  console.log(req.body.facilities);
  req.body.availableTimeSlots = JSON.parse(req.body.availableTimeSlots);
  console.log(req.body.availableTimeSlots);
  console.log(req.body)
  const newVenue = new Venues(req.body);
    // Save the data to MongoDB
  newVenue
  .save()
  .then(() => {
    res.json({
      success: true,
      message: "Venue Successfully Registered!"
    });
  })
  .catch(err => {
    res.json({
      success: false,
      message: err
    });
  });
});

router.post("/getActivities", async (req, res) => {
  console.log(req.body);
  // console.log(db)
  const activitycollection = db.collection('activities');
  const activities = await activitycollection.find({activityCreatedBy: req.body.email}).toArray();
  const jsonString = JSON.stringify(activities);
  console.log(jsonString);
  return res.json(jsonString);
});

router.post("/ActivityRegister", async (req, res) => {
  // Form validation
  console.log(req.body);
  const validateActivityInput = require("../activityValidation");
  const { errors, isValid } = validateActivityInput(req.body);// Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  req.body.facilities = JSON.parse(req.body.facilities);
  console.log(req.body.facilities);
  req.body.availableTimeSlots = JSON.parse(req.body.availableTimeSlots);
  console.log(req.body.availableTimeSlots);
  console.log(req.body)
  const newActivty = new Activities(req.body);  
  newActivty
  .save()
  .then(() => {
    res.json({
      success: true,
      message: "Activity Successfully Registered!"
    });
  })
  .catch(err => {
    res.json({
      success: false,
      message: err
    });
  }); 
});

router.post("/deleteActivity", async (req, res) => {
  console.log("Delete Activity");
  console.log(ObjectId(req.body.id));
  
  // console.log(db)
  const collection = db.collection('activities');
  const users = []
  var activity_name;
  collection.findOne({ _id: ObjectId(req.body.id)}).then(async activity => {
    
    console.log(activity);
    const filePath = path.join("../user_dashboards/public/img/", activity.image);
    activity_name = activity.activityName;
    if (fs.existsSync(filePath)) {
      // If file exists, delete it
      fs.unlinkSync(filePath);
      console.log('File deleted successfully');
    }
  });
  console.log(activity_name);
  db.collection('reservations').find({ eventId: ObjectId(req.body.id) }).toArray((err, docs) => {
    if (err) {
      console.log(err);
    } else {
      console.log(docs);
      docs.forEach((doc) => {
        users.push(doc.userEmail);
      });      
    }
    console.log(users);
  });  
  const result = await collection.deleteOne({ _id: ObjectId(req.body.id), activityCreatedBy: req.body.owneremail });
  if (result.deletedCount === 1) {
    console.log("Sending Emails!");
    console.log(users);
    users.forEach(async (user) => {
      console.log(user);
      var sendMail = await emailSender(user, "Event Cancellation", ` Your Booked Activty ${activity_name} has been cancelled, we are really sorry, keep on checking for new events`);
      console.log(sendMail);
    }); // array of user-email addresses
    console.log("Deleting Resevations!");
    db.collection('reservations').deleteMany({ eventId: ObjectId(req.body.id) }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        return res.json({
          success: true,
          message: "Activity Successfully Deleted!"
        });
      }
    });       
  } else {
    return res.json({
      success: false,
      message: "Failed to Delete Activity!"
    });
  }
});

router.post("/updateActivity", async (req, res) => {
  console.log("Update Activity");
  console.log(req.body.eventID);
  // console.log(db)
  const collection = db.collection('activities');
  const result = await collection.deleteOne({ _id: ObjectId(req.body.id), activityCreatedBy: req.body.owneremail });
  collection.findOne({ _id: ObjectId(req.body.eventID)}).then(async venue => {
    if(venue){
      // const salt = crypto.randomBytes(16).toString('hex'); 
      const facilities = JSON.parse(req.body.facilities); 
      console.log(facilities);
      const availableTimeSlots = JSON.parse(req.body.availableTimeSlots);
      console.log(availableTimeSlots);
      console.log(req.body);
      collection.updateOne({ _id: ObjectId(req.body.eventID)}, { $set: 
        { activityName: req.body.activityName, activityLocation: req.body.location, description: req.body.description, image: req.body.image,
          availableTimeSlots: availableTimeSlots, facilities: facilities, date: req.body.date, cost: req.body.cost, ageRange: req.body.ageRange, maxCapacity: req.body.maxCapacity
        } }, (err, result) => {
        if (err) {
          console.log(err);
          res.json({success: false,message: err})
        }
        console.log(result);
        if(result.modifiedCount === 1){
          
          console.log("Success");
          res.json({success: true, message: 'Activity Successfully Updated!'});
        }
      });
    }
    else{
      res.json({success: false, message: 'Unable to find Activity!'});
    }
  });
});


module.exports = router;
