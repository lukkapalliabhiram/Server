// controllers/reservationsController.js
const Reservation = require("../models/Reservation");

exports.createReservation = async (req, res) => {
  try {
    const reservation = new Reservation(req.body);
    console.log("res=",reservation);
    await reservation.save();
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
