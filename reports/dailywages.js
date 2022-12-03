const writeXlsxFile = require('write-excel-file/node')
const fs = require("fs");

const baseUrl = process.env.baseUrl;

module.export = create_dailywages = ( async (attendancedata, query, res) =>{
    let start_date = new Date(query[0]);
    let end_date   = new Date(query[1]);
  
    const distinctNames = [...new Set(attendancedata.map(x => x.name))];
    const HEADER_ROW = [
        {
            value: '',
            fontWeight: 'bold',
        },
        {
        value: 'Daily Wages Staff Monthly Salary - '+start_date.toLocaleString('default', { month: 'long'})+' '+start_date.getFullYear(),
        fontWeight: 'bold',
      }
    ]
  
  let TITLE_ROW = [{type: String, value: 'S.No'},{type: String,value: 'Name'}]
    
  // loop for every day
  let col=1;
  for (var day = start_date; day <= end_date; day.setDate(day.getDate() + 1)) {
    TITLE_ROW.push({ type: String, value: 'D'+col})
    col++;
  }
    
    const data = []

    data.push(  HEADER_ROW )
    data.push(  TITLE_ROW )

    let sno=1;
    let RECORDS_ROW = []
  
    distinctNames.forEach(value => {
      RECORDS_ROW = [{  type: Number,   value: sno}]
      RECORDS_ROW.push({ type: String, value: value})
      var row_total = 0;
     for (var day = new Date(query[0]); day <= end_date; day.setDate(day.getDate() + 1)) {
         let logFound=false;
         attendancedata.forEach(rec=> {
         const ld = strDate(rec.date); const rd=strDate(day);
         if ( (ld === rd ) &&  ( rec.name === value ) ){ 
              logFound=true;
              RECORDS_ROW.push({ type: Number, value: rec.salary})
              row_total = Number(row_total) + Number(rec.salary)
             }
            })
         if ( !logFound ){
          RECORDS_ROW.push({type: Number, value: 0})
           logFound=false;
       }
      }
      RECORDS_ROW.push({ type: Number, value: row_total})
      data.push(RECORDS_ROW);sno++; 
      row_total=0;
   })
  
  // let total=[0,1]
  // for ( let j=2; j<data[2].length; j++) 
  //      total.push(0);
  
  // for ( let i=2 ; i<data.length; i++) {
  //    for ( let j=2; j<data[i].length; j++) {
  //     if ( data[i][j].value ){
  //        total[j]= total[j]+Number(data[i][j].value);}
  //    }
  // }
  
  // data.push( [{type: String , value: ''}] )//empty row
  
  // let TAIL=[ { type: String, value:''},{ type: String, value:'TOTAL', fontWeight: 'bold'}]
  // for(let i=2; i<total.length; i++){
  //    TAIL.push( {type: Number, value: total[i],         fontWeight: 'bold'    })
  // }
  
  // data.push(TAIL)

  const fname = "Daily Wages";
 // const filename = "public/exports/jobwise-report.xlsx";
  let fileName = fname.split(' ').join('-')+'-'+strDate(new Date(query[0]))+'and'+strDate(new Date(query[1]))+".xlsx";

  columns = [
    {},
    {width: 25},
    {width:5},
    {width:5},
    {width:5},
    {width:5},
    {width:5}
  ]
    await writeXlsxFile(data, {
        columns, // (optional) column widths, etc.
        filePath: "public/exports/"+fileName
    })
  
    return res.status(200).send( { status: true,
      downloadfile: fileName})

  })
  