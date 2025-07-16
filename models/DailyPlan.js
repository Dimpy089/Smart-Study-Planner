const mongoose=require('mongoose');

const taskSchema=new mongoose.Schema({
    subject:String,
    title:String,
    duration:Number,
    status:{
        type:String,
        default:'Pending'
    }
});

const dailyPlanSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    date:String,
    tasks:[taskSchema]
});

module.exports=mongoose.model('DailyPlan',dailyPlanSchema);