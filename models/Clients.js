const mongoose = require("mongoose")

const clientsSchema = new mongoose.Schema({
    fullname : {
        type : String ,
        required : true , 
        trim : true ,
        maxlength : 150,
    },
    phone : {
        type : Number,
        required : true ,
    },
    city : {
        type : String,
        required : true ,
    },
    address : {
        type : String,
        required : true ,
    },
    
})

module.exports = mongoose.model('Client',clientsSchema)
