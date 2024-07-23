import { Result } from "../models/models.js";
import { formatter } from "../utils/utils.js";

let user = JSON.parse(localStorage.getItem('user'));

const impostoForm = document.getElementById('imposto-form')
const anoSelect = document.getElementById('ano')
const resultadoMesSpan = document.getElementById('resultado-mes-data')
const baseImpostoSpan = document.getElementById('base-imposto-data')
const impostoDevidoSpan = document.getElementById('imposto-pagar-data')
const volumeTotalSpan = document.getElementById('total-vendas-data')
const limiteIsencaoSpan = document.getElementById('limite-isencao-data')
const ganhoIsentoSpan = document.getElementById('ganho-isento-data')

let totalResult = 0
let totalImposto = 0
let totalVolume = 0
const LIMITE_ISENCAO = 35000
let ganhoIsento = 0
let baseImposto = 0

document.addEventListener("DOMContentLoaded", function() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;

    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        anoSelect.appendChild(option)
    }
    resultadoMesSpan.textContent = formatter.format(totalResult)
    baseImpostoSpan.textContent = formatter.format(baseImposto)
    impostoDevidoSpan.innerHTML = formatter.format(totalImposto)
    volumeTotalSpan.innerHTML = formatter.format(totalVolume)
    limiteIsencaoSpan.innerHTML = formatter.format(LIMITE_ISENCAO)
    ganhoIsentoSpan.innerHTML = formatter.format(ganhoIsento)
})


impostoForm.addEventListener('submit', function() {
    event.preventDefault()

    const ano = parseInt(document.getElementById('ano').value)
    const mes = parseInt(document.getElementById('mes').value)
    
    fetchResults(mes, ano)
    .then(results => {
        console.log(results)
        renderResults(results)
    })
    .catch(error => {
        console.error('Erro ao buscar o preço:', error);
    });
})



function fetchResults(mes, ano){
    return fetch(`https://web-1-un2-2e85b-default-rtdb.firebaseio.com/users/${user.id}/results.json?orderBy="ano"&equalTo=${ano}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Resposta de rede não foi ok');
        }
        return response.json();
    })
    .then(results => {
        const resultsList = [];
        Object.values(results).filter(result => result.mes === mes)
        .forEach(filteredResult => {
            const result = new Result({
                id: filteredResult.id,
                resultado: filteredResult.resultado,
                rentabilidade: filteredResult.rentabilidade,
                ticker: filteredResult.ticker,
                volume: filteredResult.volume,
                mes: filteredResult.mes,
                ano: filteredResult.ano
            });
            resultsList.push(result)
        });
        return resultsList
    });
}


function renderResults(results) {
    
    if (results.length !== 0) {
        const resultsListHead = document.querySelector('#results-list thead');
        resultsListHead.innerHTML = `<tr>
                                  <th scope="col">Ticker</th>
                                  <th scope="col">Resultado</th>
                                  <th scope="col">Rentabilidade</th>
                              </tr>`
    }

    const resultsListBody = document.querySelector('#results-list tbody');

    results.forEach(result => {
        totalResult += result.resultado
        totalVolume += result.volume
        resultsListBody.appendChild(createResultCard(result))
    })
    
    if (totalResult > 0) {
        if (totalVolume > LIMITE_ISENCAO) {
            baseImposto = totalResult
            totalImposto = totalResult * 0.15
        } else {
            ganhoIsento = totalResult
        }
    }

    resultadoMesSpan.textContent = formatter.format(totalResult)

    baseImpostoSpan.textContent = formatter.format(baseImposto)
    
    impostoDevidoSpan.innerHTML = formatter.format(totalImposto)

    volumeTotalSpan.innerHTML = formatter.format(totalVolume)

    limiteIsencaoSpan.innerHTML = formatter.format(LIMITE_ISENCAO)

    ganhoIsentoSpan.innerHTML = formatter.format(ganhoIsento)

}

function createResultCard(result){
    const resultCard = document.createElement('tr');
    resultCard.classList.add('table-dark-custom');

    const acaoTickerCell = document.createElement('td');
    acaoTickerCell.classList.add('col-4');
    acaoTickerCell.textContent = result.ticker;

    const resultadoCell = document.createElement('td');
    resultadoCell.classList.add('col-2');
    resultadoCell.textContent = formatter.format(result.resultado);

    const rentabilidadeCell = document.createElement('td');
    rentabilidadeCell.classList.add('col-2');
    rentabilidadeCell.textContent = `${result.rentabilidade.toFixed(2)}%`;

    if(result.resultado < 0){
        resultadoCell.classList.add('text-danger');
        rentabilidadeCell.classList.add('text-danger');
    }
    else{
        resultadoCell.classList.add('text-success');
        rentabilidadeCell.classList.add('text-success');
    }

    resultCard.appendChild(acaoTickerCell);
    resultCard.appendChild(resultadoCell);
    resultCard.appendChild(rentabilidadeCell);

    return resultCard;
}
