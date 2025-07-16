const Streak=require('../models/Streak');
const Session=require('../models/Session');
const { get } = require('express/lib/response');

function getYesterday(dateStr){
    const date=new Date(dateStr);
    date.setDate(date.getDate()-1);
    return date.toISOString().split('T')[0];
}

exports.saveSession=async (req,res)=>{
    const {minutes}= req.body;
    const userId = req.user.id;
    const today=new Date().toISOString().split('T')[0];

    await Session.updateOne(
        {userId,date:today},
        {$set:{minutes}},
        {upsert:true}
    );

    let streak=await Streak.findOne({userId});
    if(!streak){
        streak=new Streak({userId,count:0,lastDate: NULL});
    }
    if(minutes>=60){
        if(streak.lastDate && streak.lastDate===getYesterday(today)){
            streak.count+=1;
        }
        else if (streak.lastDate !== today) {
            streak.count = 1; // Restart
        }
    }
    streak.lastDate=today;
    await streak.save();
    res.json({message:'Session saved',success:true});
}

exports.getStreak = async (req, res) => {
    const userId = req.user.id; // Get from query param or JWT

    let streak = await Streak.findOne({ userId });
    if (!streak) {
        return res.json({ count: 0 });
    }
    return res.json({ count: streak.count });
};

