const express=require('express');
const router=express.Router();
const {generatePlan}= require('../controllers/planControllers');
const verifyToken = require('../middleware/verifyToken');
const {updateTaskStatus}=require('../controllers/planControllers');
const {getAllPlans}=require('../controllers/planControllers');
const {getPlanByDate}=require('../controllers/planControllers');

router.post('/generate', verifyToken, generatePlan);
router.post('/update-status',verifyToken,updateTaskStatus);
router.get('/all',verifyToken,getAllPlans);
router.get('/:date',verifyToken,getPlanByDate);
module.exports=router;