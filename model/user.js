const AWS= require('aws-sdk');
require('dotenv').config();

AWS.config.update({
    region:process.env.AWS_DEFAULT_REGION,
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
});
const dynamoClient=new AWS.DynamoDB.DocumentClient();
const TABLE_NAME="Login-1";

const getChar=async ()=>{
    const params ={
        TableName:TABLE_NAME
    };
    const characters=await dynamoClient.scan(params).promise();
    console.log(characters);
    return characters;
};
const add=async(character)=>{
    const params={
        TableName:TABLE_NAME,
        Item:character,
    };
    return await dynamoClient.put(params).promise();
    console.log("connection success");
};
// console.log("connection success");
//getChar();

// const inp={
    
    
//     "email":"levi@gmail.com",
//     "ID":"100",

// };
//add(inp);



//getChar();
