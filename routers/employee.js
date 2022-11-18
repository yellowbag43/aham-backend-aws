const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const e = require('express');

require('dotenv/config')

const secret = process.env.secret;

let connection = mysql.createConnection( {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


router.post(`/add`, async  (req,res) => {
//     const BearerToken= req.headers.authorization.split(" ")
//     const token=BearerToken[1];
// //    console.log(token)
//     jwtvalues = jwt.verify(token, secret);

//     if ( jwtvalues.type != 100) { //Admin user only register users
//         return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
//     }

    let sql = "INSERT INTO employees SET ?";

    let query = connection.query(sql, req.body, (err, results)=> {
        if ( !err )
        {
            console.log(results)
            return res.status(200).send( { status: true, message: "Employee Added Successfully"} )
        }
        else
        { console.log(err)
            return res.status(200).send( { status: false, message: err.sqlMessage } );
        }
    })
})


router.put(`/amend`, async (req, res) => {
    let employeeID = req.body.ID;
    console.log("email "+req.body.email)

    connection.query('SELECT * FROM employees WHERE ID = ?',[employeeID], (err, rows) => {
        if (!err) {
            if ( rows.length>0){
                       
                const data = {
                    name    : (req.body.name)      ? req.body.name    : rows[0].name,
                    gender  : (req.body.gender)    ? req.body.gender  : rows[0].gender,
                    dob     : (req.body.dob)       ? req.body.dob     : rows[0].dob,
                    type    : (req.body.type)      ? req.body.type    : rows[0].type,
                    mobile  : (req.body.mobile)    ? req.body.mobile  : rows[0].mobile,
                    email   : (req.body.email)     ? req.body.email   : rows[0].email,
                    address : (req.body.address)   ? req.body.address : rows[0].address,
                    area    : (req.body.state)     ? req.body.area    : rows[0].area,
                    state   : (req.body.state)     ? req.body.state   : rows[0].state,
                    zip     : (req.body.zip)       ? req.body.zip     : rows[0].zip,
                }
                
                let sql = "UPDATE employees SET type="+data.type+",\
                                                name='"+data.name+"', \
                                                gender="+ data.gender+ ",\
                                                dob='"+ data.dob+ "',\
                                                mobile='"+ data.mobile+ "',\
                                                email='"+ data.email+ "',\
                                                address='"+data.address+"', \
                                                area='"+data.area+"', \
                                                state='"+data.state+"', \
                                                zip='"+data.zip+"' \
                                                WHERE ID="+employeeID;

                connection.query(sql, data, (err, results) => {
                    if ( err ){
                        console.log(err);
                        return res.status(400).send( { status: false,
                        message: err.sqlMessage});      
                    }
                    else
                    {
                        return res.status(200).send({status: 'Employee proflie updated Successfully!',
                        message: results})    
                    } 
                })
            }
            else{
                return res.status(400).send( {  success: false, message:'INVALID Employee! Cannot Update Employee'} );
            }
        } 
        else 
        {
            return res.status(400).send( {  success: false, message:'ERROR! Cannot Update Employee'} );
        }
    });
})


router.get(`/all`, async (req, res) => {
//    const BearerToken= req.headers.authorization.split(" ")
//    const token=BearerToken[1];
//    console.log(token)
 //   jwtvalues = jwt.verify(token, secret);

  //  if ( jwtvalues.type != 100) { //Admin user only register users
   //     return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
   // }
    connection.query('select b.*, a.type as typestr FROM employees as b INNER JOIN employeecategory as a ON (b.type = a.ID)', (err, rows) => {
        if (!err) {
            if ( rows.length>0 )
            { return res.status(200).send( { status: true,
                                             employees: rows})}
            else { return res.status(200).send( { status: true,
                                                  message: "no Employees added yet!"})}
        } 
        else {
            return res.status(400).send( {  success: false, message:err.sqlMessage} );
        }});
})

router.get(`/get/:id`, async (req, res) => {
    //    const BearerToken= req.headers.authorization.split(" ")
    //    const token=BearerToken[1];
    //    console.log(token)
     //   jwtvalues = jwt.verify(token, secret);
    
      //  if ( jwtvalues.type != 100) { //Admin user only register users
       //     return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
       // }
         connection.query('select b.*, a.type FROM employees as b INNER JOIN employeecategory as a ON (b.type = a.ID) WHERE b.ID='+req.params.id, (err, rows) => {
            if (!err) {
                if ( rows.length>0 )
                { return res.status(200).send( { status: true,
                                                 employee: rows[0]})}
                else { return res.status(200).send( { status: true,
                                                      message: "Employees Not found for this ID "+req.params.id})}
            } 
            else {
                return res.status(200).send( {  success: false, message:err.sqlMessage} );
            }});
    })
    
router.get(`/getcategory`, async (req, res) => {
    // const BearerToken= req.headers.authorization.split(" ")
    // const token=BearerToken[1];
    // jwtvalues = jwt.verify(token, secret);

    // if ( jwtvalues.type != 100) { //Admin user only register users
    //     return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
    // }

    connection.query('SELECT * FROM employeecategory', (err, rows) => {
        if (!err) {
            if ( rows.length>0 )
            { return res.status(200).send( { status: true,
                                             employeecategories: rows})}
            else { return res.status(200).send( { status: true,
                                                  message: "no Employees added yet!"})}
        } 
        else {
            return res.status(200).send( {  status: false, message:'Failed to fetch employee!'} );
        }});
})


router.delete(`/delete`, async  (req,res) => {
    const BearerToken= req.headers.authorization.split(" ")
    const token=BearerToken[1];
//    console.log(token)
    jwtvalues = jwt.verify(token, secret);

    if ( jwtvalues.type != 100) { //Admin user only register users
        return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
    }
    
    let sql = "DELETE FROM employees WHERE ID='"+req.body.ID+"'";

    let query = connection.query(sql,(err, results) => {
        if (!err)
        {
            return res.status(200).send( {status : results })
        }
        else
            return res.status(400).send( { status : err.sqlMessage })
    })
})



router.put(`/amendstatus`, async  (req,res) => {
    //     const BearerToken= req.headers.authorization.split(" ")
    //     const token=BearerToken[1];
    // //    console.log(token)
    //     jwtvalues = jwt.verify(token, secret);
    
    //     if ( jwtvalues.type != 100) { //Admin user only register users
    //         return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
    //     }
        console.log("bdy"+req.body.ID)
        let sql = "UPDATE employees SET type= 90 WHERE ID='"+req.body.ID +"'"    
        let query = connection.query(sql,(err, results) => {
            if (!err)
            {
                return res.status(200).send( {status : true, message: results })
            }
            else
                return res.status(400).send( { status : false, message: err.sqlMessage })
        })
    })
    


module.exports = router;
