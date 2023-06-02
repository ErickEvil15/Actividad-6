const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const appendFile = require('fs')
const mysql2 = require('mysql2/promise')
const bodyParser = require('body-parser')
const createPool = require('mysql2/promise');
const moment = require('moment'); 


const DB_HOST = process.env.DB_HOST || 'containers-us-west-163.railway.app'

const DB_USER = process.env.DB_USER || 'root'

const DB_PASSWORD = process.env.DB_PASSWORD || 'Nn5LMU9Zv6RkwEftvfid'

const DB_NAME = process.env.DB_NAME || 'railway'

const DB_PORT = process.env.DB_PORT || 6620



const pool = mysql2.createPool({

    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,  
    port: DB_PORT

})

var app=express()
let server = http.createServer(app);
let io = socketIO(server);

const publicPath = path.join(__dirname, 'public');
const PORT = process.env.PORT || 3000;

app.use(express.static(publicPath));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:true }))


server.listen(PORT, ()=> {
    console.log(`Server is up on port ${PORT}.`)
});

io.on('connection', (socket) => {
    console.log('A user just connected.');

    socket.on('disconnect', () => {
        console.log('A user has disconnected.');
    })

    socket.on('mensajeEnviado', (mensremdes)=>{
        var mensaje = mensremdes[0]
        var rem = mensremdes[1][0]
        var des = mensremdes[1][1]
        var exp = mensremdes[2]
        var a = moment().format("LT")
        var fecha = moment().format("L")

        const q = `INSERT INTO mchat VALUES (null, ?, ?, ?, ?, ?, ?)`;
        const params = [rem, des, mensaje, a, fecha, exp];
        console.log(q)

        const result = pool.query(q,params)
        console.log(result)
        setTimeout(function() { io.emit('render') }, 20)
        console.log(result)

    })


    socket.on('requestDB', async(remdes)=>{
        const idrem = remdes[0];
        const iddes = remdes[1];
        const err = ''
        const q = `SELECT * FROM mchat WHERE (remitente = ? AND destinatario = ?) OR (remitente = ? AND destinatario = ?)`;
        const params = [idrem, iddes, iddes, idrem];
    
        const [respuesta] = await pool.query(q,params)
        console.log([respuesta])
        var chatHTML=``
        var i = 0
        respuesta.forEach(mchat=>{
            i++
            if(mchat.remitente == idrem){
                chatHTML+= `
                <div class="media ml-auto mb-3"  style="sticky: right; color: white; text-align: right">
                    <div class="media-body ml-3">
                        <div class="bg-primary rounded py-2 px-3 mb-2" >
                            <p class="text-small mb-0 text-white"><h5>${mchat.mensaje}</h5></p>
                            <p class="small" >${mchat.fecha} || ${mchat.tiempo}</p>
                        </div>
                    </div>
                </div>
                <br>
            `
            }else{
                chatHTML+= `
                <div class="media mb-3"><img src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.png" alt="user" width="50" class="rounded-circle">
                    <div class="media-body ml-3">
                        <div class="bg-light rounded py-2 px-3 mb-2">
                            <p class="text-small mb-0 text-muted"><h5>${mchat.mensaje}</h5></p>
                            <p class="small text-muted">${mchat.fecha} || ${mchat.tiempo}</p>
                        </div>
                    </div>
                </div><br>`
            }
            socket.emit('imprimirMensajeria', chatHTML)
    
            
        })

        
       
    
    
    })





});