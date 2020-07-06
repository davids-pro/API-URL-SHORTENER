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
        res.redirect(mongoDocument.url);
      } else {
        redirectToFront(req, res);
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
