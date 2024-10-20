const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    images : {
        type : [String],
        require : true,
    },
    price: {
        type: Number,
        require: true,
    },
    specialConsideration:{
        type:[],
    },
    status:{
        type:String,
        required:true,
        enum: ['active', 'inactive']
    },
    createdAt: {
        type: Date,
        default: () => {
            return Date.now()
        },
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: () => {
            return Date.now()
        }
    }
});


module.exports = mongoose.model("service", serviceSchema);