const { port } = require('./config');
const app = require('./app');

app.listen(port, () => console.log(`** API is listening on http://localhost:${port} **`));
