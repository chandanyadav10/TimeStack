import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./src/db/connect.js"
import fs from "node:fs"
import { error } from "node:console";
import cookieParser from "cookie-parser";
import errorHandler from "./src/helpers/errorhandler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

//error handler middleware
app.use(errorHandler);


// routes
const routeFiles = fs.readdirSync("./src/routes");

routeFiles.forEach((file)=>{
    // use dyanamic routing 
    import (`./src/routes/${file}`).then((route)=>{
        app.use("/api/v1", route.default);
    }).catch((error)=> {
        console.log("Failed to load route file", error)
    })
})

const server =async () =>{
    try {
        await connect();
      
        app.listen(port,()=>console.log("Server is running on port",port));
        
    } catch (error) {
        console.log("Failed connecting to server",error);
    }
}
server();