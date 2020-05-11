const db = require('./db');
const validation = require('./validation');
const bcrypt = require('bcrypt');
var ObjectId = require('mongodb').ObjectId;

module.exports.get = async(req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    try {
        let messages = await validation.validateAccountLogIn(req);
        if (messages.length) {
            response.Messages = messages;
        } else {
            let accounts = await db.find('Accounts', { Username: req.params.username });
            if (accounts.length) {
                let account = accounts[0];
                response.Content = {
                    Email: account.Email, 
                    Username: account.Username, 
                    ShippingAddress: account.ShippingAddress
                };
                response.Success = true;
            }
        }
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    } finally {
        res.json(response);
    }
}

module.exports.getProducts = async(req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    try {
        let messages = await validation.validateAccountLogIn(req);
        if (messages.length) {
            response.Messages = messages;
        } else {
            let accounts = await db.find('Accounts', { Username: req.params.username });
            if (accounts.length) {
                let account = accounts[0];
                let products = [];
                let shoppingCarts = await db.find('ShoppingCarts', { AccountId: account._id.toString(), Purchased: "true" });
                for (let i = 0; i < shoppingCarts.length; i++) {
                    let productItems = await db.find('ProductItems', { ShoppingCartId: shoppingCarts[i]._id });
                    products = products.concat(productItems);
                } 
                response.Success = true;
                response.Content = products;
            }
        }
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    } finally {
        res.json(response);
    }
}

module.exports.post = async(req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    try {
        let body = req.body;
        let messages = validation.validateAccountRequest(body);
        messages = messages.concat(await validation.validateAccountDuplication(body));
        if (messages.length) {
            response.Messages = messages;
        } else { 
            let hashedPassword = await bcrypt.hash(body.Password, 10);
            await db.insertOne('Accounts', { 
                Email: body.Email, 
                Password: hashedPassword, 
                Username: body.Username, 
                ShippingAddress: body.ShippingAddress
            });
            response.Success = true;
        }
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    } finally {
        res.json(response);
    }
}

module.exports.put = async(req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    try {
        let messages = await validation.validateAccountLogIn(req);
        if (messages.length) {
            response.Messages = messages;
            return;
        }
        let body = req.body;
        messages = validation.validateUpdateAccountRequest(body);
        if (messages.length) {
            response.Messages = messages;
        } else {
            await db.updateOne('Accounts', { Username: req.params.username }, { 
                ShippingAddress: body.ShippingAddress, 
            });
            response.Success = true;
        }
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    } finally {
        res.json(response);
    }
}

module.exports.changePassword = async(req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    try {
        let messages = await validation.validateAccountLogIn(req);
        if (messages.length) {
            response.Messages = messages;
            return;
        }

        let body = req.body;
        messages = validation.validateChangePasswordRequest(body);
        if (messages.length) {
            response.Messages = messages;
        } else {
            let hashedPassword = await bcrypt.hash(body.Password, 10);
            await db.updateOne('Accounts', { Username: req.params.username }, { 
                Password: hashedPassword, 
            });
            response.Success = true;
        }
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    } finally {
        res.json(response);
    }
}

module.exports.delete = async(req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    try {
        if (!req.session.AccountId.length) {
            response.Messages.push("You are not logged in");
        } else {
            let req_id = new ObjectId(req.session.AccountId);
            let account = await db.find('Accounts', { _id: req_id });
            await db.deleteOne('Accounts', account[0]);
            req.session.AccountId = '';
            response.Success = true;
        }
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    } finally {
        res.json(response);
    }
}


