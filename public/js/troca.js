const urlBase = window.location.href.replace(/\/[^\/]*$/, '') + '/api'
const access_token = localStorage.getItem('token') || null
const resultadoModal = new bootstrap.Modal(document.getElementById('modalMensagem'))
const attForm = new bootstrap.Modal(document.getElementById('modalForm'))
var ids = []
var qtd = []

async function carregaBeneficio() {
    const tabela = document.getElementById('dadosTabela')
    tabela.innerHTML = '' //limpa antes de recarregar
    //Faremos a requisição GET para a nossa API REST
    await fetch(`${urlBase}/beneficio`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'access-token': access_token
        }
    })
        .then(response => response.json())
        .then(data => {
            //console.table(data)
            data.forEach((beneficio, index) => {
                let desabilitar = beneficio.quantidade === 0 ? 'disabled' : ''
                let corLinha = beneficio.quantidade === 0 ? 'style="background-color: gray;"' : ''
    
                tabela.innerHTML += `
                <tr id="linha-${index}" ${corLinha}>
                  <input type="text" class="form-control" id="idAtt-${index}" name="id" style="display: none;" value="${beneficio._id}"/>
                  <td>${beneficio.nome}</td>
                  <td>${new Date(beneficio.data).toLocaleDateString()}</td>
                  <td>${beneficio.endereco}</td>
                  <td>${beneficio.pontos}</td>
                  <td id="qtd-${index}">${beneficio.quantidade}</td>
                  <td>
                    <input type="checkbox" value="${beneficio.pontos}" class="pontos" name="pontos" onclick="pontos()" data-index="${index}" ${desabilitar}/>
                    <label for="pontos">Adicionar</label>
                  </td>
                </tr>
                `
            })
        })
}

async function pontosUser() {
    await fetch(`${urlBase}/usuario/pontos`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'access-token': access_token
        }
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById("uPontos").innerHTML = "Seus Pontos: " + data[0].pontos
            pontuacao = data[0].pontos
        })
    return pontuacao
}

async function pontos() {
    isCheck = [] //Iniciando a variável de valores checkados
    var c = document.getElementsByClassName("pontos") // Iniciando a variável com endereçamento das checkboxes
    for (var i = 0; i < c.length; i++) { //Iniciando loop que chama a função
        for (var co = 0; co < c.length; co++) { // Loop de alimentação do array de checkboxes checados
            isCheck.push(c[co].checked)
        }
        if (isCheck.includes(true)) // Se houver um valor verdadeiro ele mostra o total do resgate, senão, oculta novamente
            document.getElementById("divsaldo").style.display = "block"
        else {
            document.getElementById("divsaldo").style.display = "none"
        }
        isCheck = [] // limpa o array
        s = 0 // inicializando a variável de soma de valores
        for (var co = 0; co < c.length; co++) {
            if (c[co].checked == true) { // alimentando a variável de soma de valores apenas dos valores checkados
                s += Number(c[co].value)
                //console.log(c)
            }
        }
        document.getElementById("saldo").innerHTML = "Total: " + s // substituindo o texto de um h3 para o valor total do resgate
        if (s > await pontosUser()) { // mudando a cor dos pontos caso ultrapasse o total de pontos do usuário, no caso 300
            document.getElementById("saldo").style.color = "red"
        }
        else {
            document.getElementById("saldo").style.color = "black"
        }
    }
}
async function resgate() {
    var soma = 0
    let ids = []
    let qtd = []
    const checkboxes = document.getElementsByClassName("pontos")
   
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                const index = checkboxes[i].getAttribute("data-index")
                const id = document.getElementById(`idAtt-${index}`).value
                const quantidade = document.getElementById(`qtd-${index}`).textContent
                soma += Number(checkboxes[i].value)
                ids.push(id)
                qtd.push(Number(quantidade))
            }
        }
        const userPoints = await pontosUser()
        if (userPoints >= soma) {
        for (let i = 0; i < ids.length; i++) {
            await fetch(`${urlBase}/beneficio/resgate`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': access_token
                },
                body: JSON.stringify({
                    "_id": ids[i],
                    "quantidade": qtd[i] - 1
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.acknowledged) {
                        alert('Beneficio resgatado sucesso!')
                    } else if (data.errors) {
                        const errorMessages = data.errors.map(error => error.msg).join('\n')
                        document.getElementById('mensagem').innerHTML = `<span class='text-danger'>${errorMessages}</span>`
                        resultadoModal.show() //Mostra o modal
                    }
                })
        }

        await fetch(`${urlBase}/usuario/pontos`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'access-token': access_token
            },
            body: JSON.stringify({
                "pontos": userPoints - s
            })
        })

        carregaBeneficio() // Atualiza a listagem após a atualização dos benefícios
        pontosUser()
    }
    else {
        window.alert("Pontos insuficientes")
    }
}