const express = require("express");
const nodemailer = require('nodemailer');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const db = require("./config/keys").mongoURI;
const users = require("./models/validation/routes/loginApi");
const owners = require("./models/validation/routes/ownerApi");
const app = express();// Bodyparser middleware
const GOOGLE_CLIENT_ID = require("./config/keys").GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = require("./config/keys").GOOGLE_CLIENT_SECRET;
const URL = require("./config/keys").URL;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const session = require('express-session');
const cookieParser = require("cookie-parser");
const request = require('request');
const cors = require('cors');
const multer = require('multer');
const sendEmail = require("./sendemail");
const fs = require('fs');
const Reservation = require('./models/Reservation');

const stripe = require("stripe")('sk_test_51Mn4LdAFfsqlcVQEYKs5iJqqqBrYpmZkyJtAGUdzs0370c8BzGj464gvD0nGqrOnmT6Jzf5M8yvC8iNvNwm95Owu00nbXIADrF');
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../user_dashboards/public/img/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });


app.post('/api/uploadImage', upload.single('image'), (req, res) => {
  const { name, description } = req.body;
  const { filename } = req.file;
  // res.json({success: true, message: 'Image uploaded successfully.'});
  // res.status(200).send('Image uploaded successfully.');
  res.status(200).json({ message: 'Image uploaded successfully.' });
});


const chargeCustomer = async (customerId) => {
  // Lookup the payment methods available for the customer
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });
  try {
    // Charge the customer and payment method immediately
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1099,
      currency: "usd",
      customer: customerId,
      payment_method: paymentMethods.data[0].id,
      off_session: true,
      confirm: true,
    });
  } catch (err) {
    // Error code will be authentication_required if authentication is needed
    console.log("Error code is: ", err.code);
    const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
    console.log("PI retrieved: ", paymentIntentRetrieved.id);
  }
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;
  // Alternatively, set up a webhook to listen for the payment_intent.succeeded event
  // and attach the PaymentMethod to a new Customer
  const customer = await stripe.customers.create();

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    customer: customer.id,
    setup_future_usage: "off_session",
    amount: calculateOrderAmount(items),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.put('/api/reservation/rating/:reservationId', async (req, res) => {
  try {
    const reservationId = req.params.reservationId;
    const rating = req.body.rating;

    const result = await Reservation.updateOne(
      { _id: mongoose.Types.ObjectId(reservationId) },
      { $set: { rating: rating } },
    );

    if (result.matchedCount === 1) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Reservation not found' });
    }
  } catch (error) {
    console.error('Error updating reservation rating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/venues/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const event = await Venue.findById(eventId); // Assuming you have an Event model
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching event by ID' });
  }
});

app.get('/api/activities/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const event = await activity.findById(eventId); // Assuming you have an Event model
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching event by ID' });
  }
});

app.get('/api/players/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const event = await player.findById(eventId); // Assuming you have an Event model
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching event by ID' });
  }
});

app.post("/send-invitation", async (req, res) => {
  const { userName, inviteEmail, reservationId, value } = req.body;

  // Configure your email server credentials and settings
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "hanabiy678@gmail.com",
      pass: "nadbzycciifsovjk"
    },
    port: 465,
    host: 'smtp.gmail.com'
  });
  const inviteUrl = `https://hanabi-hyuga.onrender.com/invitation/${value}/${reservationId}`;
  const emailContent = `
  <p>You have been invited to join an event by ${userName}. Click the link below to see the event details:</p>
  <p><a href="${inviteUrl}">${inviteUrl}</a></p>
`;
  // Configure the email content
  const mailOptions = {
    from: '"Hanabi Yuga" <your.email@gmail.com>',
    to: inviteEmail,
    subject: "You are invited to an event",
    html: emailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    res.status(500).json({ error: error.message });
  }
});


