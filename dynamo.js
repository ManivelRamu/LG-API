const { DynamoDB } = require('aws-sdk');
const AWS= require('aws-sdk');
const express=require("express");
require('dotenv').config();
const router=express.Router();



AWS.config.update({
    region:process.env.AWS_DEFAULT_REGION,
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoClient=new AWS.DynamoDB.DocumentClient();
const TABLE_NAME="Login-Users";
console.log("connection successful");
console.log("-------------------------");


// router.post('/api/register',async(req,res)=>{
//     const{email,password:plaintext}=req.body
//     const password=await bcrypt.hash(plaintext,10)
//     const param={
//         TableName:TABLE_NAME,
//         Items:req.body
//     }
//     await dynamoClient.put(param).promise().then(()=>{
//         const body={
//             Operation:'SAVE',
//             Message:'SUCCESS',
//             Items:req.body
//         }
//         res.json(body);
//     },error=>{
//         console.error('error occured',error);
//     })
    
// })