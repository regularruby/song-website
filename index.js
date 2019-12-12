const colors = require('colors');
const express = require('express')
const app = express();
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)

let users = [];
const debug = false;

app.use(express.static(__dirname))

server.listen(process.env.PORT || 81);
console.log('server running...')

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
    res.sendFile(__dirname + '/theme.css')
})

io.sockets.on('connection', socket => {
    let address = socket.handshake.address.replace("::ffff:", "").replace("::1", "localhost").replace("127.0.0.1", "localhost")
    socket.emit("handshake", address);

    socket.on('handshake-success', () => {
        pingTest(socket);
        console.log(address.green + "\thandshake-success".yellow)
        let obj = {};
        obj.id = socket.id;
        obj.addr = address;
        obj.ping = 0;
        obj.sync = false;
        obj.audio = {};
        obj.audio.play = false;
        obj.audio.volume = 100;
        obj.audio.timestamp = 000;
        users.push(obj);
        log(users)
        updateData(io)
    })

    socket.on('pingRebound', time => {
        let ping = (Date.now() - time)/2
        modify(address).ping = ping;
        updateData(io);
    })

    socket.on('disconnect', () => {
        console.log(address.red + "\tlink lost".yellow)
        users.forEach((user, index) => {
            if (address === user.addr) {
                users.splice(index, 1);
            }
        })
        log(modify(address))
        updateData(io)
    })
})

function pingTest(socket) {
    setInterval(() => {
        if(users.length > 0) {
            socket.emit("pingTest", Date.now())
        }
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
            io.to(modify("localhost").id).emit('data', users)
    }
    users.forEach(user => {
        io.to(user.id).emit('data',users)
    })
}

function log(msg) {
    if(debug){
        console.log(msg)
    }
}