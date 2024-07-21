import { Stock, Transaction, Position, TipoTransacao } from "../models/models.js";
import { formatter, dateFormatter } from "../utils/utils.js";

let user = JSON.parse(localStorage.getItem('user'));
const filtroForm = document.getElementById('filtro-form')


document.addEventListener("DOMContentLoaded", function() {
    
    const mainSection = document.querySelector('.info');
    const saldoContaH2 = document.createElement('span');
    saldoContaH2.innerHTML = `<b class="green">${formatter.format(user.saldo)}`;
    mainSection.appendChild(saldoContaH2);

    fetchTransactions()
    .then(transactions => {
        renderTransactions(transactions)
    })
    .catch(error => {
        console.error('Houve um problema ao recuperar transacaoes:', error);
    });
});




filtroForm.addEventListener('submit', function() {
    event.preventDefault()
    const periodo = parseInt(document.getElementById('periodo').value);
    const operacao = document.getElementById('operacao').value;
    const hoje = new Date();
    const dataInicio = new Date(hoje);
    dataInicio.setDate(hoje.getDate() - periodo);

    fetchTransactions()
    .then(transactions => {
        const filteredTransactions = filterTransactions(transactions, dataInicio, operacao);
        return filteredTransactions;
    })
    .then(filteredTransactions => {
        renderTransactions(filteredTransactions)
    })
    .catch(error => {
        console.error('Houve um problema ao recuperar transacaoes:', error);
    });
    
})




function fetchTransactions(){                                                          
    return fetch(`https://web-1-un2-2e85b-default-rtdb.firebaseio.com/users/${user.id}/transactions.json`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Resposta de rede não foi ok');
        }
        return response.json();
    })
    .then(transactions => {
        const transactionsList = [];
        for (let key in transactions) {
            const transaction = new Transaction({
                id: key, 
                stock: transactions[key].stock,
                quantidade: transactions[key].quantidade,
                totalTransacao: transactions[key].totalTransacao,
                tipoTransacao: transactions[key].tipoTransacao,
                data: transactions[key].data
            });
            console.log(transaction)
            transactionsList.push(transaction);
        }
        return transactionsList;
    });
}

function filterTransactions(transactions, dataInicio, operacao){
    return transactions.filter(transaction => {
        const dataTransacao = new Date(transaction.data);
        const tipoValido = operacao === 'TODAS' || transaction.tipoTransacao === operacao;

        return dataTransacao >= dataInicio && tipoValido;
    });
}



function renderTransactions(transactions) {
    const tableBody = document.querySelector('.transactions-table tbody');
    tableBody.innerHTML = '';
    transactions.forEach(transaction => {
        tableBody.appendChild(createTransactionCard(transaction)) 
    });
}

function createTransactionCard(transaction) {

    const transactionCard = document.createElement('tr');
    transactionCard.classList.add('nav-item');

    const data = document.createElement('td');
    data.textContent = dateFormatter.format(transaction.data)

    const descricao = document.createElement('td');
    

    const operacao = document.createElement('td');

    const movimentacao = document.createElement('td');

    switch (transaction.tipoTransacao){
        case 'COMPRA': 
        operacao.textContent = 'Débito'
        descricao.textContent = `${transaction.tipoTransacao} - ${transaction.quantidade}x ${formatter.format(transaction.stock.preco)} - ${transaction.stock.ticker}`
        movimentacao.classList.add('red')
        movimentacao.textContent = formatter.format(transaction.totalTransacao)
        break
        case 'VENDA': 
        descricao.textContent = `${transaction.tipoTransacao} - ${transaction.quantidade}x ${formatter.format(transaction.stock.preco)} - ${transaction.stock.ticker}`
        operacao.textContent = 'Crédito'
        movimentacao.classList.add('green')
        movimentacao.textContent = formatter.format(-transaction.totalTransacao)
        break
        case 'DEPOSITO': 
        descricao.textContent = 'Depósito'
        operacao.textContent = 'Crédito'
        movimentacao.classList.add('green')
        movimentacao.textContent = formatter.format(transaction.totalTransacao)
        break
        case 'SAQUE':
        descricao.textContent = 'Saque'
        operacao.textContent = 'Débito'
        movimentacao.classList.add('red')
        movimentacao.textContent = formatter.format(-transaction.totalTransacao)
        break
    }
        
    
    transactionCard.appendChild(data)
    transactionCard.appendChild(descricao)
    transactionCard.appendChild(operacao)
    transactionCard.appendChild(movimentacao)

    return transactionCard
}

