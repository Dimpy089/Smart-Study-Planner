const User=require('../models/Users');
const jwt= require('jsonwebtoken');

const signup=async (req,res)=>{
try{
    const {username,password}=req.body;
    let user=await User.findOne({username});
    if(user){
        return res.status(400).json({message:'User already exists'});
    }
    user=new User({username,password});
    await user.save();
    console.log('✅ Saved user:', user);
    res.status(201).json({message:'User created successfully'});
}catch(error){
    console.error(error); // <-- If anything fails
    res.status(500).json({ message: error.message });
}
};

const login=async (req,res)=>{
    const {username,password}=req.body;
    const user=await User.findOne({username});
    if(!user){
        return res.status(400).json({message:'Invalid username or password'});
    }
    const isMatch=await user.comparePassword(password);
    if(!isMatch){
        return res.status(400).json({message:'Invalid username or password'});
    }
    const token =jwt.sign({id:user._id},process.env.JWT_SECRET,{
        expiresIn:'24h',
    });
    res.json({token});
};

module.exports={signup,login};
