import { trystero } from './trystero.js'
import { h } from './lib/h.js'
import { ed25519 } from './ed25519.js'
import { log } from './log.js'
import { cachekv } from './lib/cachekv.js'
import { stat } from './latest.js'
import { process } from './process.js'
import { render } from './render.js'

const pubkey = await ed25519.pubkey()

const store = await log.getAll()

const defaultMessage = {author: pubkey, text: 'Hello world! This is the Trystero-Ed25519 demo app. To get started update your status below. Edit your name. Or upload a photo.', timestamp: Date.now()}

let openedLatest = defaultMessage

if (stat.latest) {
  const openedStoredLatest = await ed25519.open(stat.latest)
  if (openedStoredLatest) {
    openedLatest = openedStoredLatest
  }
} 

const currentStatus = await render(openedLatest)

const input = h('input', {placeholder: 'What\'s your status?'})

const sendbutton = h('button', {onclick: async () => {
  if (input.value) {
    const signed = await ed25519.sign(input.value)

    const obj = {type: 'latest', payload: signed}

    if (stat.name) {
      obj.name = stat.name
    }
    if (stat.image) {
      obj.image = stat.image
    }

    trystero.send(obj)

    stat.latest = signed
    await cachekv.put(pubkey, JSON.stringify(stat))
    const opened = await ed25519.open(signed)
    currentStatus.replaceWith(await render(opened))
    topp.after(await render(opened))
    log.add(signed)
    input.value = ''
  }
}}, ['Send'])

const topp = h('div', {id: 'topp', classList: 'message'}, ['Messages'])
const screen = h('div', {id: 'screen'})
const scroller = h('div', {id: 'scroller'})

const contacts = h('div', {id: 'contacts'})

document.body.appendChild(screen)
screen.appendChild(scroller)
screen.appendChild(contacts)
scroller.appendChild(topp)

const deleteEverything = h('button', {onclick: () => {
  cachekv.clear()
  ed25519.deletekey()
  location.reload() 
}, style: 'background: orange; position: fixed; bottom: 0;'}, ['Delete Local DB'])

screen.appendChild(deleteEverything)

const composer = h('div', [
  currentStatus,
  h('div', {classList: 'message'}, [
    h('pre', [pubkey]),
    input,
    h('br'),
    sendbutton
  ])
])


contacts.appendChild(composer)

composer.after(h('div', {classList: 'message'}, ['Online now']))


if (store.length) {
  for (const raw of store) {
    const opened = await ed25519.open(raw)
    topp.after(await render(opened))  
  }
}

trystero.connect({appId: 'testing4321', password: 'password'})

trystero.onmessage(async (data, id) => await process(data, id))

trystero.join(() => {
  const obj = {type: 'latest'}
  if (stat.latest) {
    obj.payload = stat.latest
  }
  if (stat.name) {
    obj.name = stat.name
  }
  if (stat.image) {
    obj.image = stat.image
  } 
  if (stat.latest || stat.name) {
    trystero.send(obj)
  }
})

trystero.leave(id => {
  const got = document.getElementById(id)
  got.remove()
})
