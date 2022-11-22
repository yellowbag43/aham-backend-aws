const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const lib = require('../lib/jobwise');

require('dotenv/config')

const secret = process.env.secret;

let connection = mysql.createConnection( {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


router.get(`/download/:filename`, async  (req,res) => {
    const fileName = req.params.filename;
    const directoryPath = "public/exports/";
  
    res.download(directoryPath + fileName, fileName, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
    })
})


router.post(`/excelschema`, async  (req,res) => {
  console.log(req.body.query)
  const sql=("CALL fetch_joblog_dates (?,?,?)")

  connection.query(sql, req.body.query, (err, rows) => {
      if (!err) {
          console.log("fetched "+rows[0].length)
          if ( rows[0].length>0 )
          { 
              create_excel(rows[0], req.body.query, res);
          }
          else { return res.status(200).send( { status: false,
                                                message: "No Records Found! Unable to create Report! "})}
      } 
      else {
        return res.status(200).send( { status: false,
          message: err})
      }
    })
  }
)
 
strDate = (ddate) => {
  return ddate.getFullYear()+'-'+Number(ddate.getMonth()+1)+'-'+ddate.getDate();
}

module.exports = router;