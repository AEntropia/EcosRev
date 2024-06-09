const urlBase = window.location.href.replace(/\/[^\/]*$/, '') + '/api'
const access_token = localStorage.getItem('token') || null
const resultadoModal = new bootstrap.Modal(document.getElementById('modalMensagem'))

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

document.getElementById('formBeneficio').addEventListener('submit', function (event){
    event.preventDefault() // evita o recarregamento
    let beneficio = {} // Objeto beneficio
    beneficio = {
        "nome": document.getElementById('nome1').value,
        "data": document.getElementById('data2').value,
        "endereco": document.getElementById('endereco3').value,
        "pontos": document.getElementById('pontos4').value,
        "quantidade": document.getElementById('quantidade5').value
    } /* fim do objeto */
    //alert(JSON.stringify(beneficio)) //apenas para testes
    salvaBeneficio(beneficio)
})

async function salvaBeneficio(beneficio){
    await fetch(`${urlBase}/beneficio`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'access-token' : access_token
        },
        body: JSON.stringify(beneficio)
    })
    .then(response => response.json())
    .then(data => {
        if (data.acknowledged) {
            alert('Beneficio incluído com sucesso!')
            //atualizamos a listagem
        } else if (data.errors){
 const errorMessages = data.errors.map(error => error.msg).join('\n')
 document.getElementById('mensagem').innerHTML = `<span class='text-danger'>${errorMessages}</span>`
 resultadoModal.show() //Mostra o modal
        }
    })

}

