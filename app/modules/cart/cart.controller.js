const Cart = require("./cart.model");
const mongoose = require('mongoose');

exports.addToCart = async (req, res) => {
    try {
        const cartObj = {
            service: req.body.service,
            vehicleYear: req.body.year,
            vehicleManufacturer: req.body.manufacturer,
            vehicleModel: req.body.model,
            vehicleEngine: req.body.engine,
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

exports.editCartItems = async (req, res) => {
    try {
        const cartItemId = req.params.cartItemId;
        const cartItemTobeUpdated = await Cart.findById(cartItemId);
        if (!cartItemTobeUpdated) {
            return res.status(404).send({
                message: "Cart item with the given id to be updated is not found",
            });
        }
        if (cartItemTobeUpdated.createdBy != req.userId) {
            return res.status(401).send({
                message: "You are not authorized to update this cart item",
                status: 401
            });
        }

        cartItemTobeUpdated.service = req.body.service ? req.body.service : cartItemTobeUpdated.service;
        cartItemTobeUpdated.vehicleYear = req.body.year ? req.body.year : cartItemTobeUpdated.vehicleYear;
        cartItemTobeUpdated.vehicleManufacturer = req.body.manufacturer ? req.body.manufacturer : cartItemTobeUpdated.vehicleManufacturer;
        cartItemTobeUpdated.vehicleModel = req.body.model ? req.body.model : cartItemTobeUpdated.vehicleModel;
        cartItemTobeUpdated.vehicleEngine = req.body.engine ? req.body.engine : cartItemTobeUpdated.vehicleEngine;
        cartItemTobeUpdated.serviceDate = req.body.serviceDate ? req.body.serviceDate : cartItemTobeUpdated.serviceDate;
        cartItemTobeUpdated.location = req.body.location ? req.body.location : cartItemTobeUpdated.location;

        const updatedCartItem = await cartItemTobeUpdated.save();
        res.status(200).send({ data: updatedCartItem, status: 200 });
    } catch (err) {
        console.log("Error while updating cart item", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.getCartItems = async (req, res) => {
    try {
        const cartItems = await Cart.aggregate([
            {
                $match: { createdBy: mongoose.Types.ObjectId.createFromHexString(req.userId) }
            },
            {
                $lookup: {
                    from: "services", // The collection to join
                    localField: "service", // Field from the input documents
                    foreignField: "_id", // Field from the documents of the "from" collection
                    as: "serviceDetails" // Output array field
                },
            },
            {
                $lookup: {
                    from: "manufacturers", // The collection to join
                    localField: "vehicleManufacturer", // Field from the input documents
                    foreignField: "_id", // Field from the documents of the "from" collection
                    as: "manufacturerDetails" // Output array field
                }
            },
            {
                $lookup: {
                    from: "models", // The collection to join
                    localField: "vehicleModel", // Field from the input documents
                    foreignField: "_id", // Field from the documents of the "from" collection
                    as: "vehicleModelDetails" // Output array field
                }
            },
            {
                $lookup: {
                    from: "engines", // The collection to join
                    localField: "vehicleEngine", // Field from the input documents
                    foreignField: "_id", // Field from the documents of the "from" collection
                    as: "vehicleEngineDetails" // Output array field
                }
            },
            {
                $addFields: {
                    totalPrice: { $sum: "$serviceDetails.price" }
                }
            }
        ]);
        res.status(200).send({ data: cartItems, message: "Successfully fetched all cart Items", status: 200 });
    } catch (err) {
        console.log("Error while fetching cart ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};
exports.getCartItem = async (req, res) => {
    try {
        const cartItemId = req.params.cartItemId;
        const cartItem = await Cart.findById(cartItemId);
        if (!cartItem) {
            return res.status(404).send({
                message: "Cart item with the given id is not found",
            });
        }
        if (cartItem.createdBy != req.userId) {
            return res.status(401).send({
                message: "You are not authorized to see this cart item",
                status: 401
            });
        }
        res.status(200).send({ data: cartItem, message: "Successfully fetched the cart item", status: 200 });
    } catch (err) {
        console.log("Error while fetching cart item", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
}
exports.deleteCartItem = async (req, res) => {
    try {
        const cartItemId = req.params.cartItemId;
        const cartItemTobeDeleted = await Cart.findById(cartItemId);
        if (!cartItemTobeDeleted) {
            return res.status(404).send({
                message: "Cart item with the given id to be deleted is not found",
            });
        }
        if (cartItemTobeDeleted.createdBy != req.userId) {
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