const mongoose = require('mongoose')
const venueSchema = new mongoose.Schema({
    venueName: {
      type: String,
      required: true
    },
    venueOwnerEmail: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    sportName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    availableTimeSlots: [
      {
        type: String
      }
    ],
    rating: {
      type: Number,
      default: 0
    },
    architecturalMapImage: {
      type: String,
      default: ""
    },
    facilities: [
      {
        type: String
      }
    ],
    date: {
      type: Date,
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
    cost: {
      type: String,
      required: true,
      default: 0
    }
})
module.exports = mongoose.model('Venues', venueSchema,'Venues');