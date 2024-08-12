const jwt = require("jsonwebtoken");
const authconfig = require("../../../configs/auth.config");
const User = require("./user.model");
const Booking = require("../booking/booking.model");

// Middleware to validate the access token
const verifytoken = (req, res, next) => {
  // if the token is present
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(401).send({
      message: "Token is missing",
    });
  }

  // if the token is valid
  jwt.verify(token, authconfig.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Invalid Token",
      });
    }
    // Fatch the userId from the token and set it to the request object
    req.userId = decoded.id;
    next();
  });
};

// Middleware to check if user is admin or not
const isAdmin = async (req, res, next) => {
  try {
    const userObj = await User.findOne({ _id: req.userId });
    if (userObj && userObj.role == "admin") {
      next();
    } else {
      return res.status(403).send({
        message: "Only ADMIN is Allowed",
      });
    }
  } catch {
    console.log("Error while checking if isAdmin ", err.message);
    res.status(500).send({
      message: "Some internal server error",
    });
  }
};

// Middleware to check if user is admin or booking owner
const isAdminOrBookingOwner = async (req, res, next) => {
  try {
    const userObj = await User.findOne({ _id: req.userId });
    if (userObj && userObj.role == "admin") {
      next();
    } else {
      const booking = await Booking.findById(req.params.bookingId)
      if (booking && booking.bookedBy == req.userId) {
        next()
      } else {
        return res.status(403).send({
          message: "Only ADMIN and Booking Owner is Allowed",
        });
      }
    }
  } catch {
    console.log("Error while checking if isAdmin ", err.message);
    res.status(500).send({
      message: "Some internal server error",
    });
  }
};

// Middleware to check if user is booking owner
const isBookingOwner = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (booking && booking.bookedBy == req.userId) {
      next()
    } else {
      return res.status(403).send({
        message: "Only Booking Owner is Allowed",
      });
    }
  } catch {
    console.log("Error while checking if isAdmin ", err.message);
    res.status(500).send({
      message: "Some internal server error",
    });
  }
};
module.exports = {
  verifytoken: verifytoken,
  isAdmin: isAdmin,
  isAdminOrBookingOwner: isAdminOrBookingOwner,
  isBookingOwner: isBookingOwner
};
