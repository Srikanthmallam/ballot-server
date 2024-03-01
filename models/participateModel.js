const {Schema,model} = require('mongoose');

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
    },
    number:{
        type:Number,
        required:true,
    }
})

module.exports = model("User",userSchema)