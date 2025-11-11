import Cart from "../models/cart.model.js";

export const createCartItem = async (req, res) => {
  try {
    const { product, quantity, price } = req.body;
    const newItem = await Cart.create({ product, quantity, price });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar item", error });
  }
};

export const getCartItems = async (req, res) => {
  try {
    const items = await Cart.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar itens", error });
  }
};
