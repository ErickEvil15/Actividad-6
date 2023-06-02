var socket = io.connect("https://chatpa.herokuapp.com/", { forceNew: true });
console.log(socket);


const scrollingElement = (document.getElementById('impresionChat') || document.body);

const scrollToBottom = () => {
  scrollingElement.scrollTop = scrollingElement.scrollHeight;
}

const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);

const id1 = urlParams.get('id1')
const id2 = urlParams.get('id2')
const exp = urlParams.get('e')
 
const remdes = [id1,id2]


socket.emit('requestDB', remdes)

document.getElementById('button-addon2').addEventListener('click', function(){
  var mensaje = document.getElementById('mensaje').value
  var mensremdes = [mensaje, remdes, exp]
  socket.emit('mensajeEnviado', mensremdes)
  document.getElementById('mensaje').value = ''
})

socket.on('render', ()=>{
  socket.emit('requestDB', remdes)
})


socket.on('imprimirMensajeria', (chatHTML)=>{
  document.getElementById('impresionChat').innerHTML = chatHTML
  setTimeout(function() { scrollToBottom(); }, 40)
})