const { gmailPass, gmailUser } = require('../config');

const User = require('../models/user');

const bcrypt = require('bcrypt');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: gmailUser,
    pass: gmailPass
  }
});

const hashPassword = (password) => {
  const hashedPassword = new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
  return hashedPassword;
};

const securityCodeMailer = (recipient, username, securityCode) => {
  const mail = {
    from: gmailUser,
    to: recipient,
    subject: 'Votre code de sécurité',
    html: `<p>Bonjour ${username},</p><p>Voici code de sécurité afin de modifier votre mot de passe:<br><span style="font-size: 24px">${securityCode}</span></p>`
  };
  transporter.sendMail(mail, (err, res) => {
    if (err) console.log(err);
  });
};

const createUser = (req, res) => {
  const newUser = new User({ ...req.body });
  hashPassword(req.body.password)
    .then((hashedPassword) => {
      newUser.password = hashedPassword;
      newUser
        .save()
        .then((mongoUser) => {
          res.status(201).json({ mongoUser });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

const getUserByUsername = (req, res) => {
  User.findOne({ username: req.body.username })
    .then((mongoUser) => {
      bcrypt.compare(req.body.password, mongoUser.password, (err, result) => {
        result ? res.status(200).json(mongoUser) : res.status(401).json();
      });
    })
    .catch((err) => {
      res.status(401).json();
    });
};

const verifyIfUsernameIsAvailable = (req, res) => {
  User.findOne({ username: req.body.username })
    .then((mongoUser) => {
      mongoUser ? res.status(200).json(false) : res.status(200).json(true);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const sendResetCode = (req, res) => {
  let user;
  const code = Math.floor(100000 + Math.random() * 900000);
  User.findOne({ username: req.body.username })
    .then((mongoUser) => {
      user = mongoUser;
      res.status(200).json();
    })
    .catch((err) => {
      res.status(400).json(err);
    })
    .finally(() => {
      if (user) {
        securityCodeMailer(user.email, user.username, code);
        user.resetCode = code;
        User.findByIdAndUpdate(user._id, user, { new: true }).catch((err) => {
          console.log(err);
        });
      }
    });
};

const updateUserPassword = (req, res) => {
  User.findOne({ username: req.body.username })
    .then((mongoUser) => {
      if (mongoUser.resetCode == req.body.code) {
        hashPassword(req.body.password)
          .then((hashedPassword) => {
            User.findOneAndUpdate({ username: req.body.username }, { password: hashedPassword, resetCode: 0 }, { new: true })
              .then((mongoUser) => {
                console.log(mongoUser);
                res.status(200).json();
              })
              .catch((err) => {
                res.status(400).json(err);
              });
          })
          .catch((err) => {
            res.status(500).json(err);
          });
      } else {
        res.status(500).json(err);
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

exports.createUser = createUser;
exports.getUserByUsername = getUserByUsername;
exports.verifyIfUsernameIsAvailable = verifyIfUsernameIsAvailable;
exports.sendResetCode = sendResetCode;
exports.updateUserPassword = updateUserPassword;
