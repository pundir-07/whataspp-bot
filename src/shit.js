const fs = require("node:fs")

const pipeStream = fs.createWriteStream("/tmp/node_server_logs")
let i=0
setInterval(()=>{
    pipeStream.write(String(i))
    i++
},1000)