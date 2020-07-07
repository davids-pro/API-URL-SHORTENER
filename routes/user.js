const express = require('express');
const userController = require('../controllers/user');

const router = express.Router();

router.post('/', userController.createUser);
router.post('/auth', userController.getUserByUsername);
router.post('/check', userController.verifyIfUsernameIsAvailable);
router.post('/askResetCode', userController.sendResetCode);
router.put('/updatePassword', userController.updateUserPassword);

module.exports = router;
