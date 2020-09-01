/**
 * il est nécessaire de placer un fichier .env à la racine de l'application avec la configuration suivante :
 * NODE_ENV= development ou  production
 * PORT= numéro de port d'écoute
 * DB_HOST= adresse de la mongoDB
 * DB_AUTH= nom de la collection mongoDB contenant les profils utilisateurs (en principe admin)
 * DB_USER= nom d'utilisateur mongoDB
 * DB_PASS= mot de passe mongoDB
 * GMAIL_USER= adresse email GMAIL
 * GMAIL_PASS= mot de passe du compte GMAIL ou mot de passe Google d'application https://support.google.com/accounts/answer/185833?hl=fr
 */
const { dbHost, dbAuth, dbUser, dbPass } = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const mongodb = dbHost;

mongoose
  .connect(mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    auth: { authSource: dbAuth },
    user: dbUser,
    pass: dbPass
  })
  .then(() => console.log('** MONGODB connexion success **'))
  .catch((err) => {
    console.log('** MONGODB connexion error **');
    console.log('** ' + err + ' **');
  });

app.use(cors());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

const documentRoutes = require('./routes/document');
const userRoutes = require('./routes/user');
const globalRoutes = require('./routes/global');

app.use('/documents/', documentRoutes);
app.use('/users/', userRoutes);
app.use('/', globalRoutes);

module.exports = app;
