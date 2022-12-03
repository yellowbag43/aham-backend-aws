const writeXlsxFile = require('write-excel-file/node')
const fs = require("fs");
const extras = require( '../lib/extras')

const baseUrl = process.env.baseUrl;

module.export = direct_job_salary = ( async (rep_month, salarydata, query, res) =>{

  const distinctNames = [...new Set(salarydata.map(x => x.name))];
  console.log(distinctNames)

    const HEADER_ROW = [
        {
            value: '',
            fontWeight: 'bold',
        },
        {
        value: salarydata[0].type+rep_month.toLocaleString('default', { month: 'long'})+' '+rep_month.getFullYear(),
        fontWeight: 'bold',
      }
    ]
  
  let TITLE_ROW = [{type: String, value: 'S.No', fontWeight: 'bold'},{type: String,value: 'Name', fontWeight: 'bold'}]
  
  TITLE_ROW.push({type: String, value: 'Salary', fontWeight: 'bold'},{type: String,value: 'Debit', fontWeight: 'bold'})
  TITLE_ROW.push({type: String,value: 'Balance Cash', fontWeight: 'bold'})
  
  let sno=1;
  let RECORDS_ROW = []
  const data = []
  data.push(  HEADER_ROW )
  data.push(  TITLE_ROW )

  RECORDS_ROW = []
  let total=0;
  let grand_total=0;


  var rowTotal=0;

  distinctNames.forEach(value => {
    let salary=0;
    let debit=0;
    salarydata.forEach(element => {
      if ( value === element.name) {
        if ( element.status===0){
          salary = salary + element.salary;
          debit = element.cashadvance;
        }
      }
    })
    RECORDS_ROW = [{  type: Number,   value: sno}]
    RECORDS_ROW.push({  type: String,   value: value});
    RECORDS_ROW.push({  type: Number,   value: salary});
    RECORDS_ROW.push({  type: Number,   value: debit});
    RECORDS_ROW.push({  type: Number,   value: salary-debit});
    rowTotal = rowTotal+(salary-debit)
    data.push(RECORDS_ROW)
    sno++;
  })


  RECORDS_ROW = [{  type: String,   value: ''}]
  RECORDS_ROW.push({  type: String,   value: ''});
  RECORDS_ROW.push({  type: String,   value: ''});
  RECORDS_ROW.push({  type: String,   value: ''});

  RECORDS_ROW.push({  type: Number,   value: rowTotal,  fontWeight: 'bold', borderStyle : 'thick'});
  data.push(RECORDS_ROW)

  const fname = "Direct Job Salary";
  let fileName = fname.split(' ').join('-')+'-'+strDate(new Date(query[0]))+'and'+strDate(new Date(query[1]))+".xlsx";

  columns = [
    {},
    {width: 25},
    {width:15},
    {width:15},
    {width:15},
    {width:15},
    {width:15}
  ]
    await writeXlsxFile(data, {
        columns, // (optional) column widths, etc.
        filePath: "public/exports/"+fileName,
        sheet: 'Monthly Salary (Without - PF)'
    })

    console.log("Download from "+fileName)
    return res.status(200).send( { status: true, message: fileName})
  })
  