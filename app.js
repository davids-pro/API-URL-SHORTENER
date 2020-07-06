/**
 * pensez à renseigner le fichier .env
 * DB_HOST = adresse de la MongoDB
 * DB_AUTH = nom de la collection MongoDB contenant les users de la DB
 * DB_USER = nom d'utilisateur de la DB
 * BD_PASS = mot de passe de la DB
 */
require('custom-env').env('prod');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const cors = require('cors');

const app = express();

const mongodb = process.env.DB_HOST;

mongoose
  .connect(mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    auth: { authSource: process.env.DB_AUTH },
    user: process.env.DB_USER,
    pass: process.env.DB_PASS
  })
  .then(() => console.log('** MONGODB connexion success **'))
  .catch((err) => {
    console.log('** MONGODB connexion error **');
    console.log('** ' + err + ' **');
  });

app.use(cors());

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname + '/assets'));

const documentRoutes = require('./routes/document');
const userRoutes = require('./routes/user');
const globalRoutes = require('./routes/global');

app.use('/documents/', documentRoutes);
app.use('/users/', userRoutes);
app.use('/', globalRoutes);

module.exports = app;
