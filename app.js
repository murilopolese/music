import { render, html } from 'https://cdn.jsdelivr.net/npm/lit-html@1.4.1/lit-html.min.js'

// UTILITIES
function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function filterMusic(music) {
  if (state.searchTerm.trim() === '') return true
  return music.toLowerCase().indexOf(state.searchTerm.toLowerCase()) !== -1
}

class Emitter extends EventTarget {
  on(eventName, callback) {
  	this.addEventListener(eventName, callback)
  }
  emit(eventName, args) {
  	const e = new CustomEvent(eventName, { detail: args })
  	this.dispatchEvent(e)
  }
}

// STATE AND EVENT EMITTER
const emitter = new Emitter()
const state = {
  music: null,
  shuffle: false,
  repeat: false,
  active: null,
  audio: null,
  playing: false,
  searchTerm: '',
  cursorUpdate: 0
}

// COMPONENTS
const ControlButton = function(opts, children) {
  const {
    active = false,
    click = () => console.log('clicked')
  } = opts
  return html`
    <button
      class="control-button"
      data-active=${active}
      @click=${click}
      >
      ${children}
    </button>
  `
}

const MusicItem = function(opts) {
  const {
    title = 'Undefined',
    active = false,
    playing = false,
    click = () => console.log('clicked')
  } = opts
  return html`
    <div class="music-item" @click=${click} data-active=${active}>
      <div class="play">${playing ? 'll' : '►'}</div>
      <div class="title">${title.replace('-', '\n')}</div>
    </div>
  `
}

const Cursor = function(opts) {
  const { audio } = opts
  let normalTime = 0;
  if (audio) {
    normalTime = map(audio.currentTime, 0, audio.duration, 0, 1)
  }
  return html`
    <div
    class="cursor"
    style="width: ${normalTime*100}%"
    ></div>
  `
}

const App = function(state, emit) {
  if (!state.music) {
    emit('loadmusic')
    return html`<body>Loading...</body>`
  }
  return html`
    <body>
      <div id="app">
        <ul id="toolbar" class="row space-between space-tight">
          <li id="search">
            <input
              type="text"
              placeholder="Search"
              @keyup=${(e) => emit('updatesearchtearm', e.target.value)}
              @change=${(e) => emit('updatesearchtearm', e.target.value)}
              />
          </li>
          <li>
            <ul id="controls" class="row">
              <li>
                ${ControlButton(
                  { click: () => emit('shuffleplay' ) },
                  '↯'
                )}
              </li>
            </ul>
          </li>
        </ul>
        <div id="scroll" @click=${(e) => emit('seek', e)}>
          ${Cursor({
            audio: state.audio,
            click: (e) => emit('seek', e)
          })}
        </div>
        <ul id="music-list">
          ${state.music.filter(filterMusic).map(
            (music) => MusicItem({
              title: music,
              active: state.active === music,
              playing: state.active === music && state.playing,
              click: () => {
                if (state.active === music && !state.audio.paused) {
                  emit('pause', music)
                } else {
                  emit('play', music)
                }
              }
            })
          )}
        </ul>
      </div>
    </body>
  `
}

// EVENT HANDLERS
emitter.on('loadmusic', () => {
  fetch('/db.json')
    .then(r => r.json())
    .then(({files}) => {
      state.music = files
      emitter.emit('render')
    })
})
emitter.on('togglerepeat', () => {
  state.repeat = !state.repeat
  emitter.emit('render')
})
emitter.on('toggleshuffle', () => {
  state.shuffle = !state.shuffle
  emitter.emit('render')
})
emitter.on('play', (e) => {
  if (state.playing) {
    state.audio.pause()
  }
  if (e.detail !== state.active) {
    state.active = e.detail
    const i = state.music.findIndex(m => m === state.active)
    state.audio = new Audio(state.music[i])
    state.audio.addEventListener('ended', () => {
      emitter.emit('nextsong')
    })
  }
  clearInterval(state.cursorUpdate)
  state.cursorUpdate = setInterval(() => {
    emitter.emit('render')
  }, 500)
  state.audio.play()
  state.playing = true
  emitter.emit('render')
})
emitter.on('pause', () => {
  if (state.audio) {
    state.audio.pause()
  }
  state.playing = false
  emitter.emit('render')
})
emitter.on('nextsong', () => {
  state.playing = false
  let filteredMusic = state.music.filter(filterMusic)
  const i = filteredMusic.findIndex(m => m === state.active)
  const music = filteredMusic[(i+1) % state.music.length]
  emitter.emit('play', music)
})
emitter.on('shuffleplay', () => {
  state.playing = false
  state.searchTerm = ''
  const i = parseInt(Math.random()*state.music.length)
  const music = state.music[i]
  emitter.emit('pause')
  emitter.emit('play', music)
  emitter.emit('scrolltoitem', music)
})
emitter.on('scrolltoitem', (e) => {
  const music = e.detail
  const i = state.music.findIndex(m => m === music)
  const list = document.querySelector('#music-list')
  list.children.item(i).scrollIntoView()
})
emitter.on('updatesearchtearm', (e) => {
  state.searchTerm = e.detail
  emitter.emit('render')
})
emitter.on('seek', (e) => {
  let scroll = e.detail.target
  let bounds = scroll.getBoundingClientRect()
  let x = e.detail.layerX
  let ellapsedTime = map(x, 0, bounds.width, 0, 1)
  if (state.audio) {
    state.audio.currentTime = state.audio.duration * ellapsedTime
  }
  emitter.emit('render')
})

emitter.on('render', () => {
  render(
    App(state, emitter.emit.bind(emitter)),
    document.body
  )
})
window.onload = () => emitter.emit('render')
