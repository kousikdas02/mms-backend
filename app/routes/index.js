function registerRoutes(app) {
    require("./auth.route")(app);
    require("./service.route")(app);
    require("./manufacturer.route")(app);
    require("./model.route")(app);
    require("./engine.route")(app);
    require("./booking.route")(app);
};

module.exports = registerRoutes;