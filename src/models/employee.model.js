import mongoose from 'mongoose';
import User from './user.model.js';

// Define o esquema específico para o Funcionário (Employee)
// Ele inclui campos adicionais para identificação e associação com um restaurante.
const EmployeeSchema = new mongoose.Schema({
    // Campos específicos do Funcionário
    name: {
        type: String,
        required: [true, 'O nome do funcionário é obrigatório'],
        trim: true,
    },
    phoneNumber: {
        type: String,
        match: [/^\d{8,15}$/, 'Por favor, use um formato de telefone válido'],
        required: false,
    },
    // Chave estrangeira que associa o funcionário a um restaurante específico
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant', // Referencia o modelo Restaurant
        required: [true, 'O funcionário deve estar associado a um restaurante'],
    },
   
    role: {
        type: String,
        default: 'employee',
        enum: ['employee'],
    },
    // Campos herdados de User (email, senha) são adicionados automaticamente
}, { 
    discriminatorKey: 'role', 
    timestamps: true 
});

// Cria o modelo Employee como um 'discriminator' do modelo User.
// Isso permite que o Employee herde o comportamento e os campos do User (incluindo email e senha).
const Employee = User.discriminator('Employee', EmployeeSchema);

export default Employee;