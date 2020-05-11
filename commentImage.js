const db = require('./db');
var ObjectId = require('mongodb').ObjectId;
const validation = require('./validation');
const shortid = require('shortid');

// Adding an image to a comment
module.exports.post = async (req, res) => {
    let response = {
        Success: false,
        Content: [],
        Messages: []
    };
    let account = req.session.AccountId;   
    if (account != 0 && req.files) {
        let images = [];
        if (Array.isArray(req.files.image)) {
            images = req.files.image;
        } else{
            images.push(req.files.image);
        }
        for (let i = 0; i < images.length; i++) {
            try {
                let req_id = new ObjectId(req.params.id);
                let messages = await validation.valideCommentDuplication(req.params.id);
                messages = messages.concat(await validation.validateFile(req.files));
                if (messages.length > 0) {
                    response.Messages = messages;
                } else {
                    let fileName = `${shortid.generate()}.jpg`;
                    let imagepath = `images/${fileName}`;
                    await images[i].mv(imagepath); 
                    let newImage = await db.insertOne('CommentImages', {
                        ImagePath: fileName,
                        CommentId: req_id
                    });
                    response.Success = true;
                    response.Content.push(newImage);
                }
            } catch (e) {
                console.log(e);
                response.Success = false;
                response.Messages.push('Internal error');
            }
        }
    }
    res.json(response);
}