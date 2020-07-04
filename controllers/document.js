const Document = require('../models/document');
const urlMetadata = require('url-metadata');
const qrCode = require('qrcode');
const uri = 'https://shortened.daedal.pro/';

const idGenerator = () => {
  let id = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
};

const checkId = (id) => {
  return Document.findOne({ shortId: id });
};

const addHttpProtocol = (url) => {
  const protocols = /^(http:\/\/|https:\/\/|ftp:\/\/|sftp:\/\/|ssh:\/\/)/;
  if (protocols.test(url)) {
    return url;
  } else {
    return 'http://' + url;
  }
};

const createGenericDocument = (req, res) => {
  req.body.url = addHttpProtocol(req.body.url);
  const shortId = idGenerator();
  checkId(shortId).then((document) => {
    if (document) {
      postDocument(req, res);
    } else {
      const newDocument = new Document({ ...req.body });
      newDocument.shortId = shortId;
      qrCode.toDataURL(uri + newDocument.shortId, (err, qrCode) => {
        newDocument.qrCode = qrCode;
      });
      urlMetadata(newDocument.url)
        .then((metadata) => {
          newDocument.metadata = metadata;
        })
        .finally(() => {
          newDocument
            .save()
            .then((mongoDocument) => {
              res.status(201).json(mongoDocument);
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        });
    }
  });
};

const createCustomDocument = (req, res) => {
  req.body.url = addHttpProtocol(req.body.url);
  const newDocument = new Document({ ...req.body });
  newDocument.shortId = req.params.shortId;
  qrCode.toDataURL(newDocument.shortId, (err, qrCode) => {
    newDocument.qrCode = qrCode;
  });
  urlMetadata(newDocument.url)
    .then((metadata) => {
      newDocument.metadata = metadata;
    })
    .finally(() => {
      newDocument
        .save()
        .then((mongoDocument) => {
          res.status(201).json(mongoDocument);
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    });
};

const getDocumentByShortId = (req, res) => {
  checkId(req.params.shortId)
    .then((mongoDocument) => {
      res.status(200).json(mongoDocument);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const getDocumentsByUserId = (req, res) => {
  Document.find({ userId: req.params.userId })
    .then((mongoDocumentArray) => {
      res.status(200).json(mongoDocumentArray);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const updateDocumentById = (req, res) => {
  Document.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true })
    .then((mongoDocument) => {
      res.status(200).json(mongoDocument);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const deleteDocumentById = (req, res) => {
  Document.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(200).send('Document deleted');
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const verifyIfIdIsAvailable = (req, res) => {
  checkId(req.params.shortId)
    .then((mongoDocument) => {
      if (mongoDocument) {
        res.status(200).json(false);
      } else {
        res.status(200).json(true);
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

exports.createGenericDocument = createGenericDocument;
exports.createCustomDocument = createCustomDocument;
exports.getDocumentByShortId = getDocumentByShortId;
exports.getDocumentsByUserId = getDocumentsByUserId;
exports.updateDocumentById = updateDocumentById;
exports.deleteDocumentById = deleteDocumentById;
exports.verifyIfIdIsAvailable = verifyIfIdIsAvailable;
