// routes/reservations.js
const express = require("express");
const router = express.Router();
const reservationsController = require("../controllers/reservationsController");
const Reservation = require("../models/Reservation");


router.post("/book", async (req, res) => {
    const { eventId, userEmail, bookingTime, venue_type } = req.body;
  
    try {
      const reservation = new Reservation({
        userEmail,
        event: eventId,
        bookingTime,
        venue_type,
      });
  
      await reservation.save();
      res.status(201).json({ message: "Booking successfully created!", reservation });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Failed to store the booking data" });
    }
  });
module.exports = router;
