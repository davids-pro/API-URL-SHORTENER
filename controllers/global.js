const Document = require('../models/document');

/**
 * redirige vers l'application front
 */
const redirectToFront = (req, res) => {
  res.redirect('https://shortener.daedal.pro');
};

/**
 * incrémente le compteur de click du document par ID mongoDB
 */
const updateCount = (document) => {
  document.clickCount = document.clickCount + 1;
  Document.findByIdAndUpdate(document._id, document).catch((err) => {
    console.log(err);
  });
};

/**
 * teste si l'url est une image de type Base64, retourne un booléen
 */
const testBase64Url = (url) => {
  return /^data:image/.test(url);
};

/**
 * redirige l'utilisateur vers l'url de base
 */
const redirectToOriginalUrl = (req, res) => {
  let document;
  // récupère le document
  Document.findOne({ shortId: req.params.shortId })
    .then((mongoDocument) => {
      document = mongoDocument;
      if (mongoDocument) {
        // si le document existe, teste si c'est l'url de base est image de type Base64
        if (testBase64Url(mongoDocument.url)) {
          // si oui génère l'image en png et l'affiche sur le client
          const image = Buffer.from(mongoDocument.url.split(';base64,').pop(), 'base64');
          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': image.length
          });
          res.end(image);
        } else {
          // si non, redirige l'utilisateur vers l'url de base
          res.redirect(mongoDocument.url);
        }
      } else {
        // si le document n'existe pas, redirige l'utilisateur vers le front
        redirectToFront(req, res);
      }
    })
    .catch((err) => {
      res.status(404).json(err);
    })
    .finally(() => {
      if (document) updateCount(document);
    });
};

exports.redirectToFront = redirectToFront;
exports.redirectToOriginalUrl = redirectToOriginalUrl;
