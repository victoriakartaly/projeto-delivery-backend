import mongoose from 'mongoose';


const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
 
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    
    
    items: [orderItemSchema], 
    
    
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_preparation', 'ready_for_delivery', 'on_the_way', 'delivered', 'cancelled'],
        default: 'pending',
    },
    
    totalPrice: { type: Number, required: true, default: 0.0 },
    
    
    paymentMethod: {
        type: String,
        enum: ['card', 'pix', 'cash'],
        required: true,
    },
    
    deliveryAddress: { type: String, required: true },

}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
