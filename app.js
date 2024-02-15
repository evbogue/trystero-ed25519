import { trystero } from './trystero.js'
import { h } from './lib/h.js'
import { ed25519 } from './ed25519.js'
import { human } from './lib/human.js'
import { log } from './log.js'

const store = await log.getAll()

console.log(store)  

const pubkey = await ed25519.pubkey()

const render = async (msg) => {
  const timestamp = h('span', {style: 'float: right;'}, [human(new Date(msg.timestamp))])

  setInterval(() => {
    timestamp.textContent = human(new Date(msg.timestamp))
  }, 10000)

  const div = h('div', {id: msg.hash}, [
    timestamp,
    h('span', [msg.author]),
    ' ',
    h('span', [msg.text]),
    h('pre', [msg.raw])
  ])
  return div
}

const input = h('input')

const sendbutton = h('button', {onclick: async () => {
  if (input.value) {
    const signed = await ed25519.sign(input.value)
    trystero.send(signed)
    const opened = await ed25519.open(signed)
    composer.after(await render(opened))
    log.add(signed)
    input.value = ''
  }
}}, ['Send'])

const screen = h('div')
document.body.appendChild(screen)

const composer = h('div', [
  h('div', [pubkey]),
  input,
  sendbutton
])

screen.appendChild(composer)

if (store.length) {
  for (const raw of store) {
    console.log(raw)
    const opened = await ed25519.open(raw)
    composer.after(await render(opened))  
  }
}

trystero.connect({appId: 'testing4321', password: 'password'})

trystero.onmessage(async (data) => {
  const opened = await ed25519.open(data)
  if (opened) { log.add(opened.raw)}
  composer.after(await render(opened))
})

