const urlBase = window.location.href.replace(/\/[^\/]*$/, '') + '/api'
const access_token = localStorage.getItem('token') || null
const resultadoModal = new bootstrap.Modal(document.getElementById('modalMensagem'))
const attForm = new bootstrap.Modal(document.getElementById('modalForm'))

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

async function carregaUsuario(){
    const tabela = document.getElementById('dadosTabela')
    tabela.innerHTML = '' //limpa antes de recarregar
    //Faremos a requisição GET para a nossa API REST
    await fetch(`${urlBase}/usuario`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'access-token' : access_token
        }
    })
    .then(response => response.json())
    .then(data => {
        //console.table(data)
        data.forEach(usuario => {
            tabela.innerHTML += `
            <tr>
              <td>${usuario.nome}</td>
              <td>${usuario.email}</td>
              <td>${usuario.pontos}</td>
              <td>
        <button class='btnExcluir' onclick='removeUsuario("${usuario._id}")'>🗑 Excluir </button>
        <button class='btnAtualizar' onclick='carregaAtt("${usuario._id}")'>📝 Atualizar </button>
              </td>
            </tr>
            `
        })
    })
}

async function removeUsuario(id){
    if(confirm('Deseja realmente excluir este usuario?')){
        await fetch(`${urlBase}/usuario/${id}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json',
            'access-token' : access_token
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.deletedCount > 0){carregaUsuario() //atualizamos a UI
            }
        })
        .catch(error => {
            document.getElementById('mensagem').innerHTML = `Erro ao remover o usuario: ${error.message}`
            resultadoModal.show() //exibe o modal com o erro
        })
    }
}

async function atualizaUsuario(usuario){
    await fetch(`${urlBase}/usuario/pontosPut`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'access-token': access_token
        },
        body: JSON.stringify(usuario)
    })
    .then(response => response.json())
    .then(data => {
        if (data.acknowledged) {
            alert('Usuário atualizado com sucesso!')
            //atualizamos a listagem
            carregaUsuario()
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
    usuario = {
        "_id": document.getElementById('idAtt').value,
        "nome": document.getElementById('nome1').value,
        "pontos": document.getElementById('pontos4').value,
    } /* fim do objeto */
    //alert(JSON.stringify(beneficio)) //apenas para testes
    atualizaUsuario(usuario)
    attForm.hide()
})

async function carregaAtt(id){
    attForm.show()
    await fetch(`${urlBase}/usuario/id/${id}`, {
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
        document.getElementById('pontos4').value = data[0].pontos
    })
}
