const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const md5 = require("blueimp-md5");
// const crypto  = require("crypto");
const jwt = require("jsonwebtoken");
const URL = require("../../../config/keys").URL;
const client_URL = require("../../../config/keys").client_URL;
const User = require("../../dbSchema/login/User");
const Owner = require("../../dbSchema/login/Owner");
const keys = require("../../../config/keys");// Load input validation
const saltRounds = 10;
// const forgotpassword = require("../../validation/forgotpasswd");
const tokenGenerator = require("../../../config/createToken");
const emailSender = require("../../../config/sendEmails");

async function create_hash(password){
  var salt = 'HnasBzbxH9';
  return md5(password+salt);
}

async function verify_hash(password, tocheck){
  console.log("existing",tocheck)
  console.log("tocheck",password)
  console.log("after")
  var hash = await create_hash(password);
  console.log("existing",tocheck)
  console.log("hash",hash)
  if(hash.valueOf() === tocheck.valueOf()){
    return true;
  }
  else{
    return false;
  }
}

router.post("/googleSignIn", (req, res) => {
  console.log("Data recieved:",req.body);
  const email = req.body.email;
  const picture = req.body.picture;
  // console.log(req.body.picture);
  // console.log("Checking user");
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      Owner.findOne({ email }).then(owner => {
        // Check if user exists
        if (!owner) {
          return res.json({
            success: false,
            message: "Account does not exists, Try Signing Up!"
          })
        }
        const userProfile = {}
        userProfile.name = owner.fname+" "+owner.lname;
        userProfile.email = owner.email;
        userProfile.login = 1;
        userProfile.picture = picture;
        userProfile.role = 1;
        return res.json({
          success: true,
          message: `Welcome  ${userProfile.name}!`,
          profile: userProfile
        });
      });
    }
    else{
      const userProfile = {}
      userProfile.name = user.fname+" "+user.lname;;
      userProfile.email = user.email;
      userProfile.login = 1;
      userProfile.picture = picture;
      userProfile.role = 0;
      return res.json({
        success: true,
        message: `Welcome  ${userProfile.name}!`,
        profile: userProfile
      });
    }
  });
});

// @route POST /users/signup
// @desc Register user
// @access Public
router.post("/signup", (req, res) => {
  // Form validation
  // console.log("Got Data:",req.body);
  const validateRegisterInput = require("../signup");  
  const { errors, isValid } = validateRegisterInput(req.body);
  console.log(errors);
  if (!isValid) {
    console.log(errors);
    return res.json({
      success: false,
      message: errors.message
    });
  }
  var role_app = parseInt(req.body.role);
  if (role_app==0) {
    const newUser = new User({
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      password: req.body.password,
      picture: '',
      loginType: 0,
    });
    User.findOne({ email: req.body.email }).then(async user => {
      if (user) {
        return res.json({
          success: false,
          message: "Account already exists, Try Logging In!"
        });
      } else {
        const hash = await create_hash(req.body.password);
        newUser.password = hash;
        newUser.emailverificationToken = req.body.password;
        console.log("User Details to Save:", newUser.emailverificationToken);
        newUser
          .save()
          .then(() => {
            res.json({
              success: true,
              message: "Successfully Registered!"
            });
          })
          .catch(err => {
            res.json({
              success: false,
              message: err
            });
          });
      }
    });
  }
  else if(role_app==1){
    const newUser = new Owner({
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      password: req.body.password,
      picture: '',
      loginType: 0,
    });
    Owner.findOne({ email: req.body.email }).then(async owner => {
      if (owner) {
        return res.json({
          success: false,
          message: "Account already exists, Try Logging In!"
        });
      } else {
        // const salt = crypto.randomBytes(16).toString('hex');  
        const hash = await create_hash(req.body.password);
        newUser.password = hash;
        newUser.emailverificationToken = req.body.password;
        // newUser.emailverificationToken = salt;
        newUser
          .save()
          .then(() => {
            res.json({
              success: true,
              message: "Successfully Registered!"
            });
          })
          .catch(err => {
            res.json({
              success: false,
              message: err
            });
          });
      }
    });
  }
});