app.post("/send-confirmation-email", async (req, res) => {
  const { userEmail, bookingTime } = req.body;

  // Configure your email server credentials and settings
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "hanabiy678@gmail.com",
      pass: "nadbzycciifsovjk"
    },
    port: 465,
    host: "smtp.gmail.com",
  });

  const emailContent = `
    <p>Dear ${userEmail},</p>
    <p>Your booking from HanabiYuga at ${bookingTime} has been confirmed.</p>
  `;

  // Configure the email content
  const mailOptions = {
    from: '"Hanabi Yuga" <your.email@gmail.com>',
    to: userEmail,
    subject: "Booking Confirmation",
    html: emailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/reservations/book", async (req, res) => {
  const { eventId, userEmail, bookingTime, venue_type } = req.body;



  try {
    const reservation = new Reservation({
      userEmail,
      eventId,
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

// server.js (Express.js example)
app.get('/api/reservations/user/:userEmail', async (req, res) => {
  const userEmail = req.params.userEmail;
  try {
    const reservations = await Reservation.find({ userEmail });
    const reservationDetailsPromises = reservations.map(async (reservation) => {
      const { eventId, venue_type } = reservation;

      let eventDetails;
      if (venue_type === 'venue') {
        eventDetails = await Venue.findById(eventId);
      } else if (venue_type === 'activity') {
        eventDetails = await activity.findById(eventId);
      } else if (venue_type === 'player') {
        eventDetails = await player.findById(eventId);
      }

      return {
        ...reservation.toObject(),
        eventDetails: eventDetails ? eventDetails.toObject() : null
      };
    });

    const reservationDetails = await Promise.all(reservationDetailsPromises);
   
    res.json(reservationDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reservations for user' });
  }
});


app.delete('/api/reservations/cancel/:reservationId', async (req, res) => {
  const reservationId = req.params.reservationId;
  try {
    await Reservation.findByIdAndDelete(reservationId); // Assuming you have a Reservation model
    res.json({ message: 'Reservation successfully canceled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error canceling reservation' });
  }
});



// Add this to your server-side code
app.get('/api/events/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const event = await Event.findById(eventId); // Assuming you have an Event model
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching event by ID' });
  }
});


app.use(cookieParser());
const cookie_expire = 1000 * 60 * 60 * 1;
app.use(
  bodyParser.urlencoded({
    extended: false
  }),
  session({
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: cookie_expire, secure: true },
    secret: 'SECRET'
  })
);
app.use(bodyParser.json());// DB Config
// const db = require("./config/keys").mongoURI;// Connect to MongoDB
mongoose.connect(
  db,
  { useNewUrlParser: true }
)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

var userProfile, msg;
// Passport middleware
app.use(passport.initialize());// Passport config
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: URL + "/auth/google/callback"
},
  function (accessToken, refreshToken, profile, done) {
    userProfile = profile;
    return done(null, userProfile);
  }
));

app.get('/error', (req, res) => res.redirect('/login' + req.body));
app.get('/success', (req, res) => res.redirect('/'));
app.use("/users", users);
app.use("/owners", owners);


app.get('/userdata1', (req, res) => {
  // Get user data from the session
  const user = req.session.user;
  res.json(user);
});

app.get('/userdata', async (req, res) => {
  try {
    const user = req.session.user;
    res.json(user);
  } catch (err) {
    console.error('Error retrieving venues:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

console.log(session.user);



app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/forgotPassword', function (req, res) {
  res.sendFile('pages/forgot_password.html', { root: '.' })
});


app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  function (req, res) {
    // Successful authentication, redirect success.
    const options = {
      url: URL + '/users/googleSignIn',
      json: true,
      body: {
        user: userProfile,
        role: 1
      }
    };
    request.post(options, (err, req_res, body) => {
      if (err) {
        console.log("error found" + err);
        res.redirect('/login?message=' + err.message);
      }
      console.log("error not found");
      console.log("body" + body);
      console.log(`Status: ${req_res.statusCode}`);
      // console.log("Google Login");
      // console.log(req.session);
      // msg = req_res.body;
      req.session.login = 1;
      req.session.role = 0;
      req.session.name = req.session.passport.displayName;
      req.session.save();
      console.log(req.session);
      res.redirect('/');
    });

  });

// Define a schema for your venues collection using Mongoose
const venueSchema = new mongoose.Schema({
  venueName: String,
  venueOwnerEmail: String,
  location: String,
  sportName: String,
  description: String,
  image: String,
  availableTimeSlots: [String],
  rating: Number,
  architecturalMapImage: String,
  facilities: [String],
  date: String,
  cost: String,
});


const activitySchema = new mongoose.Schema(
  {
    activityName: String,
    activityLocation: String,
    ageRange: String,
    cost: String,
    description: String,
    image: String,
    availableTimeSlots: [String],
    maxCapacity: Number,
    rating: Number,
    facilities: [String],
    date: String,
  });

const playerSchema = new mongoose.Schema(
  {
    playerName: String,
    playerGender: String,
    playerAgeRange: String,
    playerSkillLevel: String,
    playerAvailability: String,
    playerSportActivity: String,
    description: String,
    emailId: String,
    phoneNumber: String,
    image: String,
    address: String,
    availableTimeSlots: [String],
  });



// Define a Mongoose model for your venues collection
const Venue = mongoose.model('Venue', venueSchema, 'Venues');

// Define a Mongoose model for your venues collection
const activity = mongoose.model('activity', activitySchema, 'activities');

// Define a Mongoose model for your venues collection
const player = mongoose.model('player', playerSchema, 'players');

// Define a route for retrieving all venues from your MongoDB database
app.get('/venues', async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json(venues);
  } catch (err) {
    console.error('Error retrieving venues:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define a route for retrieving all activities from your MongoDB database
app.get('/activities', async (req, res) => {
  try {
    const activitie = await activity.find();
    res.json(activitie);
  } catch (err) {
    console.error('Error retrieving activities:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define a route for retrieving all activities from your MongoDB database
app.get('/players', async (req, res) => {
  try {
    const playe = await player.find();
    //console.log(playe);
    res.json(playe);
  } catch (err) {
    console.error('Error retrieving players:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});





require("./config/passport")(passport);// Routes

const port = process.env.PORT || 10000; // process.env.port is Heroku's port if you choose to deploy the app there
app.listen(port, () => console.log(`Server up and running on port ${port} !`));
