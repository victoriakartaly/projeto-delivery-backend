import Order from '../models/order.model.js'; 
import Restaurant from '../models/restaurant.model.js'; 
import Product from '../models/product.model.js'; 

/**
 * @desc Cliente cria um novo pedido.
 * @route POST /api/v1/orders
 * @access Private (client)
 */
export const createOrder = async (req, res) => {
    try {
        const { restaurantId, items, paymentMethod, deliveryAddress, totalAmount } = req.body;
        const clientId = req.user.id; // ID do cliente vem do token JWT

        // 1. Validação
        if (!restaurantId || !items || items.length === 0 || !paymentMethod || !totalAmount) {
            return res.status(400).json({ success: false, message: 'Dados do pedido incompletos.' });
        }

      
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurante não encontrado.' });
        }

        const newOrder = await Order.create({
            client: clientId,
            restaurant: restaurantId,
            items,
            totalAmount,
            paymentMethod,
            deliveryAddress: deliveryAddress || restaurant.address, // Usa o endereço padrão do restaurante se não for fornecido um novo
            status: 'Pedido Aceito' // Status inicial
        });


        res.status(201).json({
            success: true,
            message: 'Pedido criado com sucesso! Aguardando confirmação do restaurante.',
            data: newOrder
        });

    } catch (error) {
        console.error('Erro ao criar pedido:', error.message);
        res.status(500).json({ success: false, message: 'Falha no servidor ao criar o pedido.', error: error.message });
    }
};

/**
 * @desc Restaurante lista todos os pedidos pendentes (ou todos)
 * @route GET /api/v1/orders
 * @access Private (restaurant)
 */
export const listRestaurantOrders = async (req, res) => {
    try {
        const restaurantId = req.user.id; // ID do restaurante vem do token JWT

        const orders = await Order.find({
            restaurant: restaurantId,
            // O restaurante pode listar pedidos com status que não sejam 'Entregue'
            status: { $ne: 'Entregue' } 
        })
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

/**
 * @desc Restaurante aceita, recusa ou atualiza o status de um pedido.
 * @route PATCH /api/v1/orders/:id/status
 * @access Private (restaurant)
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const restaurantId = req.user.id;

        const validStatuses = ['Pedido Aceito', 'Em Preparação', 'Pronto para Entrega', 'A Caminho', 'Entregue', 'Cancelado (Pelo Restaurante)'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Status inválido. Status permitidos: ${validStatuses.join(', ')}` });
        }

        const order = await Order.findOne({ _id: id, restaurant: restaurantId });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Pedido não encontrado ou não pertence a este restaurante.' });
        }
        
        order.status = status;
        await order.save();


        res.status(200).json({
            success: true,
            message: `Status do pedido ${id} atualizado para ${status}.`,
            data: order
        });

    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error.message);
        res.status(500).json({ success: false, message: 'Falha no servidor ao atualizar o status.', error: error.message });
    }
};

/**
 * @desc Cliente acompanha o status de um pedido (Requisito: tempo real)
 * @route GET /api/v1/orders/:id/status
 * @access Private (client)
 */
export const getOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = req.user.id;

        const order = await Order.findOne({ _id: id, client: clientId }).select('status restaurant totalAmount items');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Pedido não encontrado ou não pertence a este cliente.' });
        }
        
        res.status(200).json({
            success: true,
            status: order.status,
            data: order
        });

    } catch (error) {
        console.error('Erro ao buscar status do pedido:', error.message);
        res.status(500).json({ success: false, message: 'Falha no servidor ao buscar status do pedido.', error: error.message });
    }
};
