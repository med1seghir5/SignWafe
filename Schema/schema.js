import mongoose from "mongoose";

const { Schema } = mongoose;

const UsersSchema = new Schema({
    Email: {
        type: String,
        required: [true, "Please enter a Email"],
        unique: true
    },
    Username: {
        type: String,
        required: [true, "Please enter a Username"],
        unique: true
    },
    Password: {
        type: String,
        required: true,
        minlength: [5, "Password contains more than 5 characters"],
    }
})

export const Users = mongoose.model("Users", UsersSchema)

const ProductSchema = new Schema({
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: ["Medicament", "Medical Equipment", "Other"]
    },
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true
    },
    AriDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    ExpDate: {
        type: Date,
        required: [true, "Expiration date is required"],
        validate: {
            validator: function(v) {
                if (typeof v === 'string' && v.includes('/')) {
                    const [day, month, year] = v.split('/');
                    v = new Date(`${year}-${month}-${day}`);
                }
                return v > new Date();
            },
            message: props => 
                `Expiration date (${props.value}) must be in the future and in DD/MM/YYYY format`
        }
    },
    Quant: {
        type: Number,
        default: 0,
        min: [0, "Quantity can't be negative"]
    },
    OnePrice: {
        type: Number,
        required: [true, "Price is required"],
        min: [0.01, "Price must be positive"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        immutable: true
    }
}, { timestamps: true });

export const Product = mongoose.model('ProductSchema', ProductSchema);
