const Document = require('../models/document');
const urlMetadata = require('url-metadata');

const qrCode = require('qrcode');
const uri = 'https://shortened.daedal.pro/';
const qrCodeOptions = {
  errorCorrectionLevel: 'H',
  type: 'image/png',
  quality: 1,
  scale: 10,
  margin: 1,
  color: {
    dark: '#00F',
    light: '#fff'
  }
};

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

const checkIfImage = (url) => {
  return url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null;
};

const saveDocument = (document, res) => {
  document
    .save()
    .then((mongoDocument) => {
      res.status(201).json(mongoDocument);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const createGenericDocument = (req, res) => {
  req.body.url = addHttpProtocol(req.body.url);
  const shortId = idGenerator();
  checkId(shortId).then((document) => {
    if (document) {
      createGenericDocument(req, res);
    } else {
      const newDocument = new Document({ ...req.body });
      newDocument.shortId = shortId;
      qrCode.toDataURL(uri + newDocument.shortId, qrCodeOptions, (err, qrCode) => {
        newDocument.qrCode = qrCode;
        if (checkIfImage(newDocument.url)) {
          newDocument.isImage = true;
          saveDocument(newDocument, res);
        } else {
          urlMetadata(newDocument.url)
            .then((metadata) => {
              newDocument.metadata = metadata;
            })
            .catch((err) => {
              console.log(err);
            })
            .finally(() => {
              saveDocument(newDocument, res);
            });
        }
      });
    }
  });
};

const createCustomDocument = (req, res) => {
  req.body.url = addHttpProtocol(req.body.url);
  const newDocument = new Document({ ...req.body });
  newDocument.shortId = req.params.shortId;
  qrCode.toDataURL(uri + newDocument.shortId, qrCodeOptions, (err, qrCode) => {
    newDocument.qrCode = qrCode;
    if (checkIfImage(newDocument.url)) {
      newDocument.isImage = true;
      newDocument.metadata = {
        image: newDocument.url
      };
      saveDocument(newDocument, res);
    } else {
      urlMetadata(newDocument.url)
        .then((metadata) => {
          console.log(metadata);
          newDocument.metadata = metadata;
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          saveDocument(newDocument, res);
        });
    }
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
      res.status(200).json();
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
