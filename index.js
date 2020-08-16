const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const moment = require('moment');

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

app.get("/mobil",(req,res)=>{
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
app.post("/mobil",(req,res)=>{
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
app.put("/mobil",(req,res)=>{
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
app.delete("/mobil/:id",(req,res)=>{
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
app.listen(8000,() =>{
  console.log("Run on Port 8000");
})
