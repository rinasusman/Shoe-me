const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const User = require("../models/userModel");
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

const { ObjectId } = require("mongodb");

const homeload = async (req, res) => {
  const category = await Category.find({});
 
  if (req.session.user) {
    userData = req.session.user;
    User.findOne({ _id: userData }).then((user) => {
      res.render("home", { userData: user, data: category });
    });
  } else {
    res.render("home", { data: category});
  }
};


const loginload = async (req, res) => {
    try {
      res.render("login", { footer: "" });
    } catch (error) {
      console.log(error.message);
    }
  };

  
const signupload = async (req, res) => {
    try {
      res.render("signup", { footer: "" });
    } catch (error) {
      console.log(error.message);
    }
  };

  const forgot_pass = async (req, res) => {
    try {
      res.render("forgot_pass");
    } catch (error) {
      console.log(error.message);
    }
  };

let saveOtp;
let saveForgotPasswordOtp;
let name;
let email;
let number;
let password;

const sendOtp = async (req, res) => {
  try {
    
    const emailExist = await User.findOne({ email: req.body.email ? req.body.email : email });
    if (!emailExist) {
      if (!saveOtp) {
        let generatedOtp = generateOTP();
        saveOtp = generatedOtp;
        name = req.body.name ? req.body.name : name;
        email = req.body.email ? req.body.email : email;
        number = req.body.number ? req.body.number : number;
        password = req.body.password ? req.body.password : password;
        console.log(req.body);
        sendOtpMail(email, generatedOtp);
        res.render("otpEnter", { footer: "" })
        setTimeout(() => {
          saveOtp = null;
        }, 60 * 1000);
      } else {
        res.render("otpEnter", { footer: "", })
      }
    } else {
      res.render("signup", { footer: "Userdata already exists" })
    }
  } catch (error) {
    console.log(error.message);
  }
};
const forgotPasswordOtp = async (req, res) => {
    try {
      const emailExist = await User.findOne({ email: req.body.email ? req.body.email : email });
      if (emailExist) {
        if (!saveForgotPasswordOtp) {
          let generatedOtp = generateOTP();
          saveForgotPasswordOtp = generatedOtp;
          email = req.body.email ? req.body.email : email;
          sendForgotPasswordOtpMail(email, generatedOtp);
          res.render("forgotPasswordOtpEnter", { footer: "" })
          setTimeout(() => {
            saveForgotPasswordOtp = null;
          }, 60 * 1000);
        } else {
          res.render("forgotPasswordOtpEnter", { footer: "", })
        }
      } else {
        res.render("forgot_pass", { footer: "Email does not exists" })
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  


function generateOTP() {
    let otp = "";
    for (let i = 0; i < 6; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  }
  async function sendOtpMail(email, otp) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'shoeme442@gmail.com',
          pass: 'tnrhkkmrxhkxzifo'
        }
      });
      const mailOptions = {
        from: 'shoeme442@gmail.com',
        to: email,
        subject: 'Your OTP for user verification',
        text: `Your OTP is ${otp}. Please enter this code to verify your account.`
      };
  
      const result = await transporter.sendMail(mailOptions);
      console.log(result);
    } catch (error) {
      console.log(error.message);
    }
  }



  async function sendForgotPasswordOtpMail(email, otp) {
    try {
      // Create a Nodemailer transport object
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'shoeme442@gmail.com',
          pass: 'tnrhkkmrxhkxzifo'
        }
      });
  
      // Define email options
      const mailOptions = {
        from: 'shoeme442@gmail.com',
        to: email,
        subject: 'Your OTP for password resetting',
        text: `Your OTP is ${otp}. Please enter this code to reset your password.`
      };
  
      // Send the email
      const result = await transporter.sendMail(mailOptions);
      console.log(result);
    } catch (error) {
      console.log(error.message);
    }
  }



  const securePassword = async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
    } catch (error) {
      console.log(error.message);
    }
  }
  const verifyOtp = async (req, res) => {
  
    const EnteredOtp = req.body.otp;
    if (EnteredOtp === saveOtp) {
      const securedPassword = await securePassword(password);
      const newUser = new User({
        name: name,
        email: email,
        number: number,
        password: securedPassword,
        blockStatus: false,
      });
      await newUser.save();
      res.render("login", { footer: "Account Created Successfully, Please Login" });
    } else {
      res.render("otpEnter", { footer: "Incorrect OTP" })
    }
 
  
    
  }

  const verifyForgotPasswordOtp = async (req, res) => {
    const EnteredForgotPasswordOtp = req.body.otp;
    if (EnteredForgotPasswordOtp === saveForgotPasswordOtp) {
      res.render("passwordReset", { footer: "" });
    } else {
      res.render("forgotPasswordOtpEnter", { footer: "Incorrect OTP" })
    }
  }

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        if (user.blockStatus) {
          res.render("login", { footer: "User Is Blocked" });
        } else {
          req.session.user = user._id;
          const CategoryList = await Category.find({});
          res.render("home", {userData: user,data: CategoryList,});
        }

      } else {
        res.render("login", { footer: "Email and  Password is  Invalid" });
      }
    } else {
      res.render("login", { footer: "Email and  Password is  Invalid" });
    }
  }
  catch (error) {
    console.log(error.message);
  }
};
const categoryDetail = async (req, res) => {
  if (req.params.id) {
    try {
      const categoryId = new ObjectId(req.params.id);
      const entireProductData = await Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        }, {
          $match: {
            isDeleted: false,
            "category._id": categoryId
          }
        }
      ])
      const colorOption = [...new Set(entireProductData.map(obj => obj.color))];
      const brandOption = [...new Set(entireProductData.map(obj => obj.brand))];
      const sizeOption = [...new Set(entireProductData.map(obj => obj.size))];

      const productData = await Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        }, {
          $match: {
            isDeleted: false,
            "category._id": categoryId
          }
        },
        {
          $limit: 2
        }
      ]);

      if (req.session.user) {
        userData = req.session.user;
        User.findOne({ _id: userData }).then((user) => {
          res.render("productList", {
            userData: user,
            data: productData,
            brandOption: brandOption,
            sizeOption: sizeOption,
            colorOption: colorOption,
            colorSelected: [],
            brandSelected: [],
            sizeSelected: [],
            categoryId: categoryId,
            page: 1,
            sort: 0
          });
        });
      } else {
        res.render("productList", { data: productData, sort: 0, colorSelected: [], brandSelected: [], sizeSelected: [], brandOption: brandOption, sizeOption: sizeOption, colorOption: colorOption, categoryId: categoryId, page: 1, sort: 0 });
      }
    } catch (error) {
      console.log(error.message);
    }
  }
};
const resettingPassword = async (req, res) => {
    try {
      const password = req.body.password;
      const email = req.body.email;
      const emailExist = await User.findOne({ email: email });
      if (emailExist) {
        const securedPassword = await securePassword(password);
        await User.updateOne({ email: email }, { $set: { password: securedPassword } })
        res.render("login", { footer: "Password Resetted  Successfully , Please Login" });
      } else {
        res.render("passwordReset", { footer: "Incorrect Email" })
      }
  
    } catch (error) {
      console.log(error.message);
    }
  }



  const handleLogout = async (req, res) => {
    try {
      delete req.session.user
      // req.session.user = false;
      res.render("login", { footer: "Logged Out Successfully" });
    } catch (error) {
      console.log(error.message);
    }
  };
  const loadMyAccount = async (req, res) => {
    try {
      let session = req.session.user;
      const user = await User.findOne({ _id: session })
      res.render("myAccount", { userData: user, message: "" });
    } catch (error) {
      console.log(error.message);
    }
  };
  const sortedProductList = async (req, res) => {
    try {
      const categoryId = new ObjectId(req.query.id);
      const entireProductData = await Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        }, {
          $match: {
            isDeleted: false,
            "category._id": categoryId
          }
        }
      ]);
      const colorOption = [...new Set(entireProductData.map(obj => obj.color))];
      const brandOption = [...new Set(entireProductData.map(obj => obj.brand))];
      const sizeOption = [...new Set(entireProductData.map(obj => obj.size))];
  
  
      const sortValue = parseInt(req.query.value, 10)
      const color = req.query.color ? req.query.color.split(",") : []
      const brand = req.query.brand ? req.query.brand.split(",") : []
      const size = req.query.size ? req.query.size.split(",") : []
      const page = parseInt(req.query.page, 10) - 1
      const limitVal = parseInt(req.query.limit, 10)
  
      let query = {
        isDeleted: false,
        "category._id": categoryId,
      }
      if (brand.length > 0) {
        query.brand = { $in: brand }
      }
      if (size.length > 0) {
        query.size = { $in: size }
      }
      if (color.length > 0) {
        query.color = { $in: color }
      }
  
  
      let z = {
        $sort: {
          price: sortValue,
        },
      }
  
      let y = [
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        }, {
          $match: query,
        },
      ]
  
      if (sortValue != 0) {
        y.push(z)
      }
      const sortedProductData = await Product.aggregate(y).skip(page).limit(limitVal)
      if (req.session.user) {
        userData = req.session.user;
        User.findOne({ _id: userData }).then((user) => {
          res.render("productList", {
            userData: user,
            data: sortedProductData,
            sort: sortValue, colorSelected: color, brandSelected: brand, sizeSelected: size, brandOption: brandOption, sizeOption: sizeOption, colorOption: colorOption, categoryId: categoryId, page: page + 1
          });
        });
      } else {
        res.render("productList", { data: sortedProductData, sort: sortValue, colorSelected: color, brandSelected: brand, sizeSelected: size, brandOption: brandOption, sizeOption: sizeOption, colorOption: colorOption, categoryId: categoryId, page: page + 1 });
      }
  
    } catch (error) {
      console.log(error.message);
    }
  };
  const prodDetails = async (req, res) => {
    if (req.params.id) {
      try {
  
        const productId = new ObjectId(req.params.id);
        userData = req.session.user;
        const productObj = await Product.aggregate([
          {
            $match: {
              _id: productId
            }
          },
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "categoryDetails",
            },
          },
          {
            $unwind: "$categoryDetails",
          },
        ]);
        if (req.session.user) {
          User.findOne({ _id: userData }).then((user) => {
            res.render("product", { userData: user, data: productObj, text: "" });
          });
        } else {
          res.render("product", { data: productObj, text: "" });
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  };
  
  


module.exports = {
    homeload,
    signupload,
    verifyLogin,
    verifyOtp,
    sendOtp,
    loginload,
    forgot_pass,
    resettingPassword,
    verifyForgotPasswordOtp,
    forgotPasswordOtp,
    handleLogout,
    loadMyAccount,
    categoryDetail,
    sortedProductList,
    prodDetails
}