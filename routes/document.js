const express = require('express');
const documentController = require('../controllers/document');
const router = express.Router();

// http://localhost:port/documents/
router.post('/', documentController.createGenericDocument);
// http://localhost:port/documents/customId/:string
router.post('/customId/:shortId', documentController.createCustomDocument);
// http://localhost:port/documents/:string
router.get('/:shortId', documentController.getDocumentByShortId);
// http://localhost:port/documents/userId/:string
router.get('/userId/:userId', documentController.getDocumentsByUserId);
// http://localhost:port/documents/checkId/:string
router.get('/checkId/:shortId', documentController.verifyIfIdIsAvailable);
// http://localhost:port/documents/:string
router.put('/:id', documentController.updateDocumentById);
// http://localhost:port/documents/:string
router.delete('/:id', documentController.deleteDocumentById);

module.exports = router;
