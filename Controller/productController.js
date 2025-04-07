import { Product } from '../Schema/schema.js';
import mongoose from 'mongoose';


const processExpDate = (date) => {
    if (typeof date === 'string' && date.includes('/')) {
        const [day, month, year] = date.split('/');
        return new Date(`${year}-${month}-${day}`);
    }
    return date;
};

export const addProduct = async (req, res) => {
    try {
        const { category, name, ExpDate, Quant, OnePrice } = req.body;

        const product = await Product.create({
            category,
            name,
            ExpDate: processExpDate(ExpDate),
            Quant: Quant || 0,
            OnePrice,
            user: req.user._id
        });

        const productResponse = product.toObject();
        delete productResponse.__v;
        delete productResponse.user;

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: productResponse
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        console.log("User making request:", req.user._id);

        const products = await Product.find({ 
            user: new mongoose.Types.ObjectId(req.user._id) 
        })
        .select('-__v -user')
        .sort({ createdAt: -1 });

        console.log("Products found:", products.length);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        console.error("In getAllProducts:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            user: req.user._id
        }).select('-__v');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or unauthorized"
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const updatedData = { ...req.body };
        
        if (updatedData.ExpDate) {
            updatedData.ExpDate = processExpDate(updatedData.ExpDate);
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            updatedData,
            { new: true, runValidators: true }
        ).select('-__v');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or unauthorized"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or unauthorized"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getProductsByUser = async (req, res) => {
    try {
        const products = await Product.find({ user: req.params.userId })
            .select('-__v')
            .populate('user', 'Email Username -_id');

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};