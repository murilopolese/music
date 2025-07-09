import fs from 'fs'
import path from 'path'

function getFileDate(file) {
  let stats = fs.statSync(path.resolve('./music', file))
  return stats.birthtime
}

let files = fs.readdirSync('./music')
// Exclude directories
files = files.filter(f => !fs.lstatSync(path.resolve('./music', f)).isDirectory())
// Exclude empty
files = files.filter(f => f)
// Only include mp3, ogg and webm
files = files.filter(fileName => { // only certain files
  let f = fileName.toLowerCase()
  return f.indexOf('.mp3') !== -1
  || f.indexOf('.ogg') !== -1
  || f.indexOf('.webm') !== -1
})
files.sort(function(fileA, fileB) {
  let dateA = getFileDate(fileA)
  let dateB = getFileDate(fileB)
  return dateB - dateA
})

fs.writeFileSync('./music/db.json', JSON.stringify({files}))
