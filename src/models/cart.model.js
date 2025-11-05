import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  product: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
