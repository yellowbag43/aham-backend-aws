//this code is for conenct to db

keepDBalive =  (connection) => {
    connection.ping(err=> {
        if (err) console.log("Error with db: "+err)
        else console.log("Db (transaction) is alive..")
    })
}




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