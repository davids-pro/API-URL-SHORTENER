# URL Shortener

## Fonctionnalités

- **Génération d'id aléatoires et uniques**. Génère une adresse de type *https://mondomaine/id* avec un id unique sur 6 caractères. Un système de vérification s'assure que l'id généré est unique et plus de 56 milliards de combinaisons sont possibles.
- **Possibilité de personnaliser l'id**. Génère une adresse de type *https://mondomaine/perso* avec vérification de sa disponibilité
- **Metadatas**. Chaque lien généré contient les metadatas de sa cible, facilitant ainsi leurs intégrations sur les réseaux sociaux
- **Monitoring des clicks**. Chaque utilisation d'un lien incrémente son compteur de click, un utilisateur enregistré peut donc monitorer le nombre de clicks sur les liens qu'il a généré.
- **Rapidité, sécurité**. Grâce à NodeJS, Express et MongoDB, l'API est extrêmement rapide. Les mots de passe utilisateurs sont cryptés, les noms d'utilisateurs uniques, et associés à une adresse email nécessaire à l'envoi de codes de sécurité en cas d'oublis des mots de passe, ainsi qu'à la puissance et la sécurité du système JWT.

## Liste des dépendances

- **bcrypt**. https://www.npmjs.com/package/bcrypt. Hashage des mots de passe.
- **body-parser**. https://www.npmjs.com/package/body-parser. Middleware de body parsing pour NodeJS
- **cors**. https://www.npmjs.com/package/cors. Middleware de 'cross-origin resource sharing' pour Express
- **dotenv**. https://www.npmjs.com/package/dotenv. Lecture de variables d'environnement
- **express**. https://www.npmjs.com/package/express. Framework Web pour NodeJS
- **jsonwebtoken**. https://www.npmjs.com/package/jsonwebtoken. JSON Web Token
- **mongoose**. https://www.npmjs.com/package/mongoose. Modeleur d'objets MongoDB
- **nodemailer**. https://www.npmjs.com/package/nodemailer. Envoi d'emails depuis NodeJS
- **nodemon**. https://www.npmjs.com/package/nodemon. Utilitaire de développement NodeJS
- **qrcode**. https://www.npmjs.com/package/qrcode. Générateur de QRCode
- **url-metadata**. https://www.npmjs.com/package/url-metadata. Scrappeur de metadata


## Installation

```bash
npm install
```

Un fichier *.env* à la racine de l'application est nécessaire à son fonctionnement. Voici la liste des champs à renseigner :

```bash
NODE_ENV=development || production // environnement
PORT=<PORT> // port à utiliser
DB_HOST=<DBHOST> // adresse de la base de données MongoDB
DB_AUTH=<DB_AUTH> // nom de la collection contentant les informations utilisateurs
DB_USER=<DB_USER> // utilisateur MongoDB
DB_PASS=<DB_PASS> // mot de passe MongoDB
GMAIL_USER=<GMAIL_USER> // utilisateur Gmail
GMAIL_PASS=<GMAIL_PASS> // mot de passe Gmail ou mot de passe applicatif Google
SECRET_KEY=<SECRET_KEY> // clé de sécurité JWT
```

## License

License ISC - Internet Systems Consortium License

Créé par David Somaré - https://github.com/davids-pro