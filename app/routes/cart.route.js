const cartController = require("../modules/cart/cart.controller");
const auth = require("../modules/user/auth.middleware");

module.exports = (app) => {

    app.post("/mms/api/v1/cart", [auth.verifytoken], cartController.addToCart);
    app.get("/mms/api/v1/cart", [auth.verifytoken], cartController.getCartItems);
    app.delete("/mms/api/v1/cart/:cartItemId", [auth.verifytoken], cartController.deleteCartItem);
}