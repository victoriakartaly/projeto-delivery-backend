import express from "express";
import { protect, authorize } from '../middlewares/auth.middleware.js'; 
import { addToCart, getCart, removeFromCart, checkout } from "../controllers/cart.controller.js"; 

const router = express.Router();


router.use(protect); 
router.use(authorize('client')); 


router.get("/", getCart); 


router.post("/", addToCart); 


router.route('/remove/:itemId')
    .delete(removeFromCart); 

router.route('/checkout')
    .post(checkout);       

export default router;