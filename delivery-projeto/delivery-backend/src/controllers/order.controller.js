import Order from '../models/order.model.js'; 
import Restaurant from '../models/restaurant.model.js'; 
import Product from '../models/product.model.js'; 
import mongoose from 'mongoose';

export const createOrder = async (req, res) => {
    try {
        const { 
            restaurantId, 
            items, 
            paymentMethod, 
            shippingAddress, 
            deliveryFee = 0 
        } = req.body;

        const clientId = req.user.id; 

        
        if (!restaurantId || !items || items.length === 0 || !paymentMethod || !shippingAddress) {
            return res.status(400).json({ 
                success: false, 
                message: 'Dados do pedido (restaurante, itens, endereço ou método de pagamento) incompletos.' 
            });
        }
        if (typeof shippingAddress !== 'object' || !shippingAddress.street || !shippingAddress.number) {
            return res.status(400).json({ success: false, message: 'Estrutura do endereço de entrega inválida.' });
        }

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurante não encontrado.' });
        }
        
        
        let calculatedTotal = 0;
        
        
        const itemIds = items.map(item => item.productId); 
        
        
        const products = await Product.find({ _id: { $in: itemIds }, restaurant: restaurantId });

        if (products.length !== itemIds.length) {
            return res.status(400).json({ success: false, message: 'Um ou mais produtos não foram encontrados no restaurante.' });
        }
        
        
        const validatedItems = items.map(item => {
            
            const productData = products.find(p => p._id.toString() === item.productId.toString());
            
            if (!productData) {
                throw new Error("Produto inválido após a busca inicial.");
            }
            
            
            const itemSubtotal = productData.price * item.quantity;
            calculatedTotal += itemSubtotal;
            
            return {
                
                product: item.productId, 
                
                
                productId: item.productId,
                
                
                price: productData.price, 
                
                
                totalPrice: itemSubtotal, 

                quantity: item.quantity,
                priceAtOrder: productData.price, 
                name: productData.name 
            };
        });

        
        const finalTotal = calculatedTotal + deliveryFee;

        const newOrder = await Order.create({
            client: clientId,
            restaurant: restaurantId,
            items: validatedItems, 
            totalPrice: finalTotal, 
            deliveryFee: deliveryFee, 
            paymentMethod,
            deliveryAddress: shippingAddress, 
            status: 'pending' 
        });

        res.status(201).json({
            success: true,
            message: 'Pedido criado com sucesso! Aguardando confirmação do restaurante.',
            data: newOrder
        });

    } catch (error) {
        console.error('Erro ao criar pedido:', error.message);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Erro de validação de dados no Mongoose.', 
                error: error.message 
            });
        }
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'ID de Restaurante ou Produto com formato inválido.' });
        }
        
        res.status(500).json({ success: false, message: 'Falha no servidor ao criar o pedido.', error: error.message });
    }
};


export const listRestaurantOrders = async (req, res) => {
    try {
        const { status } = req.query; 
        const user = req.user; 
        
        let restaurantIdToFilter = user.restaurantId; 

        
        if (user.role === 'restaurant' && !restaurantIdToFilter) {
            const restaurantEntity = await Restaurant.findOne({ owner: user.id }).select('_id');
            if (restaurantEntity) {
                 restaurantIdToFilter = restaurantEntity._id;
            }
        }
        
        if (!restaurantIdToFilter) {
            
            return res.status(404).json({ success: false, message: 'Entidade Restaurante não encontrada ou não associada a este usuário.' });
        }
        
        let query = { restaurant: restaurantIdToFilter };

        
        if (status) {
            query.status = status.toLowerCase(); 
        } else {
             
            query.status = { $nin: ['delivered', 'cancelled'] }; 
        }

        const orders = await Order.find(query)
        .populate('client', 'name email') 
        .sort({ createdAt: -1 }); 

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('Erro ao listar pedidos do restaurante:', error.message);
        res.status(500).json({ success: false, message: 'Falha no servidor ao listar pedidos.', error: error.message });
    }
};


