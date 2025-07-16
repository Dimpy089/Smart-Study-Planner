const mongoose=require('mongoose');

const sessionSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    date: String,
    minutes: Number
});

module.exports=mongoose.model('Session',sessionSchema);