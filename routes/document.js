const express = require('express');
const documentController = require('../controllers/document');

const router = express.Router();

router.post('/', documentController.createGenericDocument);
router.post('/customId/:shortId', documentController.createCustomDocument);
router.get('/:shortId', documentController.getDocumentByShortId);
router.get('/checkId/:shortId', documentController.verifyIfIdIsAvailable);
router.put('/:id', documentController.updateDocumentById);
router.delete('/:id', documentController.deleteDocumentById);

module.exports = router;
