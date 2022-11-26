const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const e = require('express');

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
        else console.log("Db (transaction) is alive..")
    })
}

setInterval(keepDBalive, keepidle); // ping to DB every minute


router.post(`/add`, async  (req,res) => {
    //     const BearerToken= req.headers.authorization.split(" ")
    //     const token=BearerToken[1];
    // //    console.log(token)
    //     jwtvalues = jwt.verify(token, secret);
    
    //     if ( jwtvalues.type != 100) { //Admin user only register users
    //         return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
    //     }

    console.log(req.body)
    let sql = "INSERT INTO transactions SET ?";
    
        let query = connection.query(sql, req.body, (err, results)=> {
            if ( !err )
            {
                const data=[req.body.txntype, req.body.employee, req.body.amount]
                const sql=('CALL UPDATE_EMPLOYEE_CASH(?,?,?)')
                console.log(data)
                let query = connection.query(sql, data, (err, results)=> {
                    if (!err)
                    return res.status(200).send( { status: true, message: "Transaction added, employee table updated"} )
                    else
                    return res.status(200).send ({ status: false, message: "Contact ADMIN! Unable to update EMployee table"});})
            }
            else
            { console.log(err.sqlMessage)
                return res.status(200).send( { status: false, message: err.sqlMessage } );
            }
        })
    })

    
router.get(`/id/:id`, async (req, res) => {
    const sql="CALL query_transaction_by_employee(?)";

    connection.query(sql, req.params.id, (err, rows) => {
        if (!err) {
            if ( rows.length>0 )
            { return res.status(200).send( { status: true,
                                             transactions: rows[0]})}
            else { return res.status(200).send( { status: false,
                                                  message: "no transaction added yet!"})}
        } 
        else {
            return res.status(400).send( {  success: false, message:'Failed to fetch transactions!'} );
        }});
})

router.get(`/types`, async (req, res) => {

    connection.query('SELECT * FROM transactiontypes', (err, rows) => {
        if (!err) {
            if ( rows.length>0 )
            { return res.status(200).send( { status: true,
                                             txntypes: rows})}
            else { return res.status(200).send( { status: true,
                                                  message: "no transaction types added yet!"})}
        } 
        else {
            return res.status(400).send( {  success: false, message:'Failed to fetch transaction types!'} );
        }});
})



router.put(`/amend`, async (req, res) => 
{
    console.log(req.body.query)
    const sql = ('call update_transaction_state(?,?)');

    connection.query(sql, req.body.query, (err, results) => {
        if ( err ){
            console.log(err);
            return res.status(200).send( { status: false,
            message: err.sqlMessage});      
        }
        else
        {
            if (results.affectedRows > 0)
            return res.status(200).send({status: true, message :'Transaction State Reconciled'})    
            else
            return res.status(200).send({status: true, message :'Transaction NOT FOUND'})    
        } 
    })

})





module.exports = router;
