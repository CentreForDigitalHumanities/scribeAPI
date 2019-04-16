var { parseDateString } = require('historical-dates')
var input = process.argv[2]
function parse(text) {
  try {
    var output = parseDateString(text)
    return output ? `${output.year}-${output.month}-${output.day}` : '';
  }
  catch (err) {
    return ''
  }
}

// return the parsed output
console.log(parse(input))
