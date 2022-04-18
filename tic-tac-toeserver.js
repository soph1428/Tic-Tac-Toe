const express = require('express')
const app = express()
const http = require(`http`)
const server = http.createServer(app)
const {Server} = require(`socket.io`)
const io = new Server(server)
app.get(`/`, (req, res) => {
    res.sendFile(__dirname + "/tic-tac-toe.html")
})
app.use(express.static(__dirname))
io.on(`connection`, (socket) => {
    socket.on(`new game`, (gameCode) => {
        socket.join(gameCode)
        socket.leave(socket.id)
        console.log(io.sockets.adapter.rooms)
        socket.on(`join game`, (code) => {
            if (code == gameCode || !io.sockets.adapter.rooms.has(code)) return
            if ((io.sockets.adapter.rooms.has(code) && io.sockets.adapter.rooms.get(code).size > 1)) return socket.emit(`full game`)
            disconnect()
            socket.join(code)
            gameCode = code
            io.in(gameCode).emit(`joined game`, {code: gameCode, player1: Array.from(io.sockets.adapter.rooms.get(gameCode))[0], player2: socket.id})
        })
        socket.on(`start game`, () => {
            io.in(gameCode).emit(`start game`)
        })
        socket.on(`place`, id => {
            io.in(gameCode).emit(`place`, id)
        })
        socket.on(`disconnect`, disconnect)
        function disconnect() {
            socket.leave(gameCode)
            if (io.sockets.adapter.rooms.get(gameCode)) {
                io.to(gameCode).emit(`disconnected`)
            }
        }
    })
})
server.listen(process.env.PORT || 5500, `0.0.0.0`, () => {
    console.log(`listening on 5500`)
})