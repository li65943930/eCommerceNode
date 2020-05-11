# Introduction 
eCommerceNode is a NodeJS implementation of the server components required to provide data from a MongoDB database instance to the VueJS client in an E-Commerce website. 
This project is the third part of a four parts project for an E-Commerce website. 
The VueJS is not implemented yet as per the requirements of this project, and therefore, continuous fixes and updates to the eCommerceNode code are expected. 
This project is a required coursework in the PROG8185 Web Technologies course at Conestoga College, and the main objective of this project was the implementation of server-side web APIs.

# Getting Started
The final shopping website will support the following features:

1. A page that displays products, products' images and descriptions, which may be purchased in various quantities.
2. A product details page that shows more information about a specific product and allows the user to select a quantity for purchase.
3. Authorized users, such as Admins, have extra features of creating a new product and updating or deleting an existing product from the store's inventory.
4. A shopping cart that shows selected items and their quantities of each user.
5. Users can update the cart by changing products' quantities or removing items from the cart.
6. At the discretion of the user, any user can create new account or modify current account details, such as user name, email, shipping address, and password.
7. Users are still able to purchase anonymously from our online store without the need to create an account (guest checkout)
8. Users can rate and add a review/comment about any product they have purchased with their account information. While guest users can ONLY display other users' comments
9. In addition, users optionally can upload images as well as part of their product review.
10. A login element on every page that shows the user a login dialog for switching from anonymous shopping. The element should optionally switch to showing the user's name when logged in.
11. Our project keep track of cart items' sessions in two ways: for guest users, cart items are available as long as the session is active. For logged in users (users with accounts), the cart items are available as long as the user is logged and the session is active (including if they sign out and then sign in, these details will be retrieved as long as the session is alive).

# Prerequisites
Node.js v10 or higher 
MongoDB (can be local or remote instanceL)
Optionally VS Code editor
Postman for testing


# Current Release
Version 1.0

# Contribute
Contributions to eCommerceNode are welcome. Here is how you can contribute to our code:

1. Submit bugs and help us verify fixes
2. Submit pull requests for bug fixes and features and discuss existing proposals

# Acknowledgment
We would like to acknowledge that some helper files were originally developed by our course instructor, Prof. Rick Kozak, adopted and modified by us to suit the needs and requirements of this project.

# eCommerceNode
