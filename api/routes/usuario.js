import express from "express";
import { connectToDatabase } from "../utils/mongodb.js";
import { check, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";

const router = express.Router();
const { db, ObjectId } = await connectToDatabase();
const nomeCollection = "usuarios";

/************
* VALIDAÇÕES DO USUÁRIO
/***********/
const validaUsuario = [
  check("nome")
    .not()
    .isEmpty()
    .trim()
    .withMessage("É obrigatório informar o nome")
    .isAlpha("pt-BR", { ignore: " " })
    .withMessage("Informe apenas texto")
    .isLength({ min: 3 })
    .withMessage("Informe no mínimo 3 caracteres")
    .isLength({ max: 100 })
    .withMessage("Informe no máximo 100 caracteres")
    .not()
    .matches(/^\d+$/)
    .withMessage("O nome não pode conter apenas números"),
  check("email")
    .not()
    .isEmpty()
    .trim()
    .withMessage("É obrigatório informar o email")
    .isLowercase()
    .withMessage("Não são permitidas maiúsculas")
    .isEmail()
    .withMessage("Informe um email válido")
    .custom((value, { req }) => {
      return db
        .collection(nomeCollection)
        .find({ email: { $eq: value } })
        .toArray()
        .then((email) => {
          //verifica se não existe o ID para garantir que é inclusão
          if (email.length && !req.params.id) {
            return Promise.reject(`o email ${value} já existe!`);
          }
        });
    }),
  check("senha")
    .not()
    .isEmpty()
    .trim()
    .withMessage("A senha é obrigatória")
    .isLength({ min: 6 })
    .withMessage("A senha deve ter no mínimo 6 carac.")
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    })
    .withMessage(
      "A senha não é segura. Informe no mínimo 1 caractere maiúsculo, 1 minúsculo, 1 número e 1 caractere especial"
    ),
  check("ativo")
    .default(true)
    .isBoolean()
    .withMessage("O valor deve ser um booleano"),
  check("tipo")
    .default("Cliente")
    .isIn(["Admin", "Cliente"])
    .withMessage("O tipo deve ser Admin ou Cliente"),
];

const validaPontos = [
  check("pontos")
    .isInt({ min: 0 })
    .withMessage("Os pontos não podem ser negativos"),
];

//POST de Usuário
router.post("/", validaUsuario, async (req, res) => {
  /*
            #swagger.tags = ['Usuário']
            #swagger.summary = 'Post para cadastrar usuário'
            #swagger.description = 'Função chamada para executar o POST do usuário com suas devidas validações'
            #swagger.security = [{
                    "apiKeyAuth": []
                }]
        */
  const schemaErrors = validationResult(req);
  if (!schemaErrors.isEmpty()) {
    return res.status(403).json({
      errors: schemaErrors.array(),
    });
  } else {
    //criptografia da senha
    //genSalt => impede que 2 senhas iguais tenham resultados iguais
    const salt = await bcrypt.genSalt(10);
    req.body.senha = await bcrypt.hash(req.body.senha, salt);
    //iremos salvar o registro
    await db
      .collection(nomeCollection)
      .insertOne(req.body)
      .then((result) => res.status(201).send(result))
      .catch((err) => res.status(400).json(err));
  } //fecha o else
});

// GET Usuário
router.get("/", auth, async (req, res) => {
  /*
            #swagger.tags = ['Usuário']
            #swagger.summary = 'GET recebendo todos usuários'
            #swagger.description = 'Função chamada para executar o GET com todos usuário'
            #swagger.security = [{
                    "apiKeyAuth": []
                }]
            */
  try {
    const docs = [];
    await db
      .collection(nomeCollection)
      .find({}, { senha: 0 })
      .sort({ nome: 1 })
      .forEach((doc) => {
        docs.push(doc);
      });
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({
      message: "Erro ao obter a listagem dos usuários",
      error: `${err.message}`,
    });
  }
});

router.get("/id/:id", auth, async (req, res) => {
  try {
    /*
            #swagger.tags = ['Usuário']
            #swagger.summary = 'GET recebendo usuário pelo ID'
            #swagger.description = 'Função chamada para executar o GET com o ID de um usuário específico'
            #swagger.security = [{
                    "apiKeyAuth": []
                }]
        */
    const docs = [];
    await db
      .collection(nomeCollection)
      .find({ _id: { $eq: new ObjectId(req.params.id) } }, {})
      .forEach((doc) => {
        docs.push(doc);
      });
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: "Erro ao obter o usuário pelo ID",
          param: "/id/:id",
        },
      ],
    });
  }
});

const validaLogin = [
  check("email")
    .not()
    .isEmpty()
    .trim()
    .withMessage("O email é obrigatório")
    .isEmail()
    .withMessage("Informe um email válido para o login"),
  check("senha").not().isEmpty().trim().withMessage("A senha é obrigatória"),
];

