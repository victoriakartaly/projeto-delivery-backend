import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    // Campos Comuns para todos os Usuários
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },

    // Perfil de Acesso ( Clientes, Restaurantes, Administradores, Funcionários)
    role: {
        type: String,
        enum: ['client', 'restaurant', 'admin', 'employee'],
        default: 'client'
    },

    // Detalhes Específicos do Restaurante 
    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant', 
        required: function() { return this.role === 'restaurant'; }
    },
    
    // Detalhes Específicos do Funcionário/Admin 
    cpf: { type: String, required: function() { return this.role === 'employee' || this.role === 'admin'; } },
    jobTitle: { type: String, required: function() { return this.role === 'employee' || this.role === 'admin'; } },
    sector: { type: String, required: function() { return this.role === 'employee' || this.role === 'admin'; } },
    photo: { type: String }, // URL da foto
    
}, {
    timestamps: true // Adiciona 'createdAt' e 'updatedAt'
});

// Middleware Mongoose para HASH de Senha antes de salvar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar a senha fornecida com a senha hash
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
