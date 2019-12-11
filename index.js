const colors = require('colors');

const express = require('express')
const app = express();
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)



app.use(express.static('public'))



server.listen(process.env.PORT || 81);
console.log('server running...')

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

io.sockets.on('connection', socket => {

    let address = socket.handshake.address.replace("::ffff:", "").replace("::1", "localhost").replace("127.0.0.1", "localhost")

    socket.emit("link", address);

    socket.on('disconnect', () => {
        console.log(address.red + "\tlink lost".yellow)
    })

    socket.on('fully linked', () => {
        pingTest(socket);
        console.log(address.green + "\tfully linked".yellow)
    })

    socket.on('avrage ping', (avgPing, numPing) => {

    })

})

function pingTest(socket) {
    setInterval(() => {
        socket.emit("pingTime", Date.now())
    }, 10);
}