const express = require('express');
const userController = require('../controllers/user');

const router = express.Router();

router.post('/', userController.createUser);
router.post('/auth', userController.getUserByUsername);
router.post('/checkUser', userController.verifyIfUsernameIsAvailable);
router.put('/:id', userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
