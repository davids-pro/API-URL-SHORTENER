const express = require('express');
const globalController = require('../controllers/global');

const router = express.Router();

router.get('/', globalController.redirectToFront);
router.get('/:shortId', globalController.redirectToOriginalUrl);

module.exports = router;
