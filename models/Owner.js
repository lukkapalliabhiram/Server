const mongoose = require('mongoose')
const ownerSchema = new mongoose.Schema({    
    fname:{
        type: String,
        required: true
    },
    lname:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    emailverificationToken: {
        type: String,
        default: "",
    },
    verified: {
        type: Boolean,
        default: false
    },
    picture: {
        type: String,
        default: ""
    },
    loginType: {
        type: Number,
        default: 0
    },
    salt:{
        type: String,
        required: true
    },
})
module.exports = mongoose.model('Owner', ownerSchema)