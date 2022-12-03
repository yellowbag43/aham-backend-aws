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

keepDBalive =  () => {
    connection.ping(err=> {
        if (err) console.log("Error with db: "+err)
        else console.log("Db (Report) is alive..")
    })
}

setInterval(keepDBalive, 60000); // ping to DB every minute


router.post(`/register`, async  (req,res) => {
//    const BearerToken= req.headers.authorization.split(" ")
  //  const token=BearerToken[1];
//    console.log(token)
   // jwtvalues = jwt.verify(token, secret);

   // if ( jwtvalues.type != 100) { //Admin user only register users
   //     return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
   // }
    const passwordHash = bcrypt.hashSync(req.body.password,10)

    req.body.password = passwordHash;

//    console.log(req.body)

    let sql = "INSERT INTO users SET ?";

    let query = connection.query(sql, req.body, (err, results)=> {
        if ( !err )
        {
            console.log(results)
            return res.status(200).send( { status: true, message: "New User added!"} )
        }
        else
        { console.log(err);
            return res.status(200).send( { status: false, message: err.sqlMessage } );
        }
    })
})


router.post(`/login`, async (req, res) => {
    let userID = req.body.login.toLowerCase();

    connection.query('SELECT login,password,user_type FROM users WHERE login = ?',[userID], (err, rows) => {
        if (!err) {
            if (rows.length>0) {
            console.log("user exists")
            if (bcrypt.compareSync(req.body.password, rows[0].password)) {
                const JWTtoken = jwt.sign(
                    {
                        userId : userID,
                        type   : rows[0].user_type
                    },
                    secret,   //secret key
                    {
                        expiresIn : "1h"
                    }
                )
                console.log("user authentication success")

                return res.status(200).send( { status: true, message: "Login Authentication", key: JWTtoken} );
            }
            else {                console.log("user authentication Failed, Failed Failed")
                return res.status(200).send( {  status: false, message:'Authentication Failed   '} );
            };            
            }
            else {
                return res.status(200).send( {  success: false, message:'Invalid User'} );
            } 
        }});
})


router.put(`/amend`, async (req, res) => {
    console.log("BODY "+req.body.state)
    connection.query('SELECT user_type,email,mobile,address,area,state,zip FROM users WHERE ID = ?',[req.body.ID], (err, rows) => {
        if (!err) {
            if ( rows.length>0){
                       
                const data = {
                    user_type : (req.body.user_type) ? req.body.user_type : rows[0].user_type,
                    email     : (req.body.email)    ? req.body.email: rows[0].email,
                    mobile    : (req.body.mobile)    ? req.body.mobile: rows[0].mobile,
                    address   : (req.body.address)  ? req.body.address: rows[0].address,
                    area      : (req.body.area)     ? req.body.area: rows[0].area,
                    state     : (req.body.state)    ? req.body.state: rows[0].state,
                    zip       : (req.body.zip)    ? req.body.zip: rows[0].zip
                }
                
                let sql = "UPDATE users SET user_type="+data.user_type+",\
                                            email='"+ data.email+ "',\
                                            mobile='"+data.mobile+"',\
                                            address='"+data.address+"',\
                                            area='"+data.area+"',\
                                            state='"+data.state+"',\
                                            zip='"+data.zip+"'\
                                            WHERE ID="+req.body.ID ;

                connection.query(sql, data, (err, results) => {
                    if ( err ){
                        console.log(err);
                        return res.status(400).send( { status: false,
                        message: err.sqlMessage});      
                    }
                    else
                    {
                        return res.status(200).send({status: true, message : 'User proflie updated Successfully!'})    
                    } 
                })
            }
            else{
                return res.status(400).send( {  success: false, message:'INVALID USER! Cannot Update User'} );
            }
        } 
        else 
        {
            return res.status(400).send( {  success: false, message:'ERROR! Cannot Update User'} );
        }
    });
})


router.get(`/all`, async (req, res) => {
//    const BearerToken= req.headers.authorization.split(" ")
  //  const token=BearerToken[1];
//    console.log(token)
  //  jwtvalues = jwt.verify(token, secret);

  //  if ( jwtvalues.type != 100) { //Admin user only register users
   //     return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
   // }

    connection.query('SELECT b.*, a.category FROM users as b INNER JOIN usercategory as a ON (b.user_type = a.ID);', (err, rows) => {
        if (!err) {
            if ( rows.length>0 )
            { return res.status(200).send( { status: true,
                                             users: rows})}
            else { return res.status(200).send( { status: false,
                                                  message: "no Users added yet!"})}
        } 
        else {
            return res.status(400).send( {  success: false, message:'Failed to fetch users!'} );
        }});
})

router.get(`/get/:id`, async (req, res) => {
    //    const BearerToken= req.headers.authorization.split(" ")
      //  const token=BearerToken[1];
    //    console.log(token)
      //  jwtvalues = jwt.verify(token, secret);
    
      //  if ( jwtvalues.type != 100) { //Admin user only register users
       //     return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
       // }
    
        connection.query('SELECT b.*, a.category FROM users as b INNER JOIN usercategory as a ON (b.user_type = a.ID) WHERE b.ID='+req.params.id, (err, rows) => {
            if (!err) {
                if ( rows.length>0 )
                { return res.status(200).send( { status: true,
                                                 user: rows[0]})}
                else { return res.status(200).send( { status: false,
                                                      message: "no Users added yet!"})}
            } 
            else {
                return res.status(400).send( {  success: false, message:'Failed to fetch users!'} );
            }});
    })
    

router.get(`/getcategory`, async (req, res) => {
    connection.query('SELECT * FROM usercategory', (err, rows) => {
        if (!err) {
            if ( rows.length>0 )
            { return res.status(200).send( { status: true,
                                             users: rows})}
            else { return res.status(200).send( { status: true,
                                                  message: "no Users added yet!"})}
        } 
        else {
            return res.status(400).send( {  success: false, message:'Failed to fetch users!'} );
        }});
})

router.delete(`/delete`, async  (req,res) => {
//     const BearerToken= req.headers.authorization.split(" ")
//     const token=BearerToken[1];
// //    console.log(token)
//     jwtvalues = jwt.verify(token, secret);

//     if ( jwtvalues.type != 100) { //Admin user only register users
//         return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
//     }
    
    let sql = "DELETE FROM users WHERE login='"+req.body.login+"'";

    let query = connection.query(sql,(err, results) => {
        if (!err)
        {
            return res.status(200).send( {status : results })
        }
        else
            return res.status(400).send( { status : err.sqlMessage })
    })
})

router.delete(`/:id`, async  (req,res) => {
    //     const BearerToken= req.headers.authorization.split(" ")
    //     const token=BearerToken[1];
    // //    console.log(token)
    //     jwtvalues = jwt.verify(token, secret);
    
    //     if ( jwtvalues.type != 100) { //Admin user only register users
    //         return res.status(200).send( { status: 'Access Denied for non-Admin Users' } );
    //     }
        
        let sql = "DELETE FROM users WHERE ID='"+req.params.id+"'";
    
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
