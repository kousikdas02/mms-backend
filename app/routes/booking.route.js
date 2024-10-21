const bookingController = require("../modules/booking/booking.controller");
const auth = require("../modules/user/auth.middleware");

module.exports = (app) => {

    app.post("/mms/api/v1/booking", [auth.verifytoken], bookingController.createBooking);
    app.post("/mms/api/v1/booking/:bookingId/rest", [auth.verifytoken], bookingController.payRestAmount);
    app.get("/mms/api/v1/booking", [auth.verifytoken], bookingController.getBookings);
    app.get("/mms/api/v1/booking/:bookingId", [auth.verifytoken, auth.isAdminOrBookingOwner], bookingController.getBooking);
    app.put("/mms/api/v1/booking/:bookingId/status", [auth.verifytoken, auth.isBookingOwner], bookingController.updateBookingStatus);


    app.post("/mms/api/v1/cart/:cartItemId/booking", [auth.verifytoken], bookingController.createBookingFromCart);
}