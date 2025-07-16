const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const subjectRouters=require('../routes/subjectRouters');
const planRoutes = require('../routes/plan');
const authRoutes=require('../routes/authRoutes');//adding after authentification
const studyRoutes = require('../routes/StudyRoutes');
const path = require('path');
require('dotenv').config();

const app=express();
app.use(cors());
app.use(express.json());

app.use('/api/subjects',subjectRouters);
app.use('/api/auth',authRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/study', studyRoutes);

app.use(express.static(path.join(__dirname, '../pages')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../pages', 'index.html'));
});

app.get('/', (req, res) => {
  res.send('Smart Study Planner backend is running!');
});

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log('Connect to MongoDB successfully');
    const port = process.env.PORT || 8080;
    if (!port) {
        console.error('Error: PORT environment variable not set.');
        process.exit(1);
    }
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server is running on port ${port}`);
    });
    })
    .catch((error)=>{
        console.error('Error in starting server',error);
    })

