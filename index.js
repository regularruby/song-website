const colors = require('colors');

const express = require('express')
const app = express();
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)

let users = [];

app.use(express.static(__dirname))

server.listen(process.env.PORT || 81);
console.log('server running...')

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
    res.sendFile(__dirname + '/theme.css')
})

io.sockets.on('connection', socket => {

    let address = socket.handshake.address.replace("::ffff:", "").replace("::1", "localhost").replace("127.0.0.1", "localhost")

    socket.emit("link", address);

    socket.on('disconnect', () => {
        console.log("")
        console.log(address.red + "\tlink lost".yellow)
        for (i = 0; i < users.length; i++) {
            if (users[i].addr === address) {
                console.log(users.splice(i, 1)[0]);
            }
        }
        console.log(users)
        updateData(io)
    })

    socket.on('fully linked', () => {
        pingTest(socket);
        console.log("")
        console.log(address.green + "\tfully linked".yellow)
        let obj = {}
        obj.id = socket.id
        obj.addr = address
        obj.ping = 0
        users.push(obj)
        console.log(users)
        updateData(io, users)
    })

    socket.on('avrage ping', (avgPing) => {
        if(modify(address)){
        modify(address).ping = avgPing
        }
    })
})

function pingTest(socket) {
    setInterval(() => {
        socket.emit("pingTime", Date.now())
    }, 100);
}

function modify(address) {
    for (i = 0; i < users.length; i++) {
        if (users[i].addr === address) {
            return users[i];
        }
    }
}

function updateData(io) {
    if (modify("localhost")) {
        setInterval(() => {
            if (!modify("localhost")) return;
            io.to(modify("localhost").id).emit('data', users)
        }, 500)
    } else {
        console.log("not using local host")
    }
}