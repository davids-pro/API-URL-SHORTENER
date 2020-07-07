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
