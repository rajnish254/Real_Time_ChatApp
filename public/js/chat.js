const socket = io()//function to connect
//Elements
const $meesageForm = document.querySelector('#message-form')
const $meesageFormInput = $meesageForm.querySelector('input')
const $meesageFormButton = $meesageForm.querySelector('#message-button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoscroll = () =>{
    //new message element
    const $newMessage = $messages.lastElementChild
    //height of new message
    const newMessagesStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessagesStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far Scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight
    if(containerHeight - newMessageHeight<=scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message',(message)=>{
    //console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message);
    const html = Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})  

socket.on('roomData', ({room, users})=>{
    // console.log(room)
    // console.log(users)
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
$meesageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $meesageFormButton.setAttribute('disabled','disabled')
    //disable
    console.log('submit')

    // const message = document.querySelector('input').value
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        $meesageFormButton.removeAttribute('disabled')
        $meesageFormInput.value = ''
        $meesageFormInput.focus()
        //enable
        if(error){
            return console.log(error)
        }
        console.log('message delivered')
    })
})

$sendLocationButton.addEventListener('click',()=>{
   if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')    
   }

   $sendLocationButton.setAttribute('disabled','disabled')

   navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)
        socket.emit('sendLocation',{ 
           latitude: position.coords.latitude,
           longitude: position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('location-delivered')
        })
   })
})

socket.emit('join',{ username, room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

// socket.on('countUpdated',(count)=>{
//     console.log('The count has been updated',count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })