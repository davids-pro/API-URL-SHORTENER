const express = require('express');
const globalController = require('../controllers/global');
const router = express.Router();

// http://localhost:port/
router.get('/', globalController.redirectToFront);
// http://localhost:port/:string
router.get('/:shortId', globalController.redirectToOriginalUrl);

module.exports = router;
