const bcrypt = require("bcryptjs");
const User = require("./user.model");
const jwt = require("jsonwebtoken");
const authConfig = require("../../../configs/auth.config");


exports.signup = async (req, res) => {
  try {
    const userObj = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      gender: req.body.gender,
      password: bcrypt.hashSync(req.body.password, 8),
    };

    const savedUser = await User.create(userObj);

    const postResponse = {
      _id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      phone: savedUser.phone,
      gender: savedUser.gender,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
    res.status(200).send({ data: postResponse, status: 200 });
  } catch (err) {
    console.log("Error while registering user ", err.message);
    res.status(500).send({
      message: "Some internal server error",
      status: 500
    });
  }
};
exports.signin = async (req, res) => {
  try {
    const emailFromReq = req.body.email;
    const passwordFromReq = req.body.password;

    // Ensure the user is valid
    const userSaved = await User.findOne({ email: emailFromReq });

    if (!userSaved) {
      return res.status(401).send({
        message: "Email given is not correct",
      });
    }

    // Ensure password matches
    // Req password is in plain string
    // Database password is hashed
    // So we compare using the bcrypt
    const isValidPassword = bcrypt.compareSync(
      passwordFromReq,
      userSaved.password
    );

    if (!isValidPassword) {
      return res.status(401).send({
        message: "Incorrect password",
      });
    }

    // We generate the access token (JWT based)
    const token = jwt.sign(
      {
        id: userSaved._id,
      },
      authConfig.secret,
      { expiresIn: "7d" }
    );

    // send the res back
    res.status(200).send({
      status: 200,
      data:
      {
        _id: userSaved._id,
        firstName: userSaved.firstName,
        lastName: userSaved.lastName,
        email: userSaved.email,
        phone: userSaved.phone,
        gender: userSaved.gender,
        role: userSaved.role,
        createdAt: userSaved.createdAt,
        updatedAt: userSaved.updatedAt,
        accessToken: token,
      }
    });
  } catch (err) {
    console.log("Error while sign in ", err.message);
    res.status(500).send({
      message: "Some internal server error",
      status: 500
    });
  }
};
exports.makeAdmin = async (req, res) => {
  try {
    const userObj = {
      firstName: 'Koushik',
      lastName: 'Das',
      email: 'koushik@yopmail.com',
      phone: '1234567892',
      gender: 'male',
      role: 'admin',
      password: bcrypt.hashSync("Admin@1234", 8)
    };

    // Insert the data in the database
    const savedUser = await User.create(userObj);

    res.status(200).send({ data: {}, msg: "Admin created successfully", status: 200 });
  } catch (err) {
    console.log("Error while registering user ", err.message);
    res.status(500).send({
      message: "Some internal server error",
      status: 500
    });
  }
};
exports.getUsers = async (req, res) => {
  try {
    const queryObj = { role: { $ne: 'admin' } };
    const allUsers = await User.find(queryObj);
    res.status(200).send({ data: allUsers, message: "Successfully fetched all Users", status: 200 });
  } catch (err) {
    console.log("Error while fetching user ", err.message);
    res.status(500).send({
      message: "Some internal server error",
      status: 500
    });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).send({ data: user, message: "Successfully fetched User details", status: 200 });
  } catch (err) {
    console.log("Error while fetching user profile", err.message);
    res.status(500).send({
      message: "Some internal server error",
      status: 500
    });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const userTobeUpdated = await User.findById(req.userId);
    userTobeUpdated.firstName = req.body.firstName ? req.body.firstName : userTobeUpdated.firstName;
    userTobeUpdated.lastName = req.body.lastName ? req.body.lastName : userTobeUpdated.lastName;
    userTobeUpdated.email = req.body.email ? req.body.email : userTobeUpdated.email;
    userTobeUpdated.phone = req.body.phone ? req.body.phone : userTobeUpdated.phone;
    userTobeUpdated.gender = req.body.gender ? req.body.gender : userTobeUpdated.gender;

    const updatedUser = await userTobeUpdated.save();
    res.status(200).send({ data: updatedUser, message: "Successfully updated the User", status: 200 });
  } catch (err) {
    console.log("Error while updating user ", err.message);
    res.status(500).send({
      message: "Some internal server error",
      status: 500
    });
  }
}
exports.updatePassword = async (req, res) => {
  try {
    const userTobeUpdated = await User.findById(req.userId);
     // Ensure password matches
     // Req password is in plain string
     // Database password is hashed
     // So we compare using the bcrypt
     const isValidPassword = bcrypt.compareSync(
       req.body.oldPassword,
       userTobeUpdated.password
     );
 
     if (!isValidPassword) {
       return res.status(401).send({
         message: "Please enter correct password",
       });
     }
    userTobeUpdated.password = bcrypt.hashSync(req.body.newPassword, 8);
    const updatedUser = await userTobeUpdated.save();
    res.status(200).send({ data: updatedUser, message: "Successfully changed the password", status: 200 });
  } catch (err) {
    console.log("Error while updating user password", err.message);
    res.status(500).send({
      message: "Some internal server error",
      status: 500
    });
  }
}