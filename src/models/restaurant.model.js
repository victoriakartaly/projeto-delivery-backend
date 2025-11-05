import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    //  Buscar por localização (endereço é mais completo)
    address: { type: String, required: true },
    //  Buscar por categoria (Pizzaria, Hamburgueria)
    category: { type: String, required: true }, 
    
    // Referência ao dono (User com role 'restaurant')
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Para simplificar a exibição na busca
    rating: { type: Number, default: 0 }, 
    
    // Status do restaurante (aberto/fechado)
    isOpen: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
