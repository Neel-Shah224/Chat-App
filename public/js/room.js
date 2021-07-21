const socket = io()

const roomList = document.querySelector('#roomList').innerHTML

socket.on('rooms',(rooms)=>{
    console.log(rooms)

    const html = Mustache.render(roomList , {rooms})
    document.querySelector('#list1').innerHTML =html

})