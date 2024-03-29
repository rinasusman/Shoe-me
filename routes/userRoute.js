const express = require('express');
const userRoute=express();
const auth=require("../middleware/auth");

const userController=require("../controllers/userController")


userRoute.set('view engine','ejs');
userRoute.set('views','./views/user');

userRoute.get('/', userController.homeload);
userRoute.get('/login', userController.loginload);
userRoute.get('/signup', userController.signupload);



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


//============== profile management ==================//
userRoute.get("/myAccount",auth.userLogin,userController.loadMyAccount);
userRoute.post("/addAddressFromProfile", auth.userLogin, userController.addAddressFromProfile);
userRoute.get("/deleteAddress/:index", auth.userLogin, userController.deleteAddress);
userRoute.post("/editName", auth.userLogin, userController.editName);
userRoute.post("/editEmail", auth.userLogin, userController.editEmail);
userRoute.post("/editNumber", auth.userLogin, userController.editNumber);
//======================================================//


//============== cart management ==================//
userRoute.get("/cart",auth.userLogin,userController.loadCart);
userRoute.get('/addToCart/:id',auth.userLogin, userController.addToCart);
userRoute.post("/removeCartItem",auth.userLogin, userController.removeCartItem);
userRoute.post('/decrementOrIncrementCart',auth.userLogin, userController.decrementOrIncrementCart);

//======================================================//
//============== payment management ==================//
userRoute.get('/checkout',auth.userLogin, userController.loadCheckOut);
userRoute.post("/addAddress", auth.userLogin, userController.addAddress);
userRoute.post("/placeOrder", auth.userLogin, userController.placeOrder);
userRoute.get("/placeOrder", auth.userLogin, userController.placeOrder);
userRoute.post("/checkOrder", auth.userLogin, userController.placeOrder);
//======================================================//


userRoute.get('/logout',userController.handleLogout);


module.exports = userRoute;
