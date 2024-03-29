const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const { ObjectId } = require("mongodb");


const fs = require("fs");
const path = require("path");

const loginload = async (req, res) => {
    try {
        res.render("adminlogin", { title: "Admin Login", footer: "" });
    } catch (error) {
        console.log(error.message);
    }
};

const homeload = async (req, res) => {
    try {
        const credential = {
            email: "admin@gmail.com",
            password: "admin",
        };
        if (req.body.email == credential.email && req.body.password == credential.password) {
            req.session.admin = req.body.email;
            const userdata = await User.find();
            res.render("adminHome", { data: userdata});
        }
        else {
            res.render("adminLogin", { title: "Admin Login Page", footer: "Invalid username or password" });
        }

    } catch (error) {
        console.log(error.message);
    }
};
const dashboardload = async (req, res) => {
    try {

        const userdata = await User.find();

       
        res.render("adminHome", { data: userdata });
    } catch (error) {
        console.log(error.message);
    }
};


const handleLogout = async (req, res) => {
    try {
        req.session.admin = false;
        res.render("adminlogin", { title: "Admin Login", footer: "Logged out successfully" });
    } catch (error) {
        console.log(error.message);
    }
};
const userlistload = async (req, res) => {
    try {
        const userdata = await User.find();

        res.render("adminUserList", { data: userdata });
    } catch (error) {
        console.log(error.message);
    }
};
const userBlockUnblock = (req, res) => {
    const id = req.body.id;
    const type = req.body.type;
    User.findByIdAndUpdate({ _id: id }, { $set: { blockStatus: type === 'block' ? true : false } })
        .then((response) => {
            if (type === "block") {
                req.session.user = false;
            }
            res.json(response);
            res.redirect("/admin/userlist");
        })
        .catch((err) => {
            console.log(err.message);
        });
};
const catlistload = async (req, res) => {
    try {
        const categoryData = await Category.find();
        if (categoryData.length > 0) {
            res.render("adminCatList", { data: categoryData, text: "" });
        } else {
            res.render("adminCatList", { data: categoryData, text: "No Category has been added!!!" });
        }

    } catch (error) {
        console.log(error.message);
    }
};
const createCategory = async (req, res) => {
    try {
        res.render("adminCatCreate");
    } catch (error) {
        console.log(error.message);
    }
};
const editCategoryPageLoad = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const categoryData = await Category.findById(categoryId)
        res.render("adminCatedit", { categoryData: categoryData, message: "" });
    } catch (error) {
        console.log(error.message);
    }
};
const addNewCategory = async (req, res) => {

    const categoryName = req.body.name;
    const image = req.file;
    const lowerCategoryName = categoryName.toLowerCase();
    try {
        const categoryExist = await Category.findOne({ category: lowerCategoryName });
        if (!categoryExist) {
            const newCategory = new Category({
                category: lowerCategoryName,
                imageUrl: image.filename,
            });
            await newCategory.save().then((response) => {
                res.redirect("/admin/categorylist");
            })
        } else {
            res.redirect("/admin/catCreate");
        }
    } catch (error) { }
};
const prodlistload = async (req, res) => {
    try {
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
            }, 
        ]);
        if (productData.length > 0) {
            await res.render("adminProdList", { data: productData, text: "" });
        } else {
            await res.render("adminProdList", { data: productData, text: "No products have been added" });
        }

    }
    catch (error) {
        console.log(error.message);
    }
};
const createProduct = async (req, res) => {
    try {
        const categoryData = await Category.find({});
        res.render("adminProdCreate", {
            category: categoryData,
        });
    } catch (error) {
        console.log(error.message);
    }
};
const addNewProduct = async (req, res) => {
    const images = req.files.map((file) => {
        return file.filename;
    });
    const productData = new Product({
        productName: req.body.name,
        price: req.body.price,
        offerPrice: req.body.price,
        description: req.body.description,
        category: req.body.category,
        imageUrl: images,
        brand: req.body.brand,
        size: req.body.size,
        color: req.body.color,
        stock: req.body.stock,
        isDeleted: false,
    });
    await productData.save()
        .then((response) => {
            res.redirect("/admin/productlist");
        })
}



