const express = require ("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");

const userController = require("../controllers/userController")

router.get('/register', userController.renderRegisterForm )


router.post('/register', catchAsync(userController.registerUser));

router.get('/login', userController.renderLoginForm)

//keepSessionInfo should be true after the security updates done to passport 0.6.0
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}), userController.loginAuthetication );

router.get('/logout', userController.logoutUser);


module.exports = router;
