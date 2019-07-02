var fs = require('fs')

function dateToString(date) {
  if (!date) { return 'unknown' }
  return `${date.year}-${date.month}-${date.day}`
}

function toRow(text, type, gregorianDate) {
  return [text, type || 'unknown', dateToString(gregorianDate)].join(',')
}

function extractRoman(jsonPath) {
  fs.readFile(jsonPath, 'utf8', function (err, contents) {
    const data = JSON.parse(contents)
    const subjects = data.subjects
    for (const subject of subjects) {
      for (const assertion of subject.assertions) {
        if (assertion.task_key === 'sk_date') {
          console.log(toRow(
            assertion.data.value.text,
            assertion.data.value.type,
            assertion.data.value.calendar === 'julian' ? assertion.data.value.julianDate : assertion.data.value.gregorianDate))
        }
      }
    }
  })
}

console.log('text,type,parsed')
fs.readdir('.', (err, files) => {
  files.forEach(file => {
    if (/\.json$/.test(file)) {
      extractRoman(file)
    }
  })
})
