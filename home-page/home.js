import { Position, User, Transaction } from "../models/models.js";
import { formatter } from "../utils/utils.js";
let userJson;

document.addEventListener("DOMContentLoaded", function() {
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);


    getUserById(user.id)
    .then(user => {
        return fetchPositions(user).then(positions => {
            return { user, positions }
        })
    })
    .then(({ user, positions }) => {
        renderPositions(positions, user);
    })
    .catch(error => {
        console.error('Houve um problema ao recuperar posicoes:', error);
    });

});




 async function getUserById(userId) {
    const firebaseUrl = `https://web-1-un2-2e85b-default-rtdb.firebaseio.com/users/${userId}.json`;

    try {
        const response = await fetch(firebaseUrl);

        if (!response.ok) {
            throw new Error('Erro ao buscar usuário.');
        }

        const userData = await response.json();

        if (!userData) {
            throw new Error('Usuário não encontrado.');
        }

        
        const user = new User({
            id: userId,
            email: userData.email,
            password: userData.password,
            cpf: userData.cpf,
            saldo: userData.saldo,
            totalInvestido: userData.totalInvestido //soma dos investimentos e saldo
            
        });
        userJson = JSON.stringify(user);
        localStorage.setItem('user', userJson);

        return user;
    } catch (error) {
        console.error('Erro ao recuperar usuário:', error);
        throw error;
    }
}


function fetchPositions(user){                                                          
    return fetch(`https://web-1-un2-2e85b-default-rtdb.firebaseio.com/users/${user.id}/positions.json`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Resposta de rede não foi ok');
        }
        return response.json();
    })
    .then(positions => {
        const positionsList = [];
        for (let key in positions) {
            const position = new Position({
                id: key, 
                stock: positions[key].stock,
                quantidadeTotal: positions[key].quantidadeTotal,
                precoMedio: positions[key].precoMedio,
                totalPosicao: positions[key].totalPosicao
            });
            
            positionsList.push(position);
        }
        return positionsList;
    });
}


function renderPositions(positions, user) {
    const mainSection = document.querySelector('.main-section');

    const totalInvestidoTotalH2 = document.createElement('h2');
    totalInvestidoTotalH2.innerHTML = `TOTAL INVESTIDO <b class="orange">${formatter.format(user.totalInvestido)}</b>`;
    mainSection.appendChild(totalInvestidoTotalH2);

    const saldoContaH2 = document.createElement('h2');
    saldoContaH2.textContent = `SALDO EM CONTA ${formatter.format(user.saldo)}`;
    mainSection.appendChild(saldoContaH2);

    const tableBody = document.querySelector('#portfolio-table tbody');
    tableBody.innerHTML = '';
    positions.forEach(position => {
        tableBody.appendChild(createPositionCard(position)) 
    });
}

function createPositionCard(position) {
    const positionCard = document.createElement('tr');
    positionCard.classList.add('nav-item');

    const acaoTicker = document.createElement('td');
    acaoTicker.textContent = position.stock.ticker

    const quantidade = document.createElement('td');
    quantidade.textContent = position.quantidadeTotal;

    const precoMedio = document.createElement('td');
    precoMedio.textContent = formatter.format(position.precoMedio)

    const total = document.createElement('td');
    total.textContent = formatter.format(position.totalPosicao)


    positionCard.appendChild(acaoTicker)
    positionCard.appendChild(quantidade)
    positionCard.appendChild(precoMedio)
    positionCard.appendChild(total)

    return positionCard
}