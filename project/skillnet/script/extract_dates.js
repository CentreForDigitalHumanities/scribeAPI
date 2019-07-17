var fs = require('fs')
var { parseDateString } = require('historical-dates')

function dateToString(date) {
  if (!date) { return 'unknown' }
  return `${date.year}-${date.month}-${date.day}`
}

function toRow(text, type, gregorianDate) {
  return [escapeCell(text), type || 'unknown', dateToString(gregorianDate)].join(',')
}

function escapeCell(text) {
  if (/[",]/.test(text)) {
    return `"${text.replace('"', '""')}"`
  }
  return text
}

async function extractRoman(jsonPath) {
  await new Promise((resolve) => fs.readFile(jsonPath, 'utf8', function (err, contents) {
    const data = JSON.parse(contents)
    const subjects = data.subjects
    for (const subject of subjects) {
      for (const assertion of subject.assertions) {
        if (assertion.task_key === 'sk_date') {
          var date = assertion.data.value.calendar === 'julian' ? assertion.data.value.julianDate : assertion.data.value.gregorianDate
          if (!date) {
            try {
              date = parseDateString(assertion.data.value.text)
            }
            catch (err) {
              // couldn't parse this date
              console.log(err)
            }
          }
          values[toRow(
            assertion.data.value.text,
            assertion.data.value.type,
            date)] = true
        }
      }
    }
    resolve()
  }))
}

var values = {}

async function main() {
  // async function do(d) {
  return new Promise((resolve) => {
    fs.readdir('.', async (err, files) => {
      await Promise.all(files.map(file => {
        if (/\.json$/.test(file)) {
          return extractRoman(file)
        }
      }))

      fs.writeFile('export_dates.csv', `text,type,parsed\n${Object.keys(values).sort().join('\n')}\n`, (err) => err && console.error(err))
      resolve()
    })
  })
}

main()
