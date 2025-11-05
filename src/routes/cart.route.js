import express from "express";
import { createCartItem, getCartItems } from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", getCartItems);
router.post("/", createCartItem);

export default router;
