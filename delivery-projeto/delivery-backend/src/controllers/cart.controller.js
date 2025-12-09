import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js"; 
import Order from "../models/order.model.js"; 
import mongoose from "mongoose";


const getProductDetails = async (productId) => {
   
    const product = await Product.findById(productId).select('price restaurant');

    if (!product) {
        throw new Error('Produto não encontrado.');
    }
    
    return { 
        priceAtOrder: product.price, 
        restaurantId: product.restaurant 
    };
};


const calculateCartTotal = (cart) => {
    return cart.items.reduce((total, item) => {
        
        return total + (item.priceAtOrder * item.quantity); 
    }, 0);
};


export const addToCart = async (req, res) => {
    const userId = req.user._id; 
    const { productId, quantity = 1 } = req.body; 

    if (!productId || typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: "Dados inválidos: ID do produto ou quantidade." });
    }

    try {
        
        const { priceAtOrder, restaurantId } = await getProductDetails(productId);
        
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            
            cart = new Cart({
                user: userId,
                restaurant: restaurantId,
                items: [{ product: productId, quantity, priceAtOrder }]
            });
        } else {
            
            if (cart.restaurant.toString() !== restaurantId.toString()) {
                return res.status(400).json({ 
                    message: "Não é possível adicionar itens de restaurantes diferentes no mesmo carrinho." 
                });
            }

            
            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId.toString()
            );

            if (itemIndex > -1) {
                
                cart.items[itemIndex].quantity += quantity;
            } else {
                
                cart.items.push({ product: productId, quantity, priceAtOrder });
            }
        }

        
        cart.totalAmount = calculateCartTotal(cart);
        await cart.save();

        res.status(200).json({ message: "Item adicionado/atualizado.", cart });
        
    } catch (error) {
        console.error("Erro ao adicionar item ao carrinho:", error);
        res.status(500).json({ message: error.message || "Erro interno do servidor." });
    }
};




export const getCart = async (req, res) => {
    const userId = req.user._id;

    try {
        
        const cart = await Cart.findOne({ user: userId })
            .populate({
                path: 'items.product',
                select: 'name description imageUrl' 
            })
            .populate('restaurant', 'name'); 

        if (!cart) {
            
            return res.status(200).json({ message: "Carrinho vazio.", items: [], totalAmount: 0 });
        }
        
        res.json(cart);

    } catch (error) {
        console.error("Erro ao buscar carrinho:", error);
        res.status(500).json({ message: "Erro ao buscar carrinho.", error });
    }
};




export const removeFromCart = async (req, res) => {
    const userId = req.user._id;
    const itemId = req.params.itemId; 

    try {
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "Carrinho não encontrado." });
        }

        
        cart.items.pull({ _id: itemId }); 

        
        cart.totalAmount = calculateCartTotal(cart);
        
        
        if (cart.items.length === 0) {
            await Cart.findByIdAndDelete(cart._id);
            return res.status(200).json({ message: "Carrinho vazio e deletado.", cart: null });
        }

        await cart.save();
        res.status(200).json({ message: "Item removido com sucesso.", cart });

    } catch (error) {
        console.error("Erro ao remover item do carrinho:", error);
        res.status(500).json({ message: "Erro ao remover item do carrinho." });
    }
};




export const checkout = async (req, res) => {
    const userId = req.user._id;
    
    const { deliveryAddress, paymentMethod } = req.body; 

    try {
        const cart = await Cart.findOne({ user: userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Carrinho vazio. Adicione itens antes de finalizar." });
        }
        
        
        const order = await Order.create({
            user: userId,
            restaurant: cart.restaurant,
            
            orderItems: cart.items.map(item => ({ 
                product: item.product,
                quantity: item.quantity,
                price: item.priceAtOrder 
            })),
            totalPrice: cart.totalAmount,
            
            deliveryAddress: deliveryAddress || 'Endereço não fornecido', 
            paymentMethod: paymentMethod || 'Dinheiro', 
            status: 'Pending' 
        });

        
        await Cart.findByIdAndDelete(cart._id);

        res.status(201).json({ 
            message: "Pedido finalizado com sucesso.", 
            orderId: order._id,
            order 
        });

    } catch (error) {
        console.error("Erro no checkout:", error);
        res.status(500).json({ message: "Erro ao finalizar pedido.", error });
    }
};