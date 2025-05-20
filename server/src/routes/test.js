import express from "express";

const testRouter = express.Router();

testRouter.get("/test", (req, res)=>{
    res.send("this thi test router")
});

export default testRouter;