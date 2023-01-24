const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
require('dotenv').config();

const app = express();

//capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//Conexion a base de datos
const uri = `mongodb://${process.env.MONGOUSER}:${process.env.MONGOPASSWORD}@${process.env.MONGOHOST}:${process.env.MONGOPORT}`
mongoose.set('strictQuery', true);                          //opcional para evitar advertencia en terminal
mongoose.connect(uri,
    { useNewUrlParser: true, useUnifiedTopology: true }     //para que no pinte errores en la terminal
)
.then(() => console.log('Base de datos conectada'))
.catch(e => console.log('error db:', e))

//import routes
const authRouter = require('./routes/auth');
const validaToken = require('./routes/validate-token');
const admin = require('./routes/admin');

//route middlewares
app.use('/api/user', authRouter)
app.use('/api/admin', validaToken, admin)
app.get('/', (req, res) => {
    res.json({
        estado: true,
        mensaje: 'funciona!'
    })
});

//iniciar servidor
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`servidor andando en: ${PORT}`);
})