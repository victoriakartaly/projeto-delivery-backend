import Order from '../models/order.model.js';
import mongoose from 'mongoose'; 


export const getDailyTransactions = async (req, res) => {
    try {
        
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0); 

        
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999); 

        
        const validStatuses = ['accepted', 'in_preparation', 'ready_for_delivery', 'on_the_way', 'delivered'];

        
        const result = await Order.aggregate([
            {
                
                $match: {
                    createdAt: { $gte: startOfToday, $lte: endOfToday },
                    status: { $in: validStatuses }
                }
            },
            {
                
                $group: {
                    _id: null, 
                    totalValue: { $sum: '$totalPrice' }
                }
            }
        ]);

        
        const totalTransactions = result.length > 0 ? result[0].totalValue : 0.0;

        res.status(200).json({
            success: true,
            message: "Transações diárias calculadas com sucesso.",
            data: { 
                value: totalTransactions,
                date: startOfToday.toISOString().split('T')[0] 
            }
        });

    } catch (error) {
        console.error('Erro ao calcular transações diárias (Admin):', error);
        res.status(500).json({
            success: false,
            message: 'Falha no servidor ao calcular as transações.',
            details: error.message
        });
    }
};


export const getRestaurantAnalyticsToday = async (req, res) => {
    
    
    const restaurantId = req.user.restaurantId;
    
    if (!restaurantId) {
        return res.status(403).json({ 
            message: 'Usuário não vinculado a um restaurante. Não é possível gerar analytics.' 
        });
    }

   
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); 
    
    try {
       
        const restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);

       
        const analytics = await Order.aggregate([
            {
                
                $match: {
                    restaurant: restaurantObjectId,
                    createdAt: { $gte: startOfToday }
                }
            },
            {
                
                $group: {
                    _id: null, 
                    totalOrders: { $sum: 1 }, 
                    
                    
                    totalRevenue: { 
                        $sum: { 
                            $cond: [
                                { $ne: ["$status", "cancelled"] }, 
                                "$totalPrice", 
                                0 
                            ] 
                        } 
                    }, 
                    
                    clientIds: { $addToSet: '$client' } 
                }
            },
            {
                
                $project: {
                    _id: 0,
                    totalOrders: 1,
                    totalRevenue: { $ifNull: ["$totalRevenue", 0] }, 
                    totalClients: { $size: '$clientIds' } 
                }
            }
        ]);

       
        const result = analytics.length > 0 ? analytics[0] : { totalOrders: 0, totalRevenue: 0, totalClients: 0 };

        res.status(200).json({
            status: 'success',
            data: result
        });

    } catch (error) {
        console.error("Erro ao buscar analytics (Restaurante):", error);
        res.status(500).json({ message: 'Erro ao buscar dados de analytics.' });
    }
};