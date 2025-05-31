import dotenv from "dotenv"
import {app} from './app.js'
import connectDB from "./db/index.js"

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log("Server is Running")
    })
}).catch((err)=>{
console.log("MongoDb connection failed!!!")
})

export default app;