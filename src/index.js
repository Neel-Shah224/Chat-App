const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage , generateLocationMessage} = require('./utils/messages')
const { adduser , removeUser ,getUser ,getUserInRoom } = require('./utils/user')

const app= express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

app.use(express.json())

const publicDirectoryPath = path.join( __dirname , '../public' )

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New Websocket Connection')

    socket.on('join',(options,callback)=>{
       
        const {error ,user} = adduser({id: socket.id , ...options})

        if(error){
            return callback(error)
        }
        socket.join(user.room)
        
        // socket.emit , io.emit , socket.broadcast.emit
        //io.to.emit , socket.broadcast.to.emit
        socket.emit('message',generateMessage('System',`welcome to chat app , ${user.username}`))
        socket.broadcast.to(user.room).emit('message',generateMessage('System',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage',(msg,callback)=>{
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('message',generateMessage(user.username,msg))
        callback()
    })

    socket.on('sendLocation', (position,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps/?q=${position.latitude},${position.longitude}`))
       callback(undefined,'Location Shared!!')
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage('System Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users: getUserInRoom(user.room)
            })
        }
        
    })
})


server.listen( port , () => {
    console.log('listening on port ',port)    
})