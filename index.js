const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const moment = require('moment');
const md5 = require('md5');
const Cryptr = require("cryptr")
const crypt = new Cryptr("140533601726")// Secret Key Boleh Diganti

const app = express()
app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}))

const db = mysql.createConnection({
  host:"localhost",
  user:"root",
  password:"",
  database:"rent_car"
})
db.connect(error => {
  if (error) {
    console.log(error.message);
  }else {
    console.log("MySQL Connected");
  }
})
validateToken =() => {
  return (req,res,next)=>{
    //cek keberadaan token
    if(!req.get("Token")){
    //jika Token Tidak ada
    res.json({
      message:"Access Denied"
    })
  }else {
    //tampung nilai token
    let token =req.get("Token")
    //decrypt token menjadi id_user
    let decryptToken =crypt.decrypt(token)
    //sql cek id_user
    let sql ="select * from user where ?"
    //set paramater
    let param ={id_user:decryptToken}
    //run query
    db.query(sql,param,(error,result)=>{
      if(error) throw error
      //cek keberadaan id_user
      if (result.length > 0) {
        //id_user tidak ada
        next()
      }else {
        res.json({
          message:"Token Denied"
        })
      }
    })
  }
  }
}
app.get("/mobil",validateToken(),(req,res)=>{
  let sql = "select * from mobil"
  //run query
  db.query(sql,(error,result)=>{
    let response=null
    if (error) {
      response={
        message:error.message
      }
    }else {
      response={
        count:result.length,
        mobil:result
      }
    }
    res.json(response)
  })
})
// end point untuk mencari mobil sesuai dengan id_mobil
app.get("/mobil/:id",(req,res)=>{
  let data ={
    id_mobil:req.params.id
  }
  let sql="select * from mobil where ? "
  //run query
  db.query(sql,data,(error,result)=>{
    let response=null
    if (error) {
      response={
        message:error.message
      }
    }else {
      let response={
        count:result.length,//jumlah data
        mobil:result //isi mobil
      }
    }
  })
})

//end point menambahkan data
app.post("/mobil",validateToken(),(req,res)=>{
  let data={
    nomor_mobil:req.body.nomor_mobil,
    merk:req.body.merk,
    jenis:req.body.jenis,
    warna:req.body.warna,
    tahun_pembuatan:req.body.tahun_pembuatan,
    biaya_perhari:req.body.biaya_perhari,
    image:req.body.image
  }
  //create sql insert
  let sql="insert into mobil set ?"
  //run query
  db.query(sql,data,(error,result)=>{
    let response= null
    if (error) {
      response={
        message:error.message
      }
    }else {
        response={
        message:result.affectedRows + "data inserted"
      }
    }
    res.json(response) //send response
  })
})

//end-point mengubah data mobil
app.put("/mobil",validateToken(),(req,res)=>{
  let data=[
    {
      nomor_mobil:req.body.nomor_mobil,
      merk:req.body.merk,
      jenis:req.body.jenis,
      warna:req.body.warna,
      tahun_pembuatan:req.body.tahun_pembuatan,
      biaya_perhari:req.body.biaya_perhari,
      image:req.body.image
    },
    //paramater key
    {
      id_mobil:req.body.id_mobil
    }
  ]
  //create sql query update
  let sql="update mobil set ? where ?"
  //run query
  db.query(sql,data,(error,result)=>{
    let response=null
    if (error) {
      response={
        message:error.message
      }
    }else {
      response={
        message:result.affectedRows + "Data Updated"
      }
    }
    res.json(response)
  })
})

//end point menghapus data id_mobil
app.delete("/mobil/:id",validateToken(),(req,res)=>{
  let data={
    id_mobil:req.params.id
  }
  //create query deleted
  let sql = "delete from mobil where ?"
  //run query
  db.query(sql,data,(error,result)=>{
    let response=null
    if (error) {
      response={
        message:error.message
      }
    }else {
      response={
        message:result.affectedRows + "Data Deleted"
      }
    }
    res.json(response)
  })
})
app.post("/user/auth",(req,res)=>{
  let param =[
    req.body.username, //username
    md5(req.body.password) //password
  ]
  // create sql query
  let sql ="select * from user where username = ? and password = ?"
  //run query
  db.query(sql,param,(error,result)=>{
    if(error) throw error
    //cek jumlah data hasil query
    if (result.length > 0) {
      //user tersedia
      res.json({
        message: "Logged",
                token: crypt.encrypt(result[0].id_user), // generate token
                data: result

      })
    }else {
      //user tidak tersedia
      res.json({
        message: "Invalid Usernam/Password"
      })
    }
  })
})
app.listen(8000,() =>{
  console.log("Run on Port 8000");
})
