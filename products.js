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
        let products = await db.find('Products', {});
        if (!products.length) {
            response.Messages.push('Product not found');
        } else {
            response.Success = true;
            response.Content = products;
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
        let messages = await validation.validateProductDuplication(req.params.id);
        if (messages.length) {
            response.Messages = messages;
        } else {
            let req_id = new ObjectId(req.params.id);
            let product = await db.find('Products', { _id: req_id });
            response.Success = true;
            response.Content = product;
        }
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    } finally {
        res.json(response);
    }
}

module.exports.getCommentsById = async(req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    try {
        let messages = await validation.validateProductDuplication(req.params.id);
        if (messages.length) {
            response.Messages = messages;
        } else {
            let req_id = new ObjectId(req.params.id);
            let products = await db.find('Products', { _id: req_id });
            let comments = await db.find('Comments', { ProductId : products[0]._id });
            if (!comments.length) {
                response.Messages.push('No comments were found!');
            } else {
                // iterate through comments to include useful information
                for (let i = 0; i < comments.length; i++) {
                    // get accounts to include username
                    let accounts = await db.find('Accounts', { _id : comments[i].AccountId });
                    if (accounts.length) {
                        comments[i].Username = accounts[0].Username;
                    }
                    // get comment images
                    let images = await db.find('CommentImages', { CommentId : comments[i]._id });
                    comments[i].Images = images;
                }
                response.Success = true;
                response.Content = comments;
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
        let messages = validation.validateProductRequest(body);
        if (messages.length) {
            response.Messages = messages;
        } else {
            let postContent = await db.insertOne('Products', { 
                Name: body.Name, 
                Description: body.Description, 
                ImagePath: body.ImagePath, 
                Price: body.Price, 
                ShippingCost: body.ShippingCost,
                IsTaxable: body.IsTaxable, 
                Make: body.Make, 
                Model: body.Model, 
                ProductTypeId: body.ProductTypeId 
            });
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
        let req_id = new ObjectId(req.params.id);
        let messages = validation.validateProductRequest(body);
        messages = messages.concat(await validation.validateProductDuplication(req.params.id));
        if (messages.length > 0) {
            response.Messages = messages;
        } else {
            let updateContent = await db.updateOne('Products', { _id: req_id }, { 
                Name: body.Name, 
                Description: body.Description, 
                ImagePath: body.ImagePath, 
                Price: body.Price, 
                ShippingCost: body.ShippingCost, 
                IsTaxable: body.IsTaxable, 
                Make: body.Make, 
                Model: body.Model,
                ProductTypeId: body.ProductTypeId 
            });
            response.Success = true;
            response.Content = updateContent;
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
        let messages = await validation.validateProductDuplication(req.params.id);
        if (messages.length) {
            response.Messages = messages;
        } else {
            let req_id = new ObjectId(req.params.id);
            let product = await db.find('Products', { _id: req_id });
            await db.deleteOne('Products', { _id: req_id });
            response.Success = true;
            response.Content = product;
        }
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    }
    finally {
        res.json(response);
    }
}