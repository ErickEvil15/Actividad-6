const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const appendFile = require('fs')
const mysql2 = require('mysql2/promise')
const bodyParser = require('body-parser')
const createPool = require('mysql2/promise');
const moment = require('moment'); 


const DB_HOST = process.env.DB_HOST || 'containers-us-west-138.railway.app'

const DB_USER = process.env.DB_USER || 'root'

const DB_PASSWORD = process.env.DB_PASSWORD || 'fGdi2JTOVEv4IY9p1PPV'

const DB_NAME = process.env.DB_NAME || 'railway'

const DB_PORT = process.env.DB_PORT || 6539



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

        const q = `insert into mchat values(null,${rem},${des},'${mensaje}','${fecha}','${a}', ${exp})`
        console.log(q)

        const result = pool.query(q)
        console.log(result)
        setTimeout(function() { io.emit('render') }, 20)
        console.log(result)

    })


    socket.on('requestDB', async(remdes)=>{
        const idrem = remdes[0];
        const iddes = remdes[1];
        const err = ''
        const q = `SELECT * FROM mchat where (remitente=${idrem} and destinatario=${iddes}) or (remitente=${iddes} and destinatario=${idrem})`

    
  
        const [respuesta] = await pool.query(q)
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

/*
app.get('/', async(req, res)=>{
    const idrem = req.query.id1;
    const iddes = req.query.id2;
    console.log(idrem)
    console.log(iddes)


    const [respuesta] = await pool.query(`SELECT * FROM mchat where remitente=${idrem} and destinatario=${iddes}`)
    var chatHTML=``
    var i = 0
    respuesta.forEach(mchat=>{
        i++
        if(mchat.remitente == idrem){
            chatHTML+= `
            <div class="media w-50 mb-3"><img src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg" alt="user" width="50" class="rounded-circle">
                <div class="media-body ml-3">
                    <div class="bg-light rounded py-2 px-3 mb-2">
                        <p class="text-small mb-0 text-muted">${mchat.mensaje}</p>
                    </div>
                    <p class="small text-muted">${mchat.fecha} || ${mchat.tiempo}</p>
                </div>
            </div>`

        }else{
            chatHTML+= `
            <div class="media w-50 ml-auto mb-3">
                <div class="media-body">
                    <div class="bg-primary rounded py-2 px-3 mb-2">
                        <p class="text-small mb-0 text-white">${mchat.mensaje}</p>
                    </div>
                    <p class="small text-muted">${mchat.fecha} || ${mchat.tiempo}</p>
                </div>
            </div>
        `
        }


        
    })

    res.send(`
    <html>

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
        <title>Chat</title>
        <link rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800&amp;display=swap">
        <link rel="stylesheet" href="assets/fonts/font-awesome.min.css">
        <link rel="stylesheet" href="assets/fonts/ionicons.min.css">
        <link rel="stylesheet" href="assets/css/Simple-Bootstrap-Chat.css">
    </head>
    <body style="background: url(&quot;design.jpg&quot;);background-position: 0 -60px;">
    
    
    <div class="bootstrap_chat">
        <div class="container py-5 px-4">
          <!-- For demo purpose-->
          <header class="text-center">
            <h1 class="display-4 text-white">Simple Bootstrap Chat</h1>
          </header>
        
         
            <!-- Chat Box-->
            <div class="col-12 px-0">
                <div class="px-4 py-5 chat-box bg-white">
    
                ${chatHTML}
                    
                <form onsubmit="return false" action="/enviarMensaje" method="post" class="bg-light">
                    <div class="input-group">
                        <input type="text" placeholder="Type a message" aria-describedby="button-addon2" class="form-control rounded-0 border-0 py-4 bg-light">
                        <div class="input-group-append">
                            <button id="button-addon2" type="submit" class="btn btn-link"> <i class="fa fa-paper-plane"></i></button>
                        </div>
                    </div>
                </form>
        
                </div>
            </div>
        </div>
        </div>
        <script src="assets/js/jquery.min.js"></script>
        <script src="assets/bootstrap/js/bootstrap.min.js"></script>
        <script src="assets/js/bold-and-bright.js"></script>
    </body>
    
    </html>
    
    
    `)

})

*/