const db = require('./db');

// https://www.npmjs.com/package/bcrypt
// password hashing npm library
const bcrypt = require('bcrypt');

module.exports.post = async(req, res) => {
    let response = {
        Success: false,
        Content: {},
        Messages: []
    };

    try {
        let body = req.body;
        let accounts = await db.find('Accounts', { Email: body.Email });

        // if array is empty, did not find account
        if (!accounts.length) {
            response.Messages.push('Email or password invalid');
        }
        else {    
            let account = accounts[0];
            let match = await bcrypt.compare(body.Password, account.Password);
            if (!match) {
                response.Messages.push('Email or password invalid');
            }
            else {
                // Update Shopping Cart
                if (req.session.ShoppingCartId != null && req.session.ShoppingCartId.length) {
                    try {
                        await db.updateOne('ShoppingCarts', { _id: req.session.ShoppingCartId }, { AccountId: account._id });
                    }
                    catch(e) {
                        console.log(e);
                    }
                }
                req.session.AccountId = account._id;
                response.Success = true;
                response.Content.Username = account.Username;
            }
        }
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    }
    finally {
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
        // unset account id
        req.session.AccountId = '';
        response.Success = true;
    } catch(e) {
        console.log(e);
        response.Messages.push('Internal error');
    }
    finally {
        res.json(response);
    }
}