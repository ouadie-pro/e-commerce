const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        maxlength : 150,
    },
    description : {
        type : String,
        required : true,
        trim : true,
        maxlength : 2000,
    },
    price : {
        type : Number,
        required : true,
    },
    image : {
        type : String,
        required : true,
    },
    category : {
        type : String,
        required : true,
    },
    isActive : {
        type : Boolean,
        default : true
    },
    clientId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Client'
    },
},{
    timestamps : true,   
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product    