// @route POST users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation
  // console.log(req.body);
  const validateLoginInput = require("../login");
  const { errors, isValid } = validateLoginInput(req.body);// Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  
  console.log(req.body.email);
  console.log(req.body.password);
  const email = req.body.email;
  const password = req.body.password;// Find user by email
  const userProfile = {};        
  User.findOne({ email }).then(async user => {
    // Check if user exists
    console.log("User exists!")
    if (!user) {
      Owner.findOne({ email }).then(async owner => {
        // Check if user exists
        if (!owner) {
          return res.json({
            success: false,
            message: "Account does not exists, Try Signing Up!"
          })
        }// Check password
        // const hash = crypto.createHash('sha256').update(password).digest('hex');
        var match = await verify_hash(req.body.password,owner.password);
        console.log("match:",match);
        console.log("password:",owner.password, typeof owner.password);
        if (match) {
        // if (password === owner.emailverificationToken) {
          userProfile.name = owner.fname+" "+owner.lname;
          userProfile.email = owner.email;
          userProfile.login = 1;
          userProfile.picture = owner.picture;
          userProfile.role = 1;
          console.log(req.session);
          return res.json({
            success: true,
            message: `Welcome  ${userProfile.name}!`,
            profile: userProfile
          });
        } else {
          return res.json({
            success: false,
            message: "Password incorrect!"
          });
        }
      });
    }// Check password
    else{
      // const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      // const hash = await create_hash(password);
      var match = await verify_hash(req.body.password,user.password);
      // console.log("match:",match);
      // console.log("password:",user.password, typeof user.password);
      if (match) {
      // if (password === user.emailverificationToken) {
        // User matched          
        userProfile.name = user.fname+" "+user.lname;;
        userProfile.email = user.email;
        userProfile.login = 1;
        userProfile.picture = user.picture;
        userProfile.role = 0;
        return res.json({
          success: true,
          message: `Welcome  ${userProfile.name}!`,
          profile: userProfile
        });
      } else {
        return res.json({
          success: false,
          message: "Password incorrect!"
        });
      }
    }
  });
});

// @route POST /users/forgotpasswd
// @desc Forgot
// @access Public
router.post("/forgotpassword", (req, res) => {
  // Form validation
  const email = req.body.email;
  // console.log("Email:"+email);
  User.findOne({ email: email }).then(async user => {
    if(user){
      const token = tokenGenerator({email:user.email});
      const link = URL + "/users/verifyToken?token="+token;
      const sendMail = await emailSender(user.email, "Forgot Password", ` To reset password, Please click on this <a href="${link}">link`);
      // console.log(link);
      // console.log(sendMail);
      if(sendMail){
        res.json({ success: false, message: "Failed to send the email!" })
      }
      else{
        res.json({ success: true, message: `Link already sent to ${user.email} , follow the link to reset password!`}) 
      }
    }
    else{
      Owner.findOne({ email: email }).then(async owner => {
        if(owner){
          const token = tokenGenerator({email:owner.email})
          const link = URL + "/users/verifyToken?token="+token;
          const sendMail = await emailSender(owner.email, "Forgot Password", ` To reset password, Please click on this <a href="${link}">link`);
          // console.log(link);
          // console.log(sendMail);
          if(sendMail){
            res.json({ success: false, message: "Failed to send the email!" })
          }
          else{
            res.json({ success: true, message: `Link already sent to ${user.email} , follow the link to reset password!`}) 
          }
        }
        else{
          return res.json({ success: false, message: "User not found!"});
        }
      });
    }
  });     
});// Check password

router.get("/verifyToken", (req, res) => {
  // Form validation
  // console.log(req.query);
  const {token} = req.query;
  if(!token){
    res.redirect(client_URL+'/Message?success=0&message=Invalid Token!&url=/ForgotPassword');
  }
  let decodedToken;
  try{
    decodedToken = jwt.verify(token, 'secret');
  }catch(err){
    res.redirect(client_URL+'/Message?success=0&message=Invalid Token!&url=/ForgotPassword');
  }
  console.log(decodedToken)
  res.redirect(client_URL+'/Message?success=1&email='+decodedToken.email+'&url=/ResetPassword');
});

router.post("/resetPassword", (req, res) => {
  // Form validation
  const validateResetPasswordInput = require("../resetPassword");
  // console.log(req.body);
  const { errors, isValid } = validateResetPasswordInput(req.body);
  if (!isValid) {
    // return res.json(errors);
    console.log(errors);
    return res.json({success: false,message: errors.message});
  }
  
  User.findOne({ email: req.body.email }).then(async user => {
    if(user){
      // const salt = crypto.randomBytes(16).toString('hex');  
      const hash = await create_hash(req.body.password);
      console.log("hash:",hash, typeof hash);
      User.updateOne({ email: req.body.email }, { $set: { password: hash, emailverificationToken: req.body.password} }, (err, result) => {
        // User.updateOne({ email: req.body.email }, { $set: { password: hash, emailverificationToken:  salt} }, (err, result) => {
        if (err) {
          res.json({success: false,message: err})
        }
        res.json({success: true, message: 'Password successfully reset!'})
      });
    }
    else{
      Owner.findOne({ email: req.body.email }).then(async owner => {
        if(owner){
          // const salt = crypto.randomBytes(16).toString('hex');  
          const hash = await create_hash(req.body.password);
          Owner.updateOne({ email: req.body.email }, { $set: { password: hash, emailverificationToken: req.body.password} }, (err, result) => {
            // Owner.updateOne({ email: req.body.email }, { $set: { password: hash,  emailverificationToken:  salt } }, (err, result) => {
            if (err) {
              res.json({success: false,message: err})
            }
            res.json({success: true, message: 'Password successfully reset!'})
          });
        }
        else{
          res.json({success: false, message: 'Unable to find owner!'});
        }
      });
    }
  });
});

module.exports = router;