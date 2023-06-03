const express = require('express');
const userRoute=express();
const auth=require("../middleware/auth");

const userController=require("../controllers/userController")


userRoute.set('view engine','ejs');
userRoute.set('views','./views/user');

userRoute.get('/', userController.homeload);
userRoute.get('/login',auth.userLoggedIn, userController.loginload);
userRoute.get('/signup',auth.userLoggedIn, userController.signupload);



userRoute.get('/forgot_pass', userController.forgot_pass);
userRoute.post('/forgot_pass', userController.forgotPasswordOtp);
userRoute.post('/forgotPasswordOtpEnter',userController.verifyForgotPasswordOtp);
userRoute.post('/passwordReset',userController.resettingPassword);
userRoute.get('/resendForgotPassword_otp', userController.forgotPasswordOtp);


userRoute.post('/signup',userController.sendOtp);
userRoute.post('/otpEnter',userController.verifyOtp);
userRoute.get('/resend_otp',userController.sendOtp);

userRoute.post('/login', userController.verifyLogin);

userRoute.get('/login/catDetails/:id', userController.categoryDetail);
userRoute.get('/sortfilter', userController.sortedProductList);
userRoute.get('/login/prodDetails/:id', userController.prodDetails);


userRoute.get("/myAccount",auth.userLoggedIn,userController.loadMyAccount);


userRoute.get('/logout', userController.handleLogout);


module.exports = userRoute;
