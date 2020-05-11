const db = require('./db');
var ObjectId = require('mongodb').ObjectId;

module.exports.validateProductRequest = (request) => {
    let messages = [];

    if (request.Name.length <= 0) {
        messages.push('Name: product name cannot be empty');
    }
    if (request.Price <= 0) {
        messages.push('Price: invalid (must be a valid decimal greater than 0)');
    }
    if (request.Description.length <= 0) {
        messages.push('Description: product description cannot be empty');
    }
    if (request.ImagePath.length <= 0) {
        messages.push('ImagePath: product image cannot be empty');
    }
    if (request.ShippingCost <= 0) {
        messages.push('ShippingCost: invalid (must be a valid decimal greater than or equals 0)');
    }
    if (request.IsTaxable.length <= 0 && (request.IsTaxable != "false" || request.IsTaxable != "true")) {
        messages.push('IsTaxable: invalid (must be true or false)');
    }
    if (request.Make.length <= 0) {
        messages.push('Make: invalid (make cannot be empty)');
    }
    if (request.Model.length <= 0) {
        messages.push('Model: invalid (model cannot be empty)');
    }
    if (request.ProductTypeId <= 0) {
        messages.push('ProductTypeId: invalid (must be an integer greater than 0)');
    }

    return messages;
};

module.exports.validateProductDuplication = async (requestId) => {
    let messages = [];

    try {
        let req_id = new ObjectId(requestId);
        let product = await db.find('Products', { _id: req_id });
        if (!product.length) {
            messages.push('Product not found');
        }
    } catch (e) {
        console.log(e);
        messages.push('Internal error');
    } finally {
        return messages;
    }
}

module.exports.validateCommentRequest = (request) => {
    let messages = [];

    if (request.Rating <= 0 || request.Rating > 5) {
        messages.push('Rating: invalid (must be an integer between 1 and 5) ');
    }
    if (request.Text.length <= 0) {
        messages.push('Text: comment text cannot be empty');
    }
    if (request.AccountId <= 0) {
        messages.push('AccountId: invalid (must be an integer greater than 0) ');
    }
    if (request.ProductId <= 0) {
        messages.push('ProductId: invalid (must be an integer greater than 0) ');
    }

    return messages;
}

module.exports.valideCommentDuplication = async (requestId) => {
    let messages = [];
    
    try {
        let req_id = new ObjectId(requestId);
        let comment = await db.find('Comments', { _id: req_id });
        if (!comment.length) {
            messages.push('Comment not found');
        }
    } catch (e) {
        console.log(e);
        messages.push('Internal error');
    } finally {
        return messages;
    }
}

//This method checkhs wether loggedin user has the same username as the input`s username
module.exports.validateAccountLogIn = async (req) => {
    let messages = [];
    try {
        if(!req.session.AccountId.length) { 
            messages.push('Access denied');
            return;
        }   

        let req_id = new ObjectId(req.session.AccountId);
        let account = await db.find('Accounts', { Username: req.params.username });
        let loggedInAccount = await db.find('Accounts', { _id: req_id });

        if(!account.length || loggedInAccount[0] == null || loggedInAccount[0].Username != account[0].Username) {
            messages.push('Access denied');
        }
    } catch (e) {
        console.log(e);
        messages.push('Internal error');
    } finally {
        return messages;
    }
};

module.exports.validateFile = async (file) => {
    let messages = [];
    
    if (file.length < 0) {
        messages.push('File: invalid ( file length must greater than 0)');
    }
    
    return messages;
}

module.exports.validateAccountRequest = (request) => {
    let Messages = [];

    if (request.Email.length <= 5) {
        Messages.push('Email: email cannot be empty');
    }
    if (request.Password.length <= 5) {
        Messages.push('Password: password cannot be empty');
    }
    if (request.Username.length <= 3) {
        Messages.push('Username: username cannot be empty');
    }
    if (request.ShippingAddress == null || request.ShippingAddress.length <= 0) {
        Messages.push('ShippingAddress: shipping address cannot be empty');
    }

    return Messages;
}

module.exports.validateUpdateAccountRequest = (request) => {
    let Messages = [];

    if (request.ShippingAddress == null || request.ShippingAddress.length <= 0) {
        Messages.push('ShippingAddress: shipping address cannot be empty');
    }

    return Messages;
}

module.exports.validateChangePasswordRequest = (request) => {
    let Messages = [];

    if (request.Password.length <= 5) {
        Messages.push('Password: password cannot be empty');
    }

    return Messages;
}

module.exports.validateAccountDuplication = async (request) => {
    let Messages = [];

    try {
        let accountWithEmailDuplication = await db.find('Accounts', { Email: request.Email});
        let accountWithUsernameDuplication = await db.find('Accounts', { Username: request.Username});
        if (accountWithEmailDuplication == undefined || accountWithEmailDuplication.length > 0) {
            Messages.push('Email repeated');
        }
        if(accountWithUsernameDuplication == undefined || accountWithUsernameDuplication.length > 0) {
            Messages.push('Username repeated');
        }
    } catch (e) {
        console.log(e);
        Messages.push('Internal error');
    } finally {
        return Messages;
    }
}

module.exports.validateProductItemRequestWithId = async (requestId) => {
    let Messages = [];

    try {
        let req_id = new ObjectId(requestId);
        let productItems = await db.find('ProductItems', { _id: req_id });
        if (!productItems.length) {
            Messages.push('Product Item not found');
        }
    } catch (e) {
        console.log(e);
        Messages.push('Internal error');
    } finally {
        return Messages;
    }
}

module.exports.validateProductItemRequest = async (body) => {
    let Messages = [];

    try {
        if(body.ProductId <= 0) {
            Messages.push("ProductId: invalid (must be an integer greater than or equals to 0)");
        }

        let req_id = new ObjectId(body.ProductId);
        let product = await db.find('Products', { _id: req_id });
        if(!product.length) {
            Messages.push('Product not found');
        }

        //Validate quantity
        if (body.Quantity < 1 || body.Quantity > 100) {
            Messages.push("Quantity: invalid (must be an integer between 1 and 100)");
        }
    } catch (e) {
        console.log(e);
        Messages.push('Internal error');
    } finally {
        return Messages;
    }
}

module.exports.validateProductItemDuplicate = async (request) => {
    let Messages = [];

    try {
        let productId = new ObjectId(request.body.ProductId);
        let shopId = new ObjectId(request.session.ShoppingCartId);
        let productItems = await db.find("ProductItems", { ShoppingCartId: shopId, ProductId: productId });
        if(productItems.length) {
            Messages.push("ProductId: invalid (product id already exists)");
        }
    } catch (e) {
        console.log(e);
        Messages.push('Internal error');
    } finally {
        return Messages;
    }
}

module.exports.validateShoppingCartRequestWithId = async (requestId) => {
    let Messages = [];

    try {
        let req_id = new ObjectId(requestId);
        let shoppingCarts = await db.find('ShoppingCarts', { _id: req_id });
        if (!shoppingCarts.length) {
            Messages.push('Shopping Cart not found');
        }
    } catch (e) {
        console.log(e);
        Messages.push('Internal error');
    } finally {
        return Messages;
    }
}

module.exports.validateShoppingCartRequest = async (request) => {
    let Messages = [];

    if (request.Purchased.length <= 0) {
        Messages.push('Purchased: purchased cannot be empty');
    }
    else if (request.Purchased != 'true' && request.Purchased != 'false') {
        Messages.push('Purchased: value should be true or false');
    }

    if (request.ShippingAddress.length <= 0) {
        Messages.push('ShippingAddress: shipping address cannot be empty');
    }

    return Messages;
}