router.get("/pontos", auth, async (req, res) => {
  /*
            #swagger.tags = ['Usuário']
            #swagger.summary = 'GET recebendo os pontos do usuário'
            #swagger.description = 'Função chamada para executar o GET com a pontuação do usuário'
            #swagger.security = [{
                    "apiKeyAuth": []
                }]
        */
  try {
    const docs = [];
    await db
      .collection(nomeCollection)
      .find({ _id: { $eq: new ObjectId(req.usuario.id) } }, {})
      .forEach((doc) => {
        docs.push(doc);
      });
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({
      message: "Erro ao obter a listagem dos pontos do usuário",
      error: `${err.message}`,
    });
  }
});

router.post("/login", validaLogin, async (req, res) => {
  /*
            #swagger.tags = ['Usuário']
            #swagger.summary = 'POST executando o Login do usuário'
            #swagger.description = 'Função chamada para executar o POST do usuário com suas devidas verificações'
            #swagger.security = [{
                    "apiKeyAuth": []
                }]
        */
  const schemaErrors = validationResult(req);
  if (!schemaErrors.isEmpty()) {
    return res.status(403).json({ errors: schemaErrors.array() });
  }
  //obtendo os dados para o login
  const { email, senha } = req.body;
  try {
    //verificar se o email existe no Mongodb
    let usuario = await db
      .collection(nomeCollection)
      .find({ email })
      .limit(1)
      .toArray();
    //Se o array estiver vazio, é que o email não existe
    if (!usuario.length)
      return res.status(404).json({
        //not found
        errors: [
          {
            value: `${email}`,
            msg: `O email ${email} não está cadastrado!`,
            param: "email",
          },
        ],
      });
    //Se o email existir, comparamos se a senha está correta
    const isMatch = await bcrypt.compare(senha, usuario[0].senha);
    if (!isMatch)
      return res.status(403).json({
        //forbidden
        errors: [
          {
            value: "senha",
            msg: "A senha informada está incorreta ",
            param: "senha",
          },
        ],
      });
    const redirectUrl =
      usuario[0].tipo === "Admin" ? "menu.html" : "menuUser.html";
    //Iremos gerar o token JWT
    jwt.sign(
      { usuario: { id: usuario[0]._id, tipo: usuario[0].tipo } },
      process.env.SECRET_KEY,
      { expiresIn: process.env.EXPIRES_IN },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          access_token: token,
          redirect_url: redirectUrl,
        });
      }
    );
  } catch (e) {
    console.error(e);
  }
});

router.put("/pontos", auth, validaPontos, async (req, res) => {
  /*
            #swagger.tags = ['Usuário']
            #swagger.summary = 'PUT recebendo a pontuação do usuário'
            #swagger.description = 'Função chamada para executar o PUT com a pontuação do usuário a ser modificada'
            #swagger.security = [{
                    "apiKeyAuth": []
                }]
        */
  let idDocumento = req.usuario.id; //armazenamos o _id do documento
  delete req.body._id; //removemos o _id do body que foi recebido na req.
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const usuario = await db
      .collection(nomeCollection)
      .updateOne(
        { _id: { $eq: new ObjectId(idDocumento) } },
        { $set: { pontos: req.body.pontos } }
      );
    res.status(202).json(usuario); //Accepted
  } catch (err) {
    res.status(500).json({ errors: err.message });
  }
});

router.put("/pontosPut", auth, validaPontos, async (req, res) => {
  /*
            #swagger.tags = ['Usuário']
            #swagger.summary = 'PUT recebendo a pontuação do usuário'
            #swagger.description = 'Função chamada para executar o PUT com a pontuação do usuário afim de ser modificada na pagina de transação'
            #swagger.security = [{
                    "apiKeyAuth": []
                }]
        */

  let idDocumento = req.body._id; //armazenamos o _id do documento
  delete req.body._id; //removemos o _id do body que foi recebido na req.
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const usuario = await db
      .collection(nomeCollection)
      .updateOne(
        { _id: { $eq: new ObjectId(idDocumento) } },
        { $set: { pontos: req.body.pontos } }
      );
    res.status(202).json(usuario); //Accepted
  } catch (err) {
    res.status(500).json({ errors: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  /*
            #swagger.tags = ['Usuarios']
            #swagger.summary = 'DELETE recebendo um usuario pelo ID'
            #swagger.description = 'Função chamada para executar o DELETE de apenas um usuário pelo seu ID'
            #swagger.security = [{
                    "apiKeyAuth": []
                }]
        */
  const result = await db.collection(nomeCollection).deleteOne({
    _id: { $eq: new ObjectId(req.params.id) },
  });
  if (result.deletedCount === 0) {
    res.status(404).json({
      errors: [
        {
          value: `Não há nenhum usuário com o id ${req.params.id}`,
          msg: "Erro ao excluir o usuário",
          param: "/:id",
        },
      ],
    });
  } else {
    res.status(200).send(result);
  }
});
export default router;
