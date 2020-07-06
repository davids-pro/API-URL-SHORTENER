const User = require('../models/user');
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
  return hashedPassword;
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

const updateUserById = (req, res) => {
  User.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true })
    .then((mongoUser) => {
      res.status(200).json(mongoUser);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const deleteUserById = (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(200).json();
    })
    .catch((err) => {
      res.status(400).json(err);
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

exports.createUser = createUser;
exports.getUserByUsername = getUserByUsername;
exports.updateUserById = updateUserById;
exports.deleteUserById = deleteUserById;
exports.verifyIfUsernameIsAvailable = verifyIfUsernameIsAvailable;
