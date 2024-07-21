import { Stock, Transaction, Position, TipoTransacao } from "../models/models.js";
import { buildTransacao, checkPosicao, formatter, saveTransacao } from "../utils/utils.js";

let user = JSON.parse(localStorage.getItem('user'));
const btnVender = document.querySelector('.btn-vender');
const quantidadeInput = document.getElementById('quantidade');
const precoSpan = document.getElementById('preco')
const valorTotalEstimadoSpan = document.getElementById('valor-total-estimado');
const limiteDisponivelSpan = document.getElementById('limite-disponivel');
const saldoProjetadoSpan = document.getElementById('saldo-projetado');
let tickerSelect = document.getElementById('ticker-select')

document.addEventListener('DOMContentLoaded', () => {

    fetchTickers()
    .then(tickers => {
        renderTickers(tickers)
    })

    tickerSelect.addEventListener('change', function() {
        const ticker = this.value;
        const url = `https://yahoo-finance127.p.rapidapi.com/price/${ticker}`;
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': '7bd6b6f80fmsha685cb1edf6ca91p156100jsn090b67a68c9e',
                'x-rapidapi-host': 'yahoo-finance127.p.rapidapi.com'
            }
        };

        fetch(url, options)
            .then(response => response.json())
            .then(data => {
                const preco = data.regularMarketPrice.raw;
                //const preco = '210';
                precoSpan.textContent = formatter.format(preco);
                precoSpan.value = preco
            })
            .catch(error => {
                console.error('Erro ao buscar o preço:', error);
            });
    })


    quantidadeInput.addEventListener('input', () => {
        const quantidade = parseFloat(quantidadeInput.value.replace(',', '.'));
        const precoUnitario = parseFloat(precoSpan.value);
        
        const valorTotalEstimado = precoUnitario * quantidade;
        const limiteDisponivel = user.saldo * 2;
        const saldoProjetado = user.saldo + valorTotalEstimado; 

        valorTotalEstimadoSpan.textContent = formatter.format(valorTotalEstimado);
        limiteDisponivelSpan.textContent = formatter.format(limiteDisponivel);
        saldoProjetadoSpan.textContent = formatter.format(saldoProjetado);
    });


    btnVender.addEventListener('click', () => {
        const quantidade = parseInt(quantidadeInput.value);
        const preco = parseFloat(precoSpan.value);
        try {
            validateSell(quantidade, preco)

            const stock = new Stock({
                ticker: tickerSelect.value,
                preco: preco
            })
            const transaction = buildTransacao(stock, quantidade, TipoTransacao.VENDA)
    
            checkPosicao(transaction, user)
            .then(() => saveTransacao(transaction))
            .then(() =>{
                window.location.href = '../home-page/home.html';
            })
            .catch(error => {
                console.error('Erro ao salvar transação ou atualizar informações do usuário:', error);
            });
        } catch (error) {
            console.error('Erro ao validar venda:', error);
        }
    });

})




function validateSell(quantidade, preco){
    if (quantidade <= 0) {
        throw new Error('Quantidade inválida. Insira um valor válido maior que zero.');
    }
    if (preco <= 0) {
        throw new Error('Preço inválido. Insira um valor válido maior que zero.');
    }
}

async function fetchTickers(){                                                          
    return fetch(`https://web-1-un2-2e85b-default-rtdb.firebaseio.com/users/${user.id}/positions.json`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Resposta de rede não foi ok');
        }
        return response.json();
    })
    .then(positions => {
        const tickersList = [];
        for (let key in positions) {
            tickersList.push(positions[key].stock);
        }
        return tickersList;
    });
}

function renderTickers(stocks){
    stocks.forEach(stock => {
        const option = document.createElement('option');
        option.value = String(stock.ticker).toUpperCase()
        option.textContent = String(stock.ticker).toUpperCase()
        tickerSelect.appendChild(option);
    });
}