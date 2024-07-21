import { User } from "../models/models.js";


document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        verifyUser(email, password)
            .then(userData => {
                localStorage.setItem('user', JSON.stringify(userData));
                console.log(userData);
                window.location.href = '../home-page/home.html'; 
            })
            .catch(error => {
                alert(`Erro ao fazer login: ${error.message}`);
            });
    });

    async function verifyUser(email, password) {
        const firebaseUrl = `https://web-1-un2-2e85b-default-rtdb.firebaseio.com/users.json`;

        const response = await fetch(firebaseUrl);
        if (!response.ok) {
            throw new Error('Erro ao buscar usuários.');
        }
        const usersData = await response.json();
        
        for (let key in usersData) {
            const user = usersData[key];
            
            if (user.email === email && user.password === password) {
                return { id: key, ...user }; 
            }
        }
        throw new Error('Usuário ou senha inválidos.');
    }
});
