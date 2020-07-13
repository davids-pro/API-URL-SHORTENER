const Document = require('../models/document');
const urlMetadata = require('url-metadata');
const uri = 'https://shortened.daedal.pro/';
const qrCode = require('qrcode');

/**
 * paramétrage du QRCode de sortie
 */
const qrCodeOptions = {
  // correction d'erreur sur HIGH
  errorCorrectionLevel: 'H',
  // format PNG
  type: 'image/png',
  // qualité maximale
  quality: 1,
  // grossissement x10
  scale: 10,
  // margin de 1 pixel (10 pixels grossis)
  margin: 0,
  // QRCode bleu sur fond blanc
  color: {
    dark: '#212121',
    light: '#2196f3'
  }
};

/**
 * retourne un slug de type string sur 6 caractères
 * 62^6 = 56 800 235 584 combinaisons uniques possibles
 */
const idGenerator = () => {
  let id = '';
  // 26 majuscules, 26 minuscules et 10 chiffres possibles dans l'slug généré
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
};

/**
 * retourne la méthode Mongoose de recherche de document par slug
 */
const checkId = (id) => {
  return Document.findOne({ shortId: id });
};

/**
 * retourne l'url passée en paramètre avec le protocole http:// en racine si un des protocoles est absent
 * (exemple: www.google.fr => http://www.google.fr)
 */
const addHttpProtocol = (url) => {
  return /^(http:\/\/|https:\/\/|ftp:\/\/|sftp:\/\/|ssh:\/\/|data:image)/.test(url) ? url : 'http://' + url;
};

/**
 * retourne l'adresse d'une image pour preview
 * si l'url pointe sur une image, retourne l'url de l'image
 * si l'url pointe sur une page HTML, retourne l'image présente dans la metadata de la page en question
 */
const addPreviewImage = (url) => {
  return url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null || url.match(/^data:image/) !== null
    ? url
    : new Promise((resolve, reject) => {
        urlMetadata(url)
          .then((metadata) => {
            resolve(metadata.image);
          })
          .catch((err) => {
            reject(err);
          });
      });
};

/**
 * genère un nouveau document mongoose et l'envoi en base de données
 */
const generateAndSaveDocument = (req, res, shortId) => {
  // ajoute le protocole 'http://' en racine de l'url si un protocole est absent
  req.body.url = addHttpProtocol(req.body.url);
  const newDocument = new Document({ ...req.body });
  newDocument.shortId = shortId;
  // ajoute une image preview du site
  addPreviewImage(newDocument.url)
    .then((image) => {
      newDocument.image = image;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      // génère le QRCode
      qrCode.toDataURL(uri + newDocument.shortId, qrCodeOptions, (err, qrCode) => {
        newDocument.qrCode = qrCode;
        // envoi le document en base de données
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

/**
 * génère un document avec un slug aléatoire
 */
const createGenericDocument = (req, res) => {
  // génère un slug
  const shortId = idGenerator();
  // vérifie l'existence de cette idée en base de données
  checkId(shortId).then((document) => {
    // si existant, relance la méthode, sinon créé le document et l'envoi en base de donnée
    document ? createGenericDocument(req, res) : generateAndSaveDocument(req, res, shortId);
  });
};

/**
 * génère un document avec un slug choisis par l'utilisateur
 */
const createCustomDocument = (req, res) => {
  generateAndSaveDocument(req, res, req.params.shortId);
};

/**
 * retourne un document par slug
 */
const getDocumentByShortId = (req, res) => {
  checkId(req.params.shortId)
    .then((mongoDocument) => {
      res.status(200).json(mongoDocument);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

/**
 * retourne un array de documents créés par l'utilisateur
 */
const getDocumentsByUserId = (req, res) => {
  Document.find({ userId: req.params.userId })
    .then((mongoDocumentArray) => {
      res.status(200).json(mongoDocumentArray);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

/**
 * mets à jour un document par ID mongoDB et renvoi le nouveau document
 */
const updateDocumentById = (req, res) => {
  Document.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true })
    .then((mongoDocument) => {
      res.status(200).json(mongoDocument);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

/**
 * supprime un document par ID mongoDB
 */
const deleteDocumentById = (req, res) => {
  Document.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(200).json();
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

/**
 * vérifie l'existence d'un document avec un slug de test et retourne un booléen 
 */
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
