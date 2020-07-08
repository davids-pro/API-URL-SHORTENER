const express = require('express');
const documentController = require('../controllers/document');
const router = express.Router();

// http://localhost:port/documents/
router.post('/', documentController.createGenericDocument);
// http://localhost:port/documents/customId/xxxxxx
router.post('/customId/:shortId', documentController.createCustomDocument);
// http://localhost:port/documents/xxxxxx
router.get('/:shortId', documentController.getDocumentByShortId);
// http://localhost:port/documents/userId/xxxxxx
router.get('/userId/:userId', documentController.getDocumentsByUserId);
// http://localhost:port/documents/checkId/xxxxxx
router.get('/checkId/:shortId', documentController.verifyIfIdIsAvailable);
// http://localhost:port/documents/xxxxxx
router.put('/:id', documentController.updateDocumentById);
// http://localhost:port/documents/xxxxxx
router.delete('/:id', documentController.deleteDocumentById);

module.exports = router;
