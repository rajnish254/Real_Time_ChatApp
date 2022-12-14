//create an express web server
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage , generatedLocationMessage} = require('./utils/messages')
const { addUser , removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express() // creating an express app
const server = http.createServer(app)//create a server using http and passing our express app to it
const io = socketio(server)//passing http server to socketio

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath)) //serving files
 

// let count = 0
let message;
io.on('connection',(socket)=>{ // fires when new connection with socket io server
    console.log('New WebSocket connection')

    

    socket.on('join',(options, callback)=>{
        const { error, user} = addUser({id: socket.id ,...options})
        if(error){
            return callback(error)
        }
        
        socket.join(user.room)  
        socket.emit('message',generateMessage(user.username,'Welcome'))
        socket.broadcast.to(user.room).emit('message',generateMessage(user.username,`${user.username} has joined!`))//broadcaste to all except socket
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Badwords are not allowed')
        }

        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })
    //socket contains information about connection 
    // socket.emit('countUpdated',count)
    // // send the event from the server

    // socket.on('increment',()=>{
    //     count++;
    //     // socket.emit('countUpdated',count)
    //     io.emit('countUpdated',count)
    // })
    socket.on('sendLocation',(coords,callback)=>{
       const user = getUser(socket.id)
       io.to(user.room).emit('locationMessage',generatedLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)) 
       callback()
    })


    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        
        if(user){
            io.to(user.room).emit('message',generateMessage(user.username,`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })

})



server.listen(port,()=>{                        //listening on port
    console.log(`Server is up on port ${port}!`)
})