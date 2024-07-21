import { User } from "../models/models.js";

document.addEventListener("DOMContentLoaded", function() {
  const firebaseURL = 'https://web-1-un2-2e85b-default-rtdb.firebaseio.com'; 

  $(document).ready(function(){
      $("#cpf").inputmask("999.999.999-99");
  });

  document.getElementById('cadastro-form').addEventListener('submit', function(event) {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const cpf = document.getElementById('cpf').value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

      validateAndRegister(email, password, cpf);
  });

async function validateAndRegister(email, password, cpf) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = '';

    try {
        const users = await getUsers();

        const cpfExists = users.some(user => user.cpf === cpf);
        if (cpfExists) {
              messageDiv.innerHTML = 'Erro: CPF já cadastrado.';
              return;
        }

        const emailExists = users.some(user => user.email === email);
        if (emailExists) {
              messageDiv.innerHTML = 'Erro: Email já cadastrado.';
              return;
        }

          
        const user = new User({
            email: email,
            password: password,
            cpf: cpf,
            saldo: 0,
            totalInvestido: 0
        }) 

        addUser(user)
        .then(()=>{
            window.location.href = '../login-page/login.html';
        })
    } catch (error) {
        messageDiv.innerHTML = 'Erro: ' + error.message;
    }
}

  async function getUsers() {
      const response = await fetch(`${firebaseURL}/users.json`);
      if (!response.ok) {
          throw new Error('Resposta de rede não foi ok');
      }
      const usersData = await response.json();
      return usersData ? Object.values(usersData) : [];
  }

    function addUser(user) {
      return fetch(`${firebaseURL}/users.json`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
      })
      .then(response => {
        if (!response.ok) {
            throw new Error('Resposta de rede não foi ok');
        }
    });
  }

});