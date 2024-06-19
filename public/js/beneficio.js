const urlBase = window.location.href.replace(/\/[^\/]*$/, '') + '/api'
const access_token = localStorage.getItem('token') || null
const resultadoModal = new bootstrap.Modal(document.getElementById('modalMensagem'))
const attForm = new bootstrap.Modal(document.getElementById('modalForm'))
var tipo 

document.addEventListener('DOMContentLoaded', async () => {
    tipo = await tipo()  
    if(tipo != "Admin"){
            alert('Acesso negado. Não é admin.');
            window.location.href = '/index.html';
        }
});

async function tipo(){
    await fetch(`${urlBase}/usuario/pontos`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'access-token': access_token
        }
    })
        .then(response => response.json())
        .then(data => {
            tipo = data[0].tipo
        })
        return tipo
}

async function carregaBeneficio(){
    const tabela = document.getElementById('dadosTabela')
    tabela.innerHTML = '' //limpa antes de recarregar
    //Faremos a requisição GET para a nossa API REST
    await fetch(`${urlBase}/beneficio`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'access-token' : access_token
        }
    })
    .then(response => response.json())
    .then(data => {
        //console.table(data)
        data.forEach(beneficio => {
            tabela.innerHTML += `
            <tr>
              <td>${beneficio.nome}</td>
              <td>${new Date(beneficio.data).toLocaleDateString()}</td>
              <td>${beneficio.endereco}</td>
              <td>${beneficio.pontos}</td>
              <td>${beneficio.quantidade}</td>
              <td>
        <button class='btnExcluir' onclick='removeBeneficio("${beneficio._id}")'>🗑 Excluir </button>
        <button class='btnAtualizar' onclick='carregaAtt("${beneficio._id}")'>📝 Atualizar </button>
              </td>
            </tr>
            `
        })
    })
}

async function removeBeneficio(id){
    if(confirm('Deseja realmente excluir este beneficio?')){
        await fetch(`${urlBase}/beneficio/${id}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json',
            'access-token' : access_token
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.deletedCount > 0){carregaBeneficio() //atualizamos a UI
            }
        })
        .catch(error => {
            document.getElementById('mensagem').innerHTML = `Erro ao remover o beneficio: ${error.message}`
            resultadoModal.show() //exibe o modal com o erro
        })
    }
}

async function atualizaBeneficio(beneficio){
    await fetch(`${urlBase}/beneficio`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'access-token' : access_token
        },
        body: JSON.stringify(beneficio)
    })
    .then(response => response.json())
    .then(data => {
        if (data.acknowledged) {
            alert('Beneficio atualizado com sucesso!')
            //atualizamos a listagem
            carregaBeneficio()
        } else if (data.errors){
 const errorMessages = data.errors.map(error => error.msg).join('\n')
 document.getElementById('mensagem').innerHTML = `<span class='text-danger'>${errorMessages}</span>`
 resultadoModal.show() //Mostra o modal
        }
    })
}

document.getElementById('botaoAtt').addEventListener('click', function (event){
    event.preventDefault() // evita o recarregamento
    //let beneficio = {} // Objeto beneficio
    beneficio = {
        "_id": document.getElementById('idAtt').value,
        "nome": document.getElementById('nome1').value,
        "data": document.getElementById('data2').value,
        "endereco": document.getElementById('endereco3').value,
        "pontos": document.getElementById('pontos4').value,
        "quantidade": document.getElementById('quantidade5').value
    } /* fim do objeto */
    //alert(JSON.stringify(beneficio)) //apenas para testes
    atualizaBeneficio(beneficio)
    attForm.hide()
})

async function carregaAtt(id){
    attForm.show()
    await fetch(`${urlBase}/beneficio/id/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'access-token' : access_token
        }
    })
    .then(response => response.json())
    .then(data => {
        //console.log(data[0]._id)
        document.getElementById('idAtt').value = data[0]._id
        document.getElementById('nome1').value = data[0].nome
        document.getElementById('data2').value = data[0].data
        document.getElementById('endereco3').value = data[0].endereco
        document.getElementById('pontos4').value = data[0].pontos
        document.getElementById('quantidade5').value = data[0].quantidade
    })
}
