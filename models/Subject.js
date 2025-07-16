const mongoose=require('mongoose');
const subjectSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    title:[{
        type:String,
        required:true
    }],
    priority:{
        type:String,
        enum:['High','Medium','Low'],
        required:true
    },
    difficulty:{
        type:String,
        enum:['Easy','Medium','Hard'],
        required:true
    },
    examDate:{
        type:Date,
        required:true
    },
});

module.exports=mongoose.model('Subject',subjectSchema);