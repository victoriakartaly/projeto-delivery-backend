import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    // Visualizar com fotos
    imageUrl: { type: String }, 
    
    // Relacionamento com o restaurante
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    
    isAvailable: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
