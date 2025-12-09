import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    
    imageUrl: { 
        type: String,
        required: false  
    },

    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    
    isAvailable: { 
        type: Boolean, 
        default: true 
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
