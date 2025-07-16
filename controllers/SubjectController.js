const Subject=require('../models/Subject');

const addSubject = async(req,res)=>{
    try{
    const{subject,title,priority,difficulty,examDate}=req.body;
    const newSubject=new Subject({
        userId:req.user.id,
        subject,
        title,
        priority,
        difficulty,
        examDate
    });
    await newSubject.save();
    res.status(201).json({message: 'Subject added successfully'});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:'Server error while adding subject'});
    }
};

module.exports={
    addSubject
};