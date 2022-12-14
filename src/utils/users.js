const users = []

const addUser = ({ id, username, room}) =>{
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return {
            error:'Username is in use!'
        }
    }

    //store user
    const user = { id, username, room}
    users.push(user)
    return {user}
}
const removeUser = (id) =>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index !==-1){
        return users.splice(index,1)[0]
    }
}
// addUser({
//     id:22,
//     username:'Ashish',
//     room:'south'
// })
// addUser({
//     id:23,
//     username:'Raikwar',
//     room:'south'
// })
const getUser = (id)=>{
    const index=users.findIndex((user)=>{
        return user.id === id
    })
    if(index !==-1){
        return users[index]
    }
    else{
        return {
            error:'user not found'
        }
    }
}

const getUsersInRoom = (room) =>{
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}
// console.log(getUser(23))
// console.log(getUsersInRoom('south'))

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}