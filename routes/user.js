const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();

// http://localhost:port/users/
router.post('/', userController.createUser);
// http://localhost:port/users/auth/
router.post('/auth', userController.getUserByUsernameAndPassword);
// http://localhost:port/users/auth0/
router.post('/auth0', userController.getUserByToken);
// http://localhost:port/users/check/
router.post('/check', userController.verifyIfUsernameIsAvailable);
// http://localhost:port/users/askResetCode/
router.post('/askResetCode', userController.sendResetCode);
// http://localhost:port/users/updatePassword/
router.put('/updatePassword', userController.updateUserPassword);

module.exports = router;
