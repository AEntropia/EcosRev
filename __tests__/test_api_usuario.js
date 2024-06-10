const request = require('supertest')
const dotenv = require('dotenv')
dotenv.config() //carrega as variáveis do .env
 
const baseURL = 'http://localhost:4000/api'
 
describe('API REST de Usuario sem o Token', ()=>{
  it('GET / - Lista todos os usuario sem o token', async()=> {
    const response = await request(baseURL)
    .get('/usuario')
    .set('Content-Type', 'application/json')
    .expect(401) //Unauthorized
  })
 
 it('GET / Obtém o Usuario pelo ID sem o token', async() => {
    const id = '665e45f2146de57f036239f0'
    const response = await request(baseURL)
    .get(`/usuario/id/${id}`)
    .set('Content-Type','application/json')
    .expect(401) //Unauthorized
 })
 
})
 
describe('API REST de Usuario com o token', ()=> {
    let token //Armazenaremos o access_token JWT
    it('POST - Autenticar usuário para retornar token JWT', async() => {
        const senha = process.env.SENHA_USUARIO
 
        const response = await request(baseURL)
        .post('/usuario/login')
        .set('Content-Type','application/json')
        .send({"email":"teste@gmail.com","senha": senha})
        .expect(200) //OK
 
        token = response.body.access_token
        expect(token).toBeDefined() // Recebemos o token?
    })
 
    it('GET /:id - Lista o usuario pelo id com token', async() => {
        const response = await request(baseURL)
        .get(`/usuario/id/666787b75a0c1b4f20898e7b`)
        .set('Content-Type','application/json')
        .set('access-token', token)
        .expect(200)
    })
})