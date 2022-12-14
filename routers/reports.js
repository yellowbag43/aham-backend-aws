const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const lib = require('../reports/jobwise');
require('../reports/salarywithoutPF');
require('../reports/dailywages')
require('../reports/directjobsalary')
require('dotenv/config')

const secret = process.env.secret;
const keepidle = process.env.keepidleInterval;

let connection = mysql.createConnection( {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

keepDBalive =  () => {
  connection.ping(err=> {
      if (err) console.log("Error with db: "+err)
      else console.log("Db (report) is alive..")
  })
}

setInterval(keepDBalive, keepidle); // ping to DB every minute


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

router.post(`/jobwise`, async  (req,res) => {
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

router.post(`/dailywages`, async  (req,res) => {
  console.log(req.body.query)
  const sql=("CALL dailywages_report (?,?,?)")

  connection.query(sql, req.body.query, (err, rows) => {
      if (!err) {
          console.log("fetched "+rows[0].length)
          if ( rows[0].length>0 )
          { 
            create_dailywages(rows[0], req.body.query, res)
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

router.post(`/directsalarycash`, async  (req,res) => {
  console.log(req.body.query)
  const sql=("CALL directjob_salary_cash (?,?,?,?,?)")

  connection.query(sql, req.body.query, (err, rows) => {
      if (!err) {
          console.log("fetched "+rows[0].length)
          if ( rows[0].length>0 )
          { 
            create_dailywages(rows[0], req.body.query, res)
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

router.post(`/salary`, async  (req,res) => {
  
  console.log(req.body.query)
  const ddate = new Date(req.body.query[0])

  let sql=("CALL salary_report (?,?,?,?,?)")
  if ( req.body.query[2] === 91 )
   sql = 'CALL directjob_salary_cash (?,?,?,?,?)'

  connection.query(sql, req.body.query, (err, rows) => {
     if (!err) { console.log("SQL success "+rows.length)
          if ( rows[0].length>0 )
           { 
              if ( req.body.query[2]===91)
                direct_job_salary(ddate, rows[0], req.body.query, res)
              else
                create_salary_report(ddate, rows[0], req.body.query, res);
           }
           else 
           { 
            return res.status(200).send( { status: true, mesasge: 'DATA not available', downloadfile: "DATA not available"})
          }
       } 
       else {
        console.log(err)
         return res.status(200).send( { status: false,
           message: err})
       }
     })
})

strDate = (ddate) => {
  return ddate.getFullYear()+'-'+Number(ddate.getMonth()+1)+'-'+ddate.getDate();
}

module.exports = router;
