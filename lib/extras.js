const writeXlsxFile = require('write-excel-file/node')
const fs = require("fs");

module.exports = function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

function pushRow( ROW, type, value) {

    ROW.push({type: [type], value: value,
        fontWeight: 'bold',
        borderStyle : 'thick'
    })
}

module.exports = { pushRow }