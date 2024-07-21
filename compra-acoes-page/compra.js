import { Stock, Transaction, Position, TipoTransacao } from "../models/models.js";
import { buildTransacao, checkPosicao, formatter, saveTransacao } from "../utils/utils.js";

const quantidadeInput = document.getElementById('quantidade');
const valorTotalEstimadoSpan = document.getElementById('valor-total-estimado');
const limiteDisponivelSpan = document.getElementById('limite-disponivel');
const saldoProjetadoSpan = document.getElementById('saldo-projetado');
const precoSpan = document.getElementById('preco')
let user = JSON.parse(localStorage.getItem('user'));
const btnComprar = document.querySelector('.btn-comprar');
let ticker = document.getElementById('ticker')


document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('ticker').addEventListener('change', function() {
        ticker = this.value;
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
    });

    quantidadeInput.addEventListener('input', () => {
        const quantidade = parseFloat(quantidadeInput.value.replace(',', '.'));
        const precoUnitario = parseFloat(precoSpan.value);
   
        const valorTotalEstimado = precoUnitario * quantidade;
        const limiteDisponivel = user.saldo * 2;
        const saldoProjetado = user.saldo - valorTotalEstimado; 

        valorTotalEstimadoSpan.textContent = formatter.format(valorTotalEstimado);
        limiteDisponivelSpan.textContent = formatter.format(limiteDisponivel);
        saldoProjetadoSpan.textContent = formatter.format(saldoProjetado);
    });


    btnComprar.addEventListener('click', () => {
        const quantidade = parseInt(quantidadeInput.value);
        const preco = parseFloat(precoSpan.value);
        try {
            validatePurchase(quantidade, preco)

            const stock = new Stock({
                ticker: String(ticker).toUpperCase(),
                preco: preco
            })
            const transaction = buildTransacao(stock, quantidade, TipoTransacao.COMPRA)
    
            checkPosicao(transaction, user)
            .then(() => saveTransacao(transaction))
            .then(() =>{
                window.location.href = '../home-page/home.html';
            })
            .catch(error => {
                console.error('Erro ao salvar transação ou atualizar informações do usuário:', error);
            });
        } catch (error) {
            console.error('Erro ao validar compra:', error);
        }
    });
});


function validatePurchase(quantidade, preco){
    if (quantidade <= 0) {
        throw new Error('Quantidade inválida. Insira um valor válido maior que zero.');
    }
    if (preco <= 0) {
        throw new Error('Preço inválido. Insira um valor válido maior que zero.');
    }
    if ((quantidade * preco) > user.saldo) {
        throw new Error('Saldo Insuficiente');
    }

}
