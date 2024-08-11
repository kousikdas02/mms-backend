const stripeConfig = require("../../configs/stripe.config");
const stripe = require('stripe')(stripeConfig.stripeSecretKey);


exports.createProduct = async (data) => {
    try {
        const product = await stripe.products.create(data);
        return product;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.updateProduct = async (id, data) => {
    try {
        const product = await stripe.products.update(id, data);
        return product;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.inactiveProduct = async (id) => {
    try {
        const product = await stripe.products.update(id, { active: false });
        return product;
    } catch (err) {
        console.log(err);
        throw err;
    }
}


exports.createPrice = async (data) => {
    try {
        const price = await stripe.prices.create(data);
        return price;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.inactivePrice = async (id) => {
    try {
        const price = await stripe.prices.update(id, { active: false });
        return price;
    } catch (err) {
        console.log(err);
        throw err;
    }
}


exports.createCustomer = async (data) => {
    try {
        const customer = await stripe.customers.create(data);
        return customer;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.updateCustomer = async (id, data) => {
    try {
        const customer = await stripe.customers.update(id, data);
        return customer;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.deleteCustomer = async (id) => {
    try {
        const customer = await stripe.customers.del(id);
        return customer;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.retrieveCustomer = async (id) => {
    try {
        const customer = await stripe.customers.retrieve(id);
        return customer;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

exports.getPaymentMethods = async (customerId) => {
    try {
        const paymentMethods = await stripe.customers.listPaymentMethods(customerId);
        return paymentMethods;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.getPaymentMethod = async (customerId, paymentMethodId) => {
    try {
        const paymentMethod = await stripe.customers.retrievePaymentMethod(customerId, paymentMethodId);
        return paymentMethod;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.attachPaymentMethods = async (paymentMethodId, customerData) => {
    try {
        const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, customerData);
        return paymentMethod;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.detachPaymentMethods = async (paymentMethodId) => {
    try {
        const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
        return paymentMethod;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

exports.createSetupIntent = async (data) => {
    try {
        const setupIntent = await stripe.setupIntents.create(data);
        return setupIntent;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.retrieveSetupIntent = async (id) => {
    try {
        const setupIntent = await stripe.setupIntents.retrieve(id);
        return setupIntent;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.detachSetupIntent = async (id) => {
    try {
        const setupIntent = await stripe.setupIntents.cancel(id);
        return setupIntent;
    } catch (err) {
        console.log(err);
        throw err;
    }
}


exports.createSubscription = async (data) => {
    try {
        const subscription = await stripe.subscriptions.create(data);
        return subscription;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.updateSubscription = async (id, data) => {
    try {
        const subscription = await stripe.subscriptions.update(id, data);
        return subscription;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.retrieveSubscription = async (id) => {
    try {
        const subscription = await stripe.subscriptions.retrieve(id);
        return subscription;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.cancelSubscriptionAtPeriodEnd = async (id) => {
    try {
        const subscription = await stripe.subscriptions.update(id,
            {
                cancel_at_period_end: true
            });
        return subscription;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.cancelSubscription = async (id) => {
    try {
        const subscription = await stripe.subscriptions.cancel(id);
        return subscription;
    } catch (err) {
        console.log(err);
        throw err;
    }
}


exports.createCoupon = async (data) => {
    try {
        const coupon = await stripe.coupons.create(data);
        return coupon;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
exports.deleteCoupon = async (id) => {
    try {
        const coupon = await stripe.coupons.del(id);
        return coupon;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

exports.getInvoices = async (customerId) => {
    try {
        const invoices = await stripe.invoices.list({ customer: customerId });
        return invoices;
    } catch (err) {
        console.log(err);
        throw err;
    }
}