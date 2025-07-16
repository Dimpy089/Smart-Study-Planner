const express = require('express');
const router = express.Router();

const studyController = require('../controllers/StudyControllers');
const verifyToken = require('../middleware/verifyToken');

router.post('/save-session', verifyToken, studyController.saveSession);
router.get('/get-streak', verifyToken, studyController.getStreak);

module.exports = router;