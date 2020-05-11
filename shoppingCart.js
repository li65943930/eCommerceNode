const db = require('./db');
const validation = require('./validation');
var ObjectId = require('mongodb').ObjectId;

module.exports.get = async(req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    try {
        let shoppingCart = await db.find('ShoppingCarts', { _id: shoppingCartId })[0];
        response.Success = true;
        response.Content = shoppingCart;
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    } finally {
        res.json(response);
    }
}

module.exports.getById = async(req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    try {
        let messages = await validation.validateShoppingCartRequestWithId(req.params.id);
        if (messages.length) {
            response.Messages = messages;
        } else {
            let req_id = new ObjectId(req.params.id);
            let shoppingCarts = await db.find('ShoppingCarts', { _id: req_id });
            let shoppingCart = shoppingCarts[0];
            response.Success = true;
            response.Content = shoppingCart;
        }
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    } finally {
        res.json(response);
    }
}

module.exports.getProductItems = async(req, res) => {
    let response = {
        Success: false,
        Content: [],
        Messages: []
    };
    try {
        let messages = await validation.validateShoppingCartRequestWithId(req.params.id);
        if (messages.length) {
            response.Messages = messages;
        } else {
            let req_id = new ObjectId(req.params.id);
            let shoppingCarts = await db.find('ShoppingCarts', { _id: req_id });
            let shoppingCart = shoppingCarts[0];
            let productItems = await db.find('ProductItems', { ShoppingCartId: shoppingCart._id });

            var subtotal = 0, shipping = 0, taxes = 0;
            productItems.forEach(product => {
                subtotal += parseFloat(product.Price) * product.Quantity;
                shipping += parseFloat(product.ShippingPrice) * product.Quantity;
            });

            taxes = subtotal * 0.13;
            var total = subtotal * 1.13 + shipping;

            // Adjusting numbers
            subtotal = subtotal.toFixed(2);
            total = total.toFixed(2);
            shipping = shipping.toFixed(2);
            taxes = taxes.toFixed(2);

            response.Success = true;
            var content = {
                productItems, subtotal, total, shipping, taxes
            }
            response.Content = content;
        }
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    } finally {
        res.json(response);
    }
}

module.exports.updateOne = async(req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    try {
        let body = req.body;
        let messages = await validation.validateShoppingCartRequestWithId(req.params.id);
        messages = messages.concat(await validation.validateShoppingCartRequest(body))
        if (messages.length) {
            response.Messages = messages;
        } else {
            // Get Shopping Cart
            let req_id = new ObjectId(req.params.id);
            let shoppingCarts = await db.find('ShoppingCarts', { _id: req_id });
            let shoppingCart = shoppingCarts[0];

            // Update Shopping Cart
            if(req.session.AccountId != null && req.session.AccountId.length) {
                let req_id = new ObjectId(req.session.AccountId);
                let accounts = await db.find('Accounts', { _id: req_id });
                let account = accounts[0];
                shoppingCart.ShippingAddress = account.ShippingAddress;
            }
            else {
                shoppingCart.ShippingAddress = body.ShippingAddress;
            }
            shoppingCart.AccountId = req.session.AccountId;
            shoppingCart.Purchased = body.Purchased;
            let responseContent = await db.updateOne('ShoppingCarts', { _id: req_id }, shoppingCart);

            response.Success = true;
            response.Content = responseContent;
            req.session.ShoppingCartId = null;
        }
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    } finally {
        res.json(response);
    }
}