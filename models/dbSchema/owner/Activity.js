const mongoose = require('mongoose')
const activitySchema = new mongoose.Schema({
    activityName: {
      type: String,
      required: true
    },
    activityLocation: {
      type: String,
      required: true
    },
    activityCreatedBy: {
        type: String,
        required: true
    },
    ageRange: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      required: true,
      default: 0
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    maxCapacity: {
      type: String,
      required: true
    },
    occupied: {
        type: String,
        default: 0
    },
    rating: {
      type: String,
    },
    facilities: [
      {
        type: String
      }
    ],
    availableTimeSlots: [
      {
        type: String
      }
    ],
    date: {
      type: Date,
      required: true
    }
})
module.exports = mongoose.model('activities', activitySchema, 'activities');