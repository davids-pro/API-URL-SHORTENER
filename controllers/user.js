const { gmailPass, gmailUser, secretKey } = require('../config');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

/**
 * créé un transporter GMAIL
 */
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: gmailUser,
    pass: gmailPass
  }
});

/**
 * retourne une string cryptée, salt de niveau 10
 */
const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
};

/**
 * envoi un email à l'utilisateur enregistré contenant le code de sécurité nécessaire à la réinitialisation du mot de passe
 */
const securityCodeMailer = (recipient, username, securityCode) => {
  const mail = {
    from: gmailUser,
    to: recipient,
    subject: 'Votre code de sécurité',
    html: `<p>Bonjour ${username},</p><p>Votre code de sécurité afin de modifier votre 
    mot de passe:</p><span style="font-size: 24px">${securityCode}</span>`
  };
  transporter.sendMail(mail, (err, res) => {
    if (err) console.log(err);
  });
};

/**
 * génère un utilisateur et l'envoi en base de données
 */
const createUser = (req, res) => {
  const newUser = new User({ ...req.body });
  // crypte le mot de passe
  hashPassword(req.body.password)
    .then((hashedPassword) => {
      newUser.password = hashedPassword;
      // sauvegarde l'utilisateur en base de données et génère un token
      newUser
        .save()
        .then((mongoUser) => {
          const token = jwt.sign({ id: mongoUser._id }, secretKey, {
            expiresIn: '7d'
          });
          res.status(201).json({
            mongoUser: {
              _id: mongoUser._id,
              username: mongoUser.username
            },
            token
          });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

/**
 * retourne un utilisateur par nom d'utilisateur et mot de passe
 */
const getUserByUsernameAndPassword = (req, res) => {
  User.findOne({ username: req.body.username })
    .then((mongoUser) => {
      const token = jwt.sign({ id: mongoUser._id }, secretKey, {
        expiresIn: '7d'
      });
      // compare le mot de passe utilisateur avec le mot de passe stocké en base de données
      bcrypt.compare(req.body.password, mongoUser.password, (err, result) => {
        // retourne l'utilisateur et un nouveau token si le mot de passe renseigné est le bon
        result
          ? res.status(200).json({
              mongoUser: {
                _id: mongoUser._id,
                username: mongoUser.username
              },
              token
            })
          : res.status(401).json();
      });
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

/**
 * retourne un utilisateur par token JWT
 */
const getUserByToken = (req, res) => {
  jwt.verify(req.body.token, secretKey, (err, decoded) => {
    if (err) {
      res.status(401).json(err);
    } else {
      User.findById(decoded.id)
        .then((mongoUser) => {
          res.status(200).json({
            mongoUser: {
              _id: mongoUser._id,
              username: mongoUser.username
            }
          });
        })
        .catch((err) => {
          res.status(401).json(err);
        });
    }
  });
};

/**
 * vérifie la disponibilité d'un nom d'utilisateur, retourne un booléen
 */
const verifyIfUsernameIsAvailable = (req, res) => {
  User.findOne({ username: req.body.username })
    .then((mongoUser) => {
      mongoUser ? res.status(200).json(false) : res.status(200).json(true);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

/**
 * envoi un code de réinitialisation du mot de passe à l'adresse mail enregistrée
*/
const sendResetCode = (req, res) => {
  let user;
  // génère un code à 6 chiffres (entre 100000 et 999999)
  const code = Math.floor(100000 + Math.random() * 900000);
  // récupère l'utilsateur par nom d'utilisateur
  User.findOne({ username: req.body.username })
    .then((mongoUser) => {
      user = mongoUser;
      res.status(200).json();
    })
    .catch((err) => {
      res.status(400).json(err);
    })
    .finally(() => {
      // si l'utilisateur existe, envoi le mail avec le code de réinitialisation et insère
      // le code de sécurité en base de données
      if (user) {
        securityCodeMailer(user.email, user.username, code);
        user.resetCode = code;
        User.findByIdAndUpdate(user._id, user, { new: true }).catch((err) => {
          console.log(err);
        });
      }
    });
};

/**
 * mets à jour le mot de passe utilisateur
 */
const updateUserPassword = (req, res) => {
  // récupère l'utilsateur par nom d'utilisateur
  User.findOne({ username: req.body.username })
    .then((mongoUser) => {
      // si le code renseigné est le même que celui envoyé par mail
      if (mongoUser.resetCode == req.body.code) {
        // crypte le nouveau mot de passe
        hashPassword(req.body.password)
          .then((hashedPassword) => {
            // et mets à jour l'utilisateur dans la base de données
            User.findOneAndUpdate({ username: req.body.username }, { password: hashedPassword, resetCode: 0 }, { new: true })
              .then(() => {
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
        res.status(401).json();
      }
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.createUser = createUser;
exports.getUserByUsernameAndPassword = getUserByUsernameAndPassword;
exports.getUserByToken = getUserByToken;
exports.verifyIfUsernameIsAvailable = verifyIfUsernameIsAvailable;
exports.sendResetCode = sendResetCode;
exports.updateUserPassword = updateUserPassword;
