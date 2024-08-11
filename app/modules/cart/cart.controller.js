const Cart = require("./cart.model");
const mongoose = require('mongoose');

exports.addToCart = async (req, res) => {
    try {
        const cartObj = {
            service: req.body.service,
            vehicleYear: req.body.vehicleYear,
            vehicleManufacturer: req.body.vehicleManufacturer,
            vehicleModel: req.body.vehicleModel,
            vehicleEngine: req.body.vehicleEngine,
            serviceDate: req.body.serviceDate,
            location: req.body.location,
            createdBy: req.userId
        };
        const savedCartItem = await Cart.create(cartObj);
        res.status(200).send({ data: savedCartItem, status: 200 });
    } catch (err) {
        console.log("Error while adding cart item", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.getCartItems = async (req, res) => {
    try {
        const queryObj = { createdBy: mongoose.Types.ObjectId.createFromHexString(req.userId) };
        const cartItems = await Cart.find(queryObj);
        res.status(200).send({ data: cartItems, message: "Successfully fetched all cart Items", status: 200 });
    } catch (err) {
        console.log("Error while fetching cart ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};
exports.deleteCartItem = async (req, res) => {
    try {
        const cartItemId = req.params.cartItemId;
        const cartItemTobeDeleted = await Cart.findById(cartItemId);
        if (!cartItemTobeDeleted) {
            return res.status(404).send({
                message: "Cart item with the given id to be deleted is not found",
            });
        }
        if(cartItemTobeDeleted.createdBy != req.userId){
            return res.status(401).send({
                message: "You are not authorized to delete this cart item",
                status: 401
            });
        }

        const deleteObj = await Cart.deleteOne({ _id: cartItemTobeDeleted._id });
        if (!deleteObj) {
            return res.status(500).send({
                message: "Some internal server error",
                status: 500
            });
        }
        res.status(200).send({ data: cartItemTobeDeleted, message: "Successfully deleted the cart item", status: 200 });
    } catch (err) {
        console.log("Error while deleting cart ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}