const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({    
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
})
module.exports = mongoose.model('User', userSchema)