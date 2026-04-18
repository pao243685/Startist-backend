require('dotenv').config()
const express = require('express')
const app = express()

app.use(express.json())

app.use('/api/v1/tecnicas',  require('./routes/tecnicas'))
app.use('/api/v1/tarjetas',  require('./routes/tarjetas'))
app.use('/api/v1/proyectos', require('./routes/proyectos'))
app.use('/api/v1/artistas',  require('./routes/artistas'))

app.get('/', (req, res) => res.json({ status: 'Startist corriendo' }))

module.exports = app