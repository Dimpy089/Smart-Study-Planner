const express=require('express');
const router=express.Router();
const {addSubject}=require('../controllers/SubjectController');
const verifyToken=require('../middleware/verifyToken');

router.post('/add',verifyToken,addSubject);
module.exports=router;
