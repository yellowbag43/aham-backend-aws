const writeXlsxFile = require('write-excel-file/node')
const fs = require("fs");

const baseUrl = process.env.baseUrl;

module.export = create_excel = ( async (jobdata, query, res) =>{
    let start_date = new Date(query[0]);
    let end_date   = new Date(query[1]);
  
    const distinctNames = [...new Set(jobdata.map(x => x.name))];
    console.log(distinctNames)
    const HEADER_ROW = [
        {
            value: '',
            fontWeight: 'bold',
        },
        {
        value: jobdata[0].jname,
        fontWeight: 'bold',
      }
    ]
  
  let HEADER_ROW2 = [{type: String, value: 'S.No'},{type: String,value: 'Name'}]
    
  // loop for every day
  for (var day = start_date; day <= end_date; day.setDate(day.getDate() + 1)) {
    const dt = strDate(day);
    HEADER_ROW2.push({ type: String, value: dt})
  }
    
    const data = []

    data.push(  HEADER_ROW )
    data.push(  HEADER_ROW2 )

    let sno=1;
    let HEADER_ROWn = []
  
  distinctNames.forEach(value => {
    HEADER_ROWn = [{  type: Number,   value: sno}]
    HEADER_ROWn.push({ type: String, value: value})
  
    for (var day = new Date(query[0]); day <= end_date; day.setDate(day.getDate() + 1)) {
        let logFound=false;
        jobdata.forEach(rec=> {
        const ld = strDate(rec.jobdate); const rd=strDate(day);
        if ( (ld === rd ) &&  ( rec.name === value ) ){ 
            logFound=true;
            HEADER_ROWn.push({ type: Number, value: rec.count})
            }
        })
        if ( !logFound ){
          HEADER_ROWn.push({type: Number, value: null})
          logFound=false;
      }
      }
    data.push(HEADER_ROWn);sno++; 
  })
  
  let total=[0,1]
  for ( let j=2; j<data[2].length; j++) 
       total.push(0);
  
  for ( let i=2 ; i<data.length; i++) {
     for ( let j=2; j<data[i].length; j++) {
      if ( data[i][j].value ){
         total[j]= total[j]+Number(data[i][j].value);}
     }
  }
  
  data.push( [{type: String , value: ''}] )//empty row
  
  let TAIL=[ { type: String, value:''},{ type: String, value:'TOTAL', fontWeight: 'bold'}]
  for(let i=2; i<total.length; i++){
     TAIL.push( {type: Number, value: total[i],         fontWeight: 'bold'    })
  }
  
  data.push(TAIL)

  const fname = jobdata[0].jname;
 // const filename = "public/exports/jobwise-report.xlsx";
  let fileName = fname.split(' ').join('-')+'-'+strDate(new Date(query[0]))+'and'+strDate(new Date(query[1]))+".xlsx";

  columns = [
    {},
    {width: 25},
    {width:10},
    {width:10},
    {width:10},
    {width:10},
    {width:10}
  ]
    await writeXlsxFile(data, {
        columns, // (optional) column widths, etc.
        filePath: "public/exports/"+fileName
    })
  
    return res.status(200).send( { status: true,
      downloadfile: fileName})
  
  })
  