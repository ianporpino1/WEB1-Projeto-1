import { Transaction, TipoTransacao } from "../models/models.js";
import { buildTransacao, checkPosicao, formatter, saveTransacao } from "../utils/utils.js";


const saqueForm = document.getElementById('saque-form')
let user = JSON.parse(localStorage.getItem('user'));
const amountInput = document.getElementById('amount');


saqueForm.addEventListener('submit', function(){
    event.preventDefault()
    amountInput.value = amountInput.value.replace(/[^\d,]/g, '');
    const valor = -(parseFloat(amountInput.value))
    console.log(valor)

    const transaction = buildTransacao(null, valor, TipoTransacao.SAQUE)
    
    try{
        validateSaque(valor)

        saveTransacao(transaction)
        .then(() => saveSaldo(valor))
        .then(() =>{
            window.location.href = '../home-page/home.html';
        })
        .catch(error => {
            console.error('Erro ao salvar transação ou atualizar informações do usuário:', error);
        });

    }catch(error){
        console.log(error.message)
    }
})

function saveSaldo(valor){
    user.saldo += valor
    const data = 
    {
        saldo: user.saldo,

    }
    console.log(data)
    return fetch(`https://web-1-un2-2e85b-default-rtdb.firebaseio.com/users/${user.id}.json`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Resposta de rede não foi ok');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    amountInput.addEventListener('input', function(event) {
        let value = event.target.value;
        
        value = value.replace(/\D/g, '');

        value = value.replace(/(\d)(\d{2})$/, '$1,$2'); 
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); 

        event.target.value = `$${value}`;
    });
});


function validateSaque(value){
    if(value > 0 || value > user.saldo){
        throw Error('valor invalido')
    }
}