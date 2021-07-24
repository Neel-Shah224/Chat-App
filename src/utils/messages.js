const generateMessage = (username,text) => {
    return {
        text,
        createdAt: new Date().getTime(),
        username
    }
}

const generateLocationMessage = (username,url) =>{
    return {
        url,createdAt:new Date().getTime(),
        username
    }
}
const  generateImageMessage = (username, image) =>{
    return {
        username , src:image ,
        createdAt: new Date().getTime()
    }
}
module.exports = {
    generateMessage , generateLocationMessage ,generateImageMessage
}
