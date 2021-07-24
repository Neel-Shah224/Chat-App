const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#message-location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const ImageTemplate = document.querySelector('#image-message-template').innerHTML
//Option
const {username ,room } = Qs.parse(location.search, {ignoreQueryPrefix:true})


socket.emit('join',{username,room},(error) => {
    if(error){
        alert(error)
        location.href='/'
    }
})

const autoscroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible Height
    const visibleHeight = $messages.offsetHeight
    
    //height of messages container
    const containerHeight = $messages.scrollHeight

    //How far i have Scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('locationMessage', (message) =>{
    console.log(message)
    const html = Mustache.render(locationTemplate , {
        username:message.username,
        url:message.url , 
        createdAt: moment(message.createdAt).format('h:mm a')})
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('message',(msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate,{
        username:msg.username,
        msg: msg.text,
        createdAt:moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})

socket.on('renderImage',(msg)=>{
    const html = Mustache.render(ImageTemplate , {
        username:msg.username,
        src: msg.src,
        createdAt:moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const msg = e.target.elements.message.value
   
    socket.emit('sendMessage',msg, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message Delivered Successfully!!')
    })
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render( sidebarTemplate , {
        room , users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$sendLocationButton.addEventListener( 'click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition( (position)=> {
        
        socket.emit('sendLocation',
        {latitude:position.coords.latitude,longitude:position.coords.longitude},
        (error , ack)=>{
            $sendLocationButton.removeAttribute('disabled')
            if(error){
                return console.log(error)
            }
            console.log(ack)
        })
    })
})


const inpFile = document.getElementById("inpFile");
const previewContainer = document.getElementById("imagePreview")
const previewImage = previewContainer.querySelector(".image-preview__image")
const previewDefaultText = previewContainer.querySelector(".image-preview__default-text")
const sendImage = previewContainer.querySelector(".sendImage")
const cancelImage = previewContainer.querySelector("#cancelImage")
var image = null
inpFile.addEventListener("change", function() {
    
    
    const file = this.files[0]
    if(file){
        const reader = new FileReader()
        previewContainer.style.display="block"
        previewDefaultText.style.display = "none"
        previewImage.style.display = "block"

        reader.addEventListener("load", function(){ 
            console.log(this)
            previewImage.setAttribute("src",this.result)
            image = this.result
        })
       
        reader.readAsDataURL(file);
    }
})

function sendMyImage(){
    console.log("check1")
    if(image){
        console.log("sending...")
        socket.emit('sendImage',image)
    }
    previewContainer.style.display= "none"
}

function cancelImageSend(){
    console.log("sending image cancel...")
    image=null;
    previewContainer.style.display= "none"
}