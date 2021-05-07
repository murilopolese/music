const fs = require('fs')

let files = fs.readdirSync('./')
files = files.filter(f => !fs.lstatSync(f).isDirectory())
files = files.filter(f => f)
files = files.filter(fileName => { // only certain files
  let f = fileName.toLowerCase()
  return f.indexOf('.mp3') !== -1
  || f.indexOf('.ogg') !== -1
  || f.indexOf('.webm') !== -1
})
files = files.reverse()

fs.writeFileSync('db.json', JSON.stringify({files}))
