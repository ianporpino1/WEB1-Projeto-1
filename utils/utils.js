import { Transaction, Position, TipoTransacao, Result } from "../models/models.js";

let user = JSON.parse(localStorage.getItem('user'));

export const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});
export const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});



export function buildTransacao(stock, quantidade, tipoTransacao){
    if(tipoTransacao == TipoTransacao.COMPRA){
        return buildTransacaoCompra(stock,quantidade)
    } else if(tipoTransacao == TipoTransacao.VENDA){
        return buildTransacaoVenda(stock,quantidade)
    } else if(tipoTransacao == TipoTransacao.DEPOSITO){
        return buildTransacaoDeposito(quantidade)
    } else if(tipoTransacao == TipoTransacao.SAQUE){
        return buildTransacaoSaque(quantidade)
    }
}

function buildTransacaoSaque(valor){
    return new Transaction({
        quantidade: 1,
        totalTransacao: valor,
        tipoTransacao: TipoTransacao.SAQUE
    })
}

function buildTransacaoDeposito(valor){
    return new Transaction({
        quantidade: 1,
        totalTransacao: valor,
        tipoTransacao: TipoTransacao.DEPOSITO
    })
}

function buildTransacaoCompra(stock, quantidade){
    return new Transaction({
        stock: stock,
        quantidade: quantidade,
        totalTransacao: stock.preco * quantidade,
        tipoTransacao: TipoTransacao.COMPRA
    })
}

function buildTransacaoVenda(stock, quantidade){
    return new Transaction({
        stock: stock,
        quantidade: quantidade,
        totalTransacao: -(stock.preco * quantidade),
        tipoTransacao: TipoTransacao.VENDA
    })
}

export async function checkPosicao(transaction, user){
    
    try {
        let position = await findPositionByTicker(transaction.stock.ticker, user.id);
        let resultadoFinanceiro = 0
        if (position == null) {
            const novaPosition = new Position({
                stock: transaction.stock,
                precoMedio: transaction.stock.preco,
                quantidadeTotal: transaction.quantidade,
                totalPosicao: transaction.totalTransacao
            });
            await savePosition(novaPosition, user.id);
        } else if (transaction.tipoTransacao === TipoTransacao.COMPRA) {
            await atualizarPosicaoCompra(transaction, position, user.id);
        }
        else if (transaction.tipoTransacao === TipoTransacao.VENDA) {
            resultadoFinanceiro = await atualizarPosicaoVenda(transaction, position, user.id);
        }
        await updateUserInfo(transaction, resultadoFinanceiro);
    } catch (error) {
        throw error
    }
   
}

async function atualizarPosicaoCompra(transaction, position, userId){
    const novaQuantidade = transaction.quantidade + position.quantidadeTotal
    const total = position.totalPosicao + transaction.totalTransacao
    const novoPrecoMedio = total / novaQuantidade

    const updatedPosition = new Position({
        stock: position.stock,
        precoMedio: novoPrecoMedio,
        quantidadeTotal: novaQuantidade,
        totalPosicao: total
    })
    await updatePosition(updatedPosition, position.id, userId)
}


async function atualizarPosicaoVenda(transaction, position, userId){
    if(position.quantidadeTotal - transaction.quantidade < 0){
        throw new Error('Tentando vender quantidade maior do que possui')
    }
    const novaQuantidade = position.quantidadeTotal - transaction.quantidade

    const resultadoFinanceiro = (transaction.stock.preco - position.precoMedio) * transaction.quantidade

    const rentabilidade = (resultadoFinanceiro / (transaction.quantidade * position.precoMedio)*100)

    const total = position.totalPosicao + transaction.totalTransacao + resultadoFinanceiro

    const result = new Result({
        resultado: resultadoFinanceiro,
        rentabilidade: rentabilidade,
        ticker: position.stock.ticker,
        volume: -transaction.totalTransacao
    })

    await saveResult(result, userId)
    
    if(novaQuantidade == 0){
        await deletePosition(position.id, userId)
    }
    else {
        const updatedPosition = new Position({
            stock: position.stock,
            precoMedio: position.precoMedio,
            quantidadeTotal: novaQuantidade,
            totalPosicao: total
        })
        await updatePosition(updatedPosition, position.id, userId)
    }
    return resultadoFinanceiro
}


async function findPositionByTicker(ticker, userId){
    const url = `https://web-1-un2-2e85b-default-rtdb.firebaseio.com/users/${userId}/positions.json?orderBy="stock/ticker"&equalTo="${ticker}"`;
    const response = await fetch(url);
    const data = await response.json();
    
    for (let key in data) {
        if (data[key].stock.ticker === ticker) {
            return { id: key, ...data[key] };
        }
    }
    return null;
}

async function savePosition(position, userId){
    return fetch(`https://web-1-un2-2e85b-default-rtdb.firebaseio.com/users/${userId}/positions.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(position),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Resposta de rede não foi ok');
        }
    });
}

async function updatePosition(updatedPosition, positionId, userId){
    return fetch(`https://web-1-un2-2e85b-default-rtdb.firebaseio.com/users/${userId}/positions/${positionId}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPosition),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Houve um problema ao atualizar a posicao');
        }
        console.log('posicao atualizada com sucesso!');
    })
    .catch(error => {
        console.error('Houve um problema ao atualizar a posicao:', error);
    });
}

async function deletePosition(positionId, userId){
    return fetch(`https://web-1-un2-2e85b-default-rtdb.firebaseio.com/users/${userId}/positions/${positionId}.json`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Resposta de rede não foi ok');
        }
    });
}


async function saveResult(result, userId){
    return fetch(`https://web-1-un2-2e85b-default-rtdb.firebaseio.com/users/${userId}/results.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Resposta de rede não foi ok');
        }
    });
}

export function saveTransacao(transaction){
    return fetch(`https://web-1-un2-2e85b-default-rtdb.firebaseio.com/users/${user.id}/transactions.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Resposta de rede não foi ok');
        }
    });
}

function updateUserInfo(transaction, resultadoFinanceiro = 0){
    user.saldo -= transaction.totalTransacao
    user.totalInvestido += transaction.totalTransacao + resultadoFinanceiro
    const data = 
    {
        saldo: user.saldo,
        totalInvestido: user.totalInvestido
    }
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