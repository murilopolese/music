const fs = require('fs')

function getFileDate(file) {
  let stats = fs.statSync(file)
  return stats.birthtime
}

let files = fs.readdirSync('./')
// Exclude directories
files = files.filter(f => !fs.lstatSync(f).isDirectory())
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

fs.writeFileSync('db.json', JSON.stringify({files}))

const mobile = `
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>Music</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;1,300;1,400&display=swap');
      :root {
        font-size: 2.5vh;
        --white: #ffffff;
        --darkgrey: #2b2b2b;
        --lightgrey: #dbdbdb;
        --grey1: #323232;
        --grey2: #393939;
        --grey3: #464646;
        --accent: #e07934;
      }
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Rubik', sans-serif;
      }
      body {
        margin: 0;
        background: var(--darkgrey);
        width: 100%;
        display: flex;
        flex-direction: column;
        color: var(--white);
        font-size: 1rem;
      }
      a:link,
      a:visited,
      a:active,
      a:hover {
        text-decoration: none;
        color: var(--white);
      }
      ul {
        list-style: none;
        display: flex;
        flex-direction: column;
      }
      ul li {
        padding: 1rem;
      }
      ul li:hover {
        background: var(--accent);
        cursor: pointer;
      }
      input {
        padding: 1rem;
        border: none;
        outline: none;
        background: var(--grey3);
        color: var(--white);
        font-size: 1rem;
      }
    </style>
    <script>
      const files = ${JSON.stringify(files)}
      function filter(e) {
        let term = e.value
        let items = document.querySelectorAll('ul li')
        if (term) {
          for (let i = 0; i < files.length; i++) {
            let file = files[i]
            let item = items[i]
            if (file.toLowerCase().indexOf(term.toLowerCase()) === -1) {
              item.style.display = 'none'
            } else {
              item.style.display = 'inline-block'
            }
          }
        } else {
          for (let i = 0; i < files.length; i++) {
            let item = items[i]
            item.style.display = 'inline-block'
          }
        }
      }
    </script>
  </head>
  <body>
    <input onchange="filter(this)" onkeyup="filter(this)" type="text">
    <ul>
      ${files.map(f => `<li><a href="${f}">${f}</a></li>`).join('')}
    </ul>
  </body>
</html>
`

fs.writeFileSync('mobile.html', mobile)
