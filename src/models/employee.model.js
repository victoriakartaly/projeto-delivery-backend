import mongoose from 'mongoose';
import User from './user.model.js';


const EmployeeSchema = new mongoose.Schema({
    
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
    
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant', 
        required: [true, 'O funcionário deve estar associado a um restaurante'],
    },
   
    role: {
        type: String,
        default: 'employee',
        enum: ['employee'],
    },
    
}, { 
    discriminatorKey: 'role', 
    timestamps: true 
});


const Employee = User.discriminator('Employee', EmployeeSchema);

export default Employee;