const editCategory = async (req, res) => {
    try {
        const categoryName = req.body.name;
        const image = req.file;
        const categoryId = req.body.id;
        const catDoc = await Category.findById(categoryId);
        const previousImage = catDoc.imageUrl;
        const lowerCategoryName = categoryName.toUpperCase();
        const categoryExist = await Category.findOne({
            $and: [
                { _id: { $ne: categoryId } },
                { category: lowerCategoryName }
            ]
        });
        if (!categoryExist) {
            if (image) {
                await Category.findByIdAndUpdate(categoryId, {
                    category: lowerCategoryName,
                    imageUrl: image.filename,
                });
            } else {
                await Category.findByIdAndUpdate(categoryId, {
                    category: lowerCategoryName,
                    imageUrl: previousImage.filename,
                });
            }
            res.redirect("/admin/categorylist");
        } else {
            res.render("adminCatedit", { categoryData: catDoc, message: "Category with same name already exists" });
        }
    } catch (error) {
        console.log(error.message);
    }
};
const unlistCategory = async (req, res) => {
    try {
        const idVal = req.params.id;
        await Category.findByIdAndUpdate(idVal, { isDeleted: true });
        await Product.updateMany({ category: idVal }, { isDeleted: true });
        res.redirect('/admin/categorylist');
    } catch (error) {
        console.log(error.message);
    }
};

const listCategory = async (req, res) => {
    try {
        const idVal = req.params.id;
        await Category.findByIdAndUpdate(idVal, { isDeleted: false });
        await Product.updateMany({ category: idVal }, { isDeleted: false });
        res.redirect('/admin/categorylist');
    } catch (error) {
        console.log(error.message);
    }
};


const editProductPageload = async (req, res) => {
    try {
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
                    _id: new ObjectId(req.params.id),
                    isDeleted: false
                }
            }
        ]);
        const categoryData = await Category.find()
        res.render("adminProdEdit", { data: productData, text: "", category: categoryData });
    }
    catch (error) {
        console.log(error.message);
    }
};
const editProduct = async (req, res) => {
    try {
        const { id, productName, price, description, category, brand, size, color, stock } = req.body;
        const images = req.files.map(({ filename }) => filename);
        const offerPrice = price;
        const productDoc = await Product.findById(id);
        const previousImages = productDoc.imageUrl;
        const lowerProductName = productName.toUpperCase();
        const productExist = await Product.findOne({
            $and: [
                { _id: { $ne: id } },
                { productName: lowerProductName }
            ]
        });
        if (!productExist) {
            if (images) {
                await Product.findByIdAndUpdate(id, {
                    productName: lowerProductName,
                    imageUrl: images.filename,
                    price,
                    offerPrice,
                    description,
                    category,
                    brand,
                    size,
                    color,
                    stock
                });
            } else {
                await Product.findByIdAndUpdate(id, {
                    productName: lowerProductName,
                    imageUrl: previousImages.filename,
                    price,
                    offerPrice,
                    description,
                    category,
                    brand,
                    size,
                    color,
                    stock
                });
            }
            res.redirect("/admin/productlist");
        } else {
            const productData = await Product.aggregate([
                {
                    $match: {
                        _id: new ObjectId(id),
                    }
                },
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
                }
            ]);
            const categoryData = await Category.find()
            res.render("adminProdEdit", { data: productData, text: "Product with same name already exists", category: categoryData });
        }

    } catch (error) {
        console.log(error.message);
    }
};
const unlistProduct = async (req, res) => {
    try {
        const idVal = req.params.id;
        await Product.findByIdAndUpdate(idVal, { isDeleted: true });
        res.redirect('/admin/productlist');

    } catch (error) {
        console.log(error.message);
    }
};

const listProduct = async (req, res) => {
    try {
        const idVal = req.params.id;
        await Product.findByIdAndUpdate(idVal, { isDeleted: false });
        res.redirect('/admin/productlist');
    } catch (error) {
        console.log(error.message);
    }
};



module.exports = {
    loginload,
    homeload,
    handleLogout,
    dashboardload,
    userlistload,
    userBlockUnblock,
    catlistload,
    createCategory,
    addNewCategory,
    prodlistload,
    createProduct,
    addNewProduct,
    editCategory,
    editProductPageload,
    editProduct,
    listProduct,
    unlistProduct,
    listCategory,
    unlistCategory,
    editCategoryPageLoad
}