const Document = require('../models/document');
const urlMetadata = require('url-metadata');

const qrCode = require('qrcode');
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
  const protocols = /^(http:\/\/|https:\/\/|ftp:\/\/|sftp:\/\/|ssh:\/\/|data:image)/;
  return protocols.test(url) ? url : 'http://' + url;
};

const addPreviewImage = async (url) => {
  if (url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null || url.match(/^data:image/) !== null) {
    return url;
  } else {
    const image = await new Promise((resolve, reject) => {
      urlMetadata(url)
        .then((metadata) => {
          resolve(metadata.image);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return image;
  }
};

const generateAndSaveDocument = (req, res, shortId) => {
  req.body.url = addHttpProtocol(req.body.url);
  const newDocument = new Document({ ...req.body });
  newDocument.shortId = shortId;
  addPreviewImage(newDocument.url)
    .then((url) => {
      newDocument.image = url;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      qrCode.toDataURL(uri + newDocument.shortId, qrCodeOptions, (err, qrCode) => {
        newDocument.qrCode = qrCode;
        newDocument
          .save()
          .then((mongoDocument) => {
            res.status(201).json(mongoDocument);
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      });
    });
};

const createGenericDocument = (req, res) => {
  const shortId = idGenerator();
  checkId(shortId).then((document) => {
    document ? createGenericDocument(req, res) : generateAndSaveDocument(req, res, shortId);
  });
};

const createCustomDocument = (req, res) => {
  generateAndSaveDocument(req, res, req.params.shortId);
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
      mongoDocument ? res.status(200).json(false) : res.status(200).json(true);
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
