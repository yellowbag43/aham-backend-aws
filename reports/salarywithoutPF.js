const writeXlsxFile = require('write-excel-file/node')
const fs = require("fs");
const extras = require( '../lib/extras')

const baseUrl = process.env.baseUrl;

module.export = create_salary_report = ( async (rep_month, salarydata, query, res) =>{
    const HEADER_ROW = [
        {
            value: '',
            fontWeight: 'bold',
        },
        {
        value: 'Staff (Without PF)Monthly Salary - '+rep_month.toLocaleString('default', { month: 'long'})+' '+rep_month.getFullYear(),
        fontWeight: 'bold',
      }
    ]
  
  let TITLE_ROW = [{type: String, value: 'S.No', fontWeight: 'bold'},{type: String,value: 'Name', fontWeight: 'bold'}]
  
  TITLE_ROW.push({type: String, value: 'Salary', fontWeight: 'bold'},{type: String,value: 'Debit', fontWeight: 'bold'})
  TITLE_ROW.push({type: String, value: 'Deduction', fontWeight: 'bold'},{type: String,value: 'Add', fontWeight: 'bold'})
  TITLE_ROW.push({type: String,value: 'Balance Cash', fontWeight: 'bold'})
  
  let sno=1;
  let RECORDS_ROW = []
  const data = []
  data.push(  HEADER_ROW )
  data.push(  TITLE_ROW )

  RECORDS_ROW = []
  let total=0;
  let grand_total=0;

  salarydata.forEach(element => {
    let row_total = element.salary+element.incentive;
    row_total = row_total - element.cashadvance;

    RECORDS_ROW = [{  type: Number,   value: sno}]
    RECORDS_ROW.push({  type: String,   value: element.name});
    RECORDS_ROW.push({  type: Number,   value: element.salary});
    RECORDS_ROW.push({  type: Number,   value: ''});
    RECORDS_ROW.push({  type: Number,   value: element.cashadvance});
    RECORDS_ROW.push({  type: Number,   value: element.incentive});
    RECORDS_ROW.push({  type: Number,   value: row_total});
    data.push(RECORDS_ROW)
    sno++;
    grand_total = grand_total + row_total;
  });

  RECORDS_ROW = [{  type: String,   value: ''}]
  RECORDS_ROW.push({  type: String,   value: ''});
  RECORDS_ROW.push({  type: String,   value: ''});
  RECORDS_ROW.push({  type: String,   value: ''});
  RECORDS_ROW.push({  type: String,   value: ''});
  RECORDS_ROW.push({  type: String,   value: ''});

  RECORDS_ROW.push({  type: Number,   value: grand_total,  fontWeight: 'bold', borderStyle : 'thick'});
  data.push(RECORDS_ROW)

  const fname = "Salary Wages";
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
  