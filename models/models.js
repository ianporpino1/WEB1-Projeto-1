export class Position {
    constructor({id, stock, precoMedio, quantidadeTotal, totalPosicao}) {
        this.id = id;
        this.stock = stock;
        this.precoMedio = precoMedio
        this.quantidadeTotal = quantidadeTotal
        this.totalPosicao = totalPosicao
    }
}
export class Transaction {
    constructor({id, stock, quantidade, totalTransacao, tipoTransacao, data = null }) {
        this.id = id;
        this.stock = stock;
        this.quantidade = quantidade
        this.totalTransacao = totalTransacao
        this.tipoTransacao = tipoTransacao
        this.data = data ? new Date(data) : new Date();
    }
}
export class Stock {
    constructor({ticker, preco}) {
        this.ticker = ticker;
        this.preco = preco;
    }
}
export class User {
    constructor({id, cpf, email, password, saldo, totalInvestido}) {
        this.id = id;
        this.cpf = cpf;
        this.email = email
        this.password = password
        this.saldo = saldo;
        this.totalInvestido = totalInvestido;
    }
}
export class Result {
    constructor({id, resultado, rentabilidade, ticker, volume, mes = null, ano = null}) {
        this.id = id;
        this.resultado = resultado;
        this.rentabilidade = rentabilidade;
        this.ticker = ticker;
        this.volume = volume;
        this.mes = mes !== null ? mes : new Date().getMonth() + 1;
        this.ano = ano !== null ? ano : new Date().getFullYear();
    }
}

export const TipoTransacao = Object.freeze({
    COMPRA: 'COMPRA',
    VENDA: 'VENDA',
    DEPOSITO: 'DEPOSITO',
    SAQUE: 'SAQUE'
});