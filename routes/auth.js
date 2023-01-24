const router = require('express').Router();

//adquirimos el modelo de usuario
const User = require('../models/User');

//inicializamos variable para encriptar
const bcrypt = require('bcrypt');

//inicializamos jsonwebtoken
const jwt = require('jsonwebtoken');

//inicializacion de validaciones
const Joi =  require('@hapi/joi');

const schemaRegister = Joi.object({
    name: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

router.post('/login', async(req,res) => {
    //validaciones
    const {error} = schemaLogin.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    //buscamos usuario en base de datos
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: true, mensaje: 'email no registrado' });

    const passValida = await bcrypt.compare(req.body.password, user.password)
    if(!passValida) return res.status(400).json({ error: true, mensaje: 'contraseña mal' });

    //token
    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, process.env.TOKEN_SECRET)

    //enviamos de vuelta un header con el token del usuario
    res.header('auth-token', token).json({
        error: null,
        data: {token}
    })
})

router.post('/register', async(req, res) => {

    //validaciones de usuario
    const {error} = schemaRegister.validate(req.body)
    
    if (error) {
        return res.status(400).json({error: error.details[0].message})
    }

    const existeEmail = await User.findOne({email: req.body.email});
    if (existeEmail) return res.status(400).json({error: true, mensaje: 'email ya registrado'})

    //encriptamos
    const saltos = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, saltos)


    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: password
    })

    try {
        
        const userDB = await user.save();
        res.json({
            error: null,
            data: userDB
        })

    } catch (error) {
        res.status(400).json(error)
    }
})

module.exports = router;