export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = req.user; 
        
        let restaurantIdToFilter = user.restaurantId;

        
        if (user.role === 'restaurant' && !restaurantIdToFilter) {
            const restaurantEntity = await Restaurant.findOne({ owner: user.id }).select('_id');
            if (restaurantEntity) {
                 restaurantIdToFilter = restaurantEntity._id;
            }
        }

        if (!restaurantIdToFilter) {
             return res.status(403).json({ success: false, message: 'Acesso negado. Nenhuma entidade restaurante encontrada para este usuário.' });
        }
        
        const validStatuses = ['pending', 'accepted', 'in_preparation', 'ready_for_delivery', 'on_the_way', 'delivered', 'cancelled'];

        if (!status || !validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({ success: false, message: `Status inválido. Status permitidos: ${validStatuses.join(', ')}` });
        }
        
        const newStatus = status.toLowerCase(); 
        
        
        const order = await Order.findOne({ 
            _id: id, 
            restaurant: restaurantIdToFilter 
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Pedido não encontrado ou não pertence a este restaurante.' });
        }
        
        

        order.status = newStatus;
        await order.save();

        res.status(200).json({
            success: true,
            message: `Status do pedido ${id} atualizado para ${newStatus}.`,
            data: order
        });

    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error.message);
        res.status(500).json({ success: false, message: 'Falha no servidor ao atualizar o status.', error: error.message });
    }
};


export const getOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = req.user.id;

        const order = await Order.findOne({ _id: id, client: clientId })
            
            .select('status restaurant totalPrice deliveryFee items deliveryAddress createdAt') 
            .populate('restaurant', 'name phone'); 

        if (!order) {
            return res.status(404).json({ success: false, message: 'Pedido não encontrado ou não pertence a este cliente.' });
        }
        
        
        res.status(200).json({
            success: true,
            data: order 
        });

    } catch (error) {
        console.error('Erro ao buscar status do pedido:', error.message);
        res.status(500).json({ success: false, message: 'Falha no servidor ao buscar status do pedido.', error: error.message });
    }
};


export const listClientOrders = async (req, res) => {
    try {
        const clientId = req.user.id; 

        const orders = await Order.find({ client: clientId })
            .populate('restaurant', 'name address') 
            .sort({ createdAt: -1 }); 

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('Erro ao listar pedidos do cliente:', error.message);
        res.status(500).json({ success: false, message: 'Falha no servidor ao listar pedidos.', error: error.message });
    }
};


export const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        let query = { _id: id };

        
        if (user.role === 'client') {
            query.client = user.id;
        } else if (user.role === 'restaurant' || user.role === 'employee') {
            let restaurantIdToFilter = user.restaurantId;
             
            if (user.role === 'restaurant' && !restaurantIdToFilter) {
                const restaurantEntity = await Restaurant.findOne({ owner: user.id }).select('_id');
                if (restaurantEntity) {
                    restaurantIdToFilter = restaurantEntity._id;
                }
            }
            if (!restaurantIdToFilter) {
                 return res.status(403).json({ success: false, message: 'Acesso negado. Nenhuma associação de restaurante encontrada.' });
            }
            query.restaurant = restaurantIdToFilter;
        } else if (user.role !== 'admin') {
            
             return res.status(403).json({ success: false, message: 'Acesso negado.' });
        }


        const order = await Order.findOne(query)
            .populate('client', 'name email')
            .populate('restaurant', 'name address phone');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Pedido não encontrado ou acesso negado.' });
        }

        res.status(200).json({ success: true, data: order });

    } catch (error) {
        console.error('Erro ao obter detalhes do pedido:', error.message);
        
        res.status(500).json({ success: false, message: 'Falha no servidor ao obter detalhes do pedido.', error: error.message });
    }
};