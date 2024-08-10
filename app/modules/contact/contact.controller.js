const Contact = require("./contact.model");


exports.createContact = async (req, res) => {
    try {
        const contactObj = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            message: req.body.message,
        };
        const savedContact = await Contact.create(contactObj);
        res.status(200).send({ data: savedContact, status: 200 });
    } catch (err) {
        console.log("Error while creating contact ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};

exports.getContacts = async (req, res) => {
    try {
        const allContacts = await Contact.find({});
        res.status(200).send({ data: allContacts, message: "Successfully fetched all Contacts", status: 200 });
    } catch (err) {
        console.log("Error while fetching Contacts ", err.message);
        res.status(500).send({
            message: "Some internal server error",
            status: 500
        });
    }
};