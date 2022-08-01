const express=require("express");
const AWS= require('aws-sdk');
const path=require("path");
const bodyparser=require('body-parser')
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken')
const JWT_TOKEN='qwertyuiop!@#$%^&*()_+'
const { json } = require("body-parser");
const { response } = require("express");
const { error } = require("console");
const app=express();
 require("./dynamo");
 const blocklist=[]


const port=process.env.PORT||3000;

const static_path=path.join(__dirname,"./public");
app.use(express.static(static_path));
app.use(bodyparser.json())

//aws
AWS.config.update({
    region:process.env.AWS_DEFAULT_REGION,
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoClient=new AWS.DynamoDB.DocumentClient();
const TABLE_NAME="Login-Users";
//aws




//register
app.post('/api/register',async(req,res)=>{
    
    const{email,password:plaintext,name,role}=req.body
    //if loops
   
    for( let i = 0; i < name.length; i++){
        if(!isNaN(name.charAt(i)) && !(name.charAt(i) === " ") ){
            res.json({
                message:"Name should be Valid"
            })
            return;
        }
    }

    //password

    let password=req.body.password
    let regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if(!regularExpression.test(password))
    {
        res.json({
            message:"Password should be Valid"
        })
        return;
    }
    let encryptedPwd= await bcrypt.hash(plaintext,5);

        req.body.password=encryptedPwd;

    

    console.log("-------------------------");
    console.log("email:",email);
    console.log("role:",role);
    
    console.log( "password:",password)
    
    res.json({status:'OK'})
    //json

//store in db
    const param={
        TableName:TABLE_NAME,
        Item:req.body
        
    }
    //console.log(req.body);
    await dynamoClient.put(param).promise().then(()=>{
        const body={
            Operation:'SAVE',
            Message:'SUCCESS',
            Item:req.body
        }
        res.json(body);
    },error=>{
        console.error('error occured',error);
    })
})

//login
app.post('/api/login',async(req,res)=>{
    let email=req.body.email;
     let password=req.body.password;
    let role=req.body.role
    let params={
        TableName:TABLE_NAME,
        KeyConditionExpression:"#email = :emailValue",
        ExpressionAttributeNames:{
            "#email":"email"
        },
        ExpressionAttributeValues:{
            ":emailValue":email
        }
    }
   
   


    dynamoClient.query(params, function(err,data){
        if(!err){
            
            let encryptedPwd=data.Items[0].password
            let Arole=data.Items[0].role

            if(role==Arole){
            bcrypt.compare(password,encryptedPwd)
            .then(doMatch=>{
                if(doMatch){
                    const token=jwt.sign({id:email,role:role},JWT_TOKEN,{
                        expiresIn: '10m'
                    })
                    console.log("Token")
                    console.log(token)
                    res.json({
                        "token": token,
                        message:`Welcome ${data.Items[0].name} Please Keep JWT Token`,
                        "status":"OK",
                        data:token,
                        "role":role,
                        "login":true
                    })
                    //urlpassing
                    

                        //urlpassing
                }
                else{
                    // res.send("Wrong credentials")
                    // console.log("invalid data");
                    res.json({
                        message:"Wrong Credentials",
                        "login":false
                    })
                    
                }
            }).catch(err=>{
                console.log("Internal Error with Decryption")
                console.log(err);
            })
            }
            else{

            res.json({

                message:"Your role type is wrong",

                "status":"No"});

            console.log("Given role is invalid..");

        }
        
           
        }
    })
})
//login

//change password
app.post('/api/changepwd',async(req,res)=>{
    const {token,newpassword:newplaintext}=req.body
try{
    const user=jwt.verify(token,JWT_TOKEN)
    

    
    const email=user.id
    
    const password=await bcrypt.hash(newplaintext,10)
    
    const params = {
        TableName: TABLE_NAME,


        Key:{
            "email":email
            
        },
        
        UpdateExpression: "set password = :password",
       
ExpressionAttributeValues: {
            ":password": password

        },
        ReturnValues:"UPDATED_NEW"
    };
    console.log(email);
    console.log("--------------------------------");
    console.log(password);
    console.log("---------------------------------");
    console.log("Decoded",user);
    let updatedpwd=await dynamoClient.update(params).promise()
    console.log(updatedpwd.Attributes.password);
    if(updatedpwd.Attributes.password==password){
        res.json({status:"OK",
        message:"Password changed successfully"
    })
    }else{
        res.json({status:"Failed"})
    }
}
catch(err){
    res.json({status:"Failed"})
    console.log(err);
}
   
})
//change password

//logout
function logout(req,res){
    const token=req.body.token || req.query.token|| req.headers["x-access-token"];
    blocklist.push(token);
    //auth.removeBlocklist();
    console.log('Blocklist')
    console.log(blocklist);
    res.json({
        message:"Log out!"
    })
    
}
//logout




//console.log(path.join(__dirname,"/dynamo"));

app.get("/",(req,res) =>{
    res.send("Hello")
});

app.listen(port,()=>{
    console.log("server is running in port http://localhost:3000");
})
module.exports={
    logout
}