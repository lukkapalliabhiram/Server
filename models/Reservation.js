// models/Reservation.js
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  bookingTime: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  venue_type: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: null,
  },
});

const Reservation = mongoose.model("Reservations", reservationSchema);

module.exports = Reservation;
