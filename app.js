const express= require("express");
const app = express();

app.get("/",(req,res)=>{
    res.send("Starting the major project");
})
app.listen(8080,(req,res)=>{
    console.log("server started.");
});