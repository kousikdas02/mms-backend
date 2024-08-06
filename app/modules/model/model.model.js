const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    manufacturer:{
        type : mongoose.SchemaTypes.ObjectId,
        ref : "manufacturer",
        require:true
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


module.exports = mongoose.model("model", modelSchema);