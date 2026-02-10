const http=require("http") //built in module called http
const app=require("./src/app"); //importing the express app that we have created in the app.js file
const PORT=6000; //As we know frontend lives in 30000 adress and backened lives in 50000 adress
const server =http.createServer(app); //connects http server and express app
server.listen(PORT,()=>{console.log(`The server is runnign in the port ${PORT}`)});



