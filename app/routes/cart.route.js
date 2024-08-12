const cartController = require("../modules/cart/cart.controller");
const auth = require("../modules/user/auth.middleware");

module.exports = (app) => {

    app.post("/mms/api/v1/cart", [auth.verifytoken], cartController.addToCart);
    app.post("/mms/api/v1/cart/:cartItemId", [auth.verifytoken], cartController.editCartItems);
    app.get("/mms/api/v1/cart", [auth.verifytoken], cartController.getCartItems);
    app.get("/mms/api/v1/cart/:cartItemId", [auth.verifytoken], cartController.getCartItem);
    app.delete("/mms/api/v1/cart/:cartItemId", [auth.verifytoken], cartController.deleteCartItem);
}