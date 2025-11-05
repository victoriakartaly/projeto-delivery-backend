import bcrypt from 'bcryptjs';

const passwordToHash = "delivery_admin1412"; 
const saltRounds = 10;

bcrypt.hash(passwordToHash, saltRounds, function(err, hash) {
    if (err) {
        console.error("Erro ao gerar hash:", err);
        return;
    }
    console.log("Senha Original:", passwordToHash);
    console.log("Hash Gerado (Copie este):", hash);
});