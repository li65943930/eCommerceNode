const db = require('./db');
const http = require('http');
const path = require('path');
const products = require('./products');
const comments = require('./comments');
const commentImage = require('./commentImage');
const login = require('./login');
const accounts = require('./account');
const productItem = require('./productItem');
const shoppingCart = require('./shoppingCart');

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

const expressInstance = require('express');
const express = new expressInstance();
const server = http.createServer(express);

// create application/json parser
var jsonParser = bodyParser.json();

express.use(fileUpload());
express.use(cookieSession({
    name: 'session',
    keys: ['gh#jhf76c%','ibUx5&*vy8']
}));

//Allow access from different ports
express.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE")
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });

db.init();

server.listen(8081, () => {
    var addr = server.address();
    console.log(`listening on ${addr.address}: ${addr.port}`);
});

//get image
express.get('/api/images/:name', function (req, res) {
    var fileName = req.params.name;
    res.sendFile(path.join(__dirname, '/images/', fileName));
  });

express.post('/api/login', jsonParser, async (req, res) => { await login.post(req, res); });
express.delete('/api/login', async (req, res) => { await login.delete(req, res); });

express.get('/api/products', async (req, res) => { await products.get(req, res); });
express.get('/api/products/:id', async (req, res) => { await products.getById(req, res); });
express.get('/api/products/:id/comments', async (req, res) => { await products.getCommentsById(req, res); });
express.post('/api/products', jsonParser, async (req, res) => { await products.post(req, res); });
express.put('/api/products/:id', jsonParser, async (req, res) => { await products.updateOne(req, res); });
express.delete('/api/products/:id', async (req, res) => { await products.deleteOne(req, res); });

express.get('/api/comments', async (req, res) => { await comments.get(req, res); });
express.post('/api/comments', jsonParser, async (req, res) => { await comments.post(req, res); });
express.put('/api/comments/:id', jsonParser, async (req, res) => { await comments.updateOne(req, res); });
express.delete('/api/comments/:id', async (req, res) => { await comments.deleteOne(req, res); });

express.get('/api/accounts/:username', async (req, res) => { await accounts.get(req, res); });
express.get('/api/accounts/:username/products', async (req, res) => { await accounts.getProducts(req, res); });
express.post('/api/accounts/', jsonParser, async (req, res) => { await accounts.post(req, res); });
express.put('/api/accounts/:username', jsonParser, async (req, res) => { await accounts.put(req, res); });
express.put('/api/accounts/:username/password', jsonParser, async (req, res) => { await accounts.changePassword(req, res); });
express.delete('/api/accounts', async (req, res) => { await accounts.delete(req, res); });

express.get('/api/productItems', async (req, res) => { await productItem.get(req, res); });
express.get('/api/productItems/:id', async (req, res) => { await productItem.getById(req, res); });
express.post('/api/productItems', jsonParser, async (req, res) => { await productItem.post(req, res); });
express.put('/api/productItems/:id', jsonParser, async (req, res) => { await productItem.updateOne(req, res); });
express.delete('/api/productItems/:id', async (req, res) => { await productItem.deleteOne(req, res); });

express.get('/api/shoppingCarts', async (req, res) => { await shoppingCart.get(req, res); });
express.get('/api/shoppingCarts/:id', async (req, res) => { await shoppingCart.getById(req, res); });
express.get('/api/shoppingCarts/:id/productItems', async (req, res) => { await shoppingCart.getProductItems(req, res); });
express.put('/api/shoppingCarts/:id', jsonParser, async (req, res) => { await shoppingCart.updateOne(req, res); });

express.post('/api/commentImage/:id', async (req, res) => { await commentImage.post(req, res); });