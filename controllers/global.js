const Document = require('../models/document');

const redirectToFront = (req, res) => {
  res.redirect('https://shortener.daedal.pro');
};

const updateCount = (document) => {
  document.clickCount = document.clickCount + 1;
  Document.findByIdAndUpdate(document._id, document).catch((err) => {
    console.log(err);
  });
};

const testBase64Url = (url) => {
  return /^data:image/.test(url);
};

const redirectToOriginalUrl = (req, res) => {
  let document;
  Document.findOne({ shortId: req.params.shortId })
    .then((mongoDocument) => {
      document = mongoDocument;
      if (mongoDocument) {
        if (testBase64Url(mongoDocument.url)) {
          const image = Buffer.from(mongoDocument.url.split(';base64,').pop(), 'base64');
          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': image.length
          });
          res.end(image);
        } else {
          res.redirect(mongoDocument.url);
        }
      } else {
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
