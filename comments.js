const db = require('./db');
var ObjectId = require('mongodb').ObjectId;
const validation = require('./validation');

// Get all comments
module.exports.get = async (req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    try {
        let comments = await db.find('Comments', {});
        if (!comments.length) {
            response.Messages.push('No comments were found!');
        } else {
            response.Success = true;
            response.Content = comments;
        }
    } catch (e) {
        console.log(e);
        response.Messages.push('Internal error');
    } finally {
        res.json(response);
    }
}

// Add a new comment
module.exports.post = async (req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    if (req.session.AccountId) {
        try {
            let body = req.body;
            let messages = validation.validateCommentRequest(body);
            if (messages.length > 0) {
                response.Messages = messages;
            } else {
                let newComment = await db.insertOne('Comments', {
                    Rating: body.Rating,
                    Text: body.Text,
                    AccountId: new ObjectId(req.session.AccountId),
                    ProductId: new ObjectId(body.ProductId)
                });
                response.Success = true;
                response.Content = newComment;
            }
        } catch (e) {
            console.log(e);
            response.Messages.push('Internal error');
        }
    } else {
        response.Messages.push('User are not logged in');
    }
    res.json(response); 
}

// Update a comment
module.exports.updateOne = async (req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    let account = req.session.AccountId;
    if (account != 0 && account == req.AccountId) {
        try {
            let body = req.body;
            let req_id = new ObjectId(req.params.id);
            let messages = validation.validateCommentRequest(body);
            if (messages.length > 0) {
                response.Messages = messages;
            } else {
                let updateContent = await db.updateOne('Comments', { _id: req_id }, {
                    Rating: body.Rating,
                    Text: body.Text,
                    AccountId: body.AccountId,
                    ProductId: body.ProductId
                });
                response.Success = true;
                response.Content = updateContent;
            }
        } catch (e) {
            console.log(e);
            response.Messages.push('Internal error');
        }
    }
    res.json(response);
}

// Delete a comment
module.exports.deleteOne = async (req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };
    let account = req.session.AccountId;
    if (account != 0 && account == req.AccountId) {
        try {
            let messages = await validation.valideCommentDuplication(req.params.id);
            if (messages.length) {
                response.Messages = messages;
            } else {
                let req_id = new ObjectId(req.params.id);
                let comment = await db.find('Comments', { _id: req_id });
                await db.deleteOne('Comments', { _id: req_id });
                response.Success = true;
                response.Content = comment;
            }
        } catch (e) {
            console.log(e);
            response.Messages.push('Internal error');
        }
    }
    res.json(response);
}