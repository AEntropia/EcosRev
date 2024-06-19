const urlBase = window.location.href.replace(/\/[^\/]*$/, '') + '/api'
const access_token = localStorage.getItem('token') || null
const resultadoModal = new bootstrap.Modal(document.getElementById('modalMensagem'))

document.getElementById('formCadastro').addEventListener('submit', function (event){
    event.preventDefault() // evita o recarregamento
    let usuario = {} // Objeto beneficio
    usuario = {
        "nome": document.getElementById('name').value,
        "email": document.getElementById('login').value,
        "senha": document.getElementById('senha').value,
        "pontos": 0
    } /* fim do objeto */
    //alert(JSON.stringify(beneficio)) //apenas para testes
    salvaUsuario(usuario)
})

async function salvaUsuario(usuario){
    await fetch(`${urlBase}/usuario`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'access-token' : access_token
        },
        body: JSON.stringify(usuario)
    })
    .then(response => response.json())
    .then(data => {
        if (data.acknowledged) {
            alert('Usuario incluído com sucesso!')
            window.location.href="index.html"
            //atualizamos a listagem
        } else if (data.errors){
 const errorMessages = data.errors.map(error => error.msg).join('\n')
 document.getElementById('mensagem').innerHTML = `<span class='text-danger'>${errorMessages}</span>`
 resultadoModal.show() //Mostra o modal
        }
    })

}

