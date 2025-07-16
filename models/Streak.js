const mongoose=require('mongoose');
const streakSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    count:Number,
    lastDate:String
});

module.exports=mongoose.model('Streak',streakSchema);