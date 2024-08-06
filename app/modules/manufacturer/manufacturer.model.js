const mongoose = require("mongoose");

const manufacturerSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    images : {
        type : [String],
        require : true,
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


module.exports = mongoose.model("manufacturer", manufacturerSchema);