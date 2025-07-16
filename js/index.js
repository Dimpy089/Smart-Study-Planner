const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const subjectRouters=require('../routes/subjectRouters');
const planRoutes = require('../routes/plan');
const authRoutes=require('../routes/authRoutes');//adding after authentification
const studyRoutes = require('../routes/StudyRoutes');
require('dotenv').config();

const app=express();
app.use(cors());
app.use(express.json());

app.use('/api/subjects',subjectRouters);
app.use('/api/auth',authRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/study', studyRoutes);

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('Connect to MongoDB successfully');
    app.listen(5000,()=>{
        console.log('Server is running on port 5000');
    });
    })
    .catch((error)=>{
        console.error('Error in starting server',error);
    })

