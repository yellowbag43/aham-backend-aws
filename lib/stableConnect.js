//this code is for conenct to db
const mysql = require('mysql2');
require('dotenv').config();

let pool = mysql.createConnection( {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


keepDBalive =  () => {
    pool.ping(err=> {
        if (err) console.log("Error with db: "+err)
        else console.log("Db is alive..")
    })
}

setInterval(keepDBalive, 600000); // ping to DB every minute


// module.exports.stablishedConnection = ()=>{
// return new Promise((resolve,reject)=>{
//   const con = mysql.createConnection( {
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME
//   });
//   con.connect((err) => {
//     if(err){
//       reject(err);
//     }
//     resolve(con);
//   });
  
// })
// }

// module.exports.closeDbConnection =(con)=> {
//   con.destroy();
// }