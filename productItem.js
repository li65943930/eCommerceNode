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
        let productItems = await db.find("ProductItems", {});
        if(!productItems.length) {
            response.Messages.push('Product Items not found');
        } else {
            response.Success = true;
            response.Content = productItems;
        }
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
        let messages = await validation.validateProductItemRequestWithId(req.params.id);
        if (messages.length) {
            response.Messages = messages;
        } else {
            let req_id = new ObjectId(req.params.id);
            let productItem = await db.find('ProductItems', { _id: req_id });
            response.Success = true;
            response.Content = productItem[0];
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
        let messages = await validation.validateProductItemRequest(body);
        messages = messages.concat(await validation.validateProductItemDuplicate(req));
        if (messages.length) {
            response.Messages = messages;
        } else {
            // Update ShoppingCart
            if(req.session.ShoppingCartId == null) {
                let postContent = await db.insertOne('ShoppingCarts', {
                    Purchased: false,
                    AccountId: req.session.AccountId,
                    ShippingAddress: ""
                });
                req.session.ShoppingCartId = postContent.ops[0]._id;
            }

            //Get ProductItem data
            let productId = new ObjectId(body.ProductId);
            let products = await db.find('Products', { _id: productId });
            let product = products[0];

            let price = parseFloat(product.Price);
            let shippinPrice = parseFloat(product.ShippingCost);

            //Insert ProductItem
            postContent = await db.insertOne('ProductItems', {
                Price: price.toFixed(2),
                ShippingPrice: shippinPrice.toFixed(2),
                Description: product.Description,
                IsTaxable: product.IsTaxable, 
                Make: product.Make, 
                Model: product.Model,
                ProductId: product._id,
                ShoppingCartId: new ObjectId(req.session.ShoppingCartId),
                Quantity: req.body.Quantity
            })
            
            response.Success = true;
            response.Content = postContent;
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
        let messages = await validation.validateProductItemRequestWithId(req.params.id);
        //Validate quantity
        if (body.Quantity < 1 || body.Quantity > 100) {
            messages.push("Quantity: invalid (must be an integer between 1 and 100)");
        }
        if (messages.length) {
            response.Messages = messages;
        } else {
            // Get ProductItem
            let req_id = new ObjectId(req.params.id);
            let productItems = await db.find('ProductItems', { _id: req_id });
            let productItem = productItems[0];

            // Update ProductItem
            productItem.Quantity = body.Quantity;
            let responseContent = await db.updateOne('ProductItems', {_id: req_id}, productItem )
            
            response.Success = true;
            response.Content = responseContent;
        }
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    } finally {
        res.json(response);
    }
}

module.exports.deleteOne = async(req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    try {
        let messages = await validation.validateProductItemRequestWithId(req.params.id);
        if (messages.length) {
            response.Messages = messages;
        } else {
            // Find ProductItem
            let req_id = new ObjectId(req.params.id);
            let productItems = await db.find('ProductItems', { _id: req_id });
            let productItem = productItems[0];

            // Remove ProductItem
            await db.deleteOne('ProductItems', productItem);

            response.Success = true;
            response.Content = productItem;
        }
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    }
    finally {
        res.json(response);
    }
}