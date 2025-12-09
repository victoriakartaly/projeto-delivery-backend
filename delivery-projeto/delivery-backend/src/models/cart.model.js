import mongoose from "mongoose";


const cartItemSchema = new mongoose.Schema({
    
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    
    priceAtOrder: { 
        type: Number, 
        required: true 
    },
    notes: { 
        type: String, 
        trim: true,
        maxlength: 200 
    }
}, { _id: false }); 


const cartSchema = new mongoose.Schema({
    
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true 
    },
    
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    
    items: [cartItemSchema],

    
    totalAmount: { 
        type: Number, 
        required: true, 
        default: 0 
    }
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;