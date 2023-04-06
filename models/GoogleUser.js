const mongoose = require('mongoose')
const googleuserSchema = new mongoose.Schema({    
    fname:{
        type: String,
        required: true
    },
    lname:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        default: ""
    },
    role: {
        type: Number,
        required: true
    },
})
module.exports = mongoose.model('GoogleUser', googleuserSchema)