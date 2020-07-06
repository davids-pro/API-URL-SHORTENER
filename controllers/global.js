const Document = require('../models/document');

const redirectToFront = (req, res) => {
  res.redirect('https://shortener.daedal.pro');
};

const redirectToOriginalUrl = (req, res) => {
  let document;
  Document.findOne({ shortId: req.params.shortId })
    .then((mongoDocument) => {
      document = mongoDocument;
      if (mongoDocument) {
        if (mongoDocument.isImage) {
          res.render('image-page', {
            mongoDocument: mongoDocument,
            pugObject: JSON.stringify(mongoDocument)
          });
        } else {
          res.render('std-page', {
            mongoDocument: mongoDocument,
            pugObject: JSON.stringify(mongoDocument)
          });
        }
      } else {
        res.redirect('https://shortener.daedal.pro');
      }
    })
    .catch((err) => {
      res.status(404).json(err);
    })
    .finally(() => {
      if (document) {
        document.clickCount = document.clickCount + 1;
        Document.findByIdAndUpdate(document._id, document).catch((err) => {
          console.log(err);
        });
      }
    });
};

exports.redirectToFront = redirectToFront;
exports.redirectToOriginalUrl = redirectToOriginalUrl;
