import { trystero } from './trystero.js'
import { h } from './lib/h.js'
import { ed25519 } from './ed25519.js'
import { human } from './lib/human.js'
import { log } from './log.js'
import { cachekv } from './lib/cachekv.js'

const pubkey = await ed25519.pubkey()

const store = await log.getAll()

const getLatest = await cachekv.get(pubkey)

let stat

if (getLatest) {
  stat = JSON.parse(getLatest)
}

if (!stat) {
  stat = {}
  cachekv.put(pubkey, JSON.stringify(stat))
}

const avatar = async (id) => {
  const link = h('a', {href: '#'}, [id.substring(0, 7) + '...'])

  const getInfo = await cachekv.get(id)

  let latest = {}

  if (getInfo) {
    latest = JSON.parse(getInfo)
  }
  if (latest.name) {
    link.textContent = latest.name
  }

  const span = h('span', [link])

  const edit = h('button', {onclick: async () => {
    const input = h('input', {style: 'width: 125px;', placeholder: id.substring(0, 7) + '...' || stat.name })
    const editSpan = h('span', [
      input,
      h('button', {onclick: async () => {
        if (input.value) {
          stat.name = input.value
          await cachekv.put(pubkey, JSON.stringify(stat))
          location.reload()
        }
      }}, ['Save'])
    ])
    span.replaceWith(editSpan)
  }}, ['Edit name'])


  if (id === pubkey)
    link.after(edit)

  return span
}

const render = async (msg) => {
  const timestamp = h('span', {style: 'float: right;'}, [human(new Date(msg.timestamp))])

  setInterval(() => {
    timestamp.textContent = human(new Date(msg.timestamp))
  }, 10000)

  const div = h('div', {classList: 'message', id: msg.hash}, [
    timestamp,
    await avatar(msg.author),
    h('br'),
    h('span', [msg.text]),
    h('pre', [msg.raw])
  ])
  return div
}

let defaultMessage = {author: pubkey, text: 'Hello world!', timestamp: Date.now()}
console.log(stat.latest)

const openedLatest = await ed25519.open(stat.latest) || defaultMessage

const currentStatus = await render(openedLatest)

const input = h('input', {placeholder: 'What\'s your status?'})

const sendbutton = h('button', {onclick: async () => {
  if (input.value) {
    const signed = await ed25519.sign(input.value)
    trystero.send({type: 'latest', payload: signed})
    stat.latest = signed
    await cachekv.put(pubkey, JSON.stringify(stat))
    const opened = await ed25519.open(signed)
    currentStatus.replaceWith(await render(opened))
    topp.after(await render(opened))
    log.add(signed)
    input.value = ''
  }
}}, ['Send'])

const topp = h('div')
const screen = h('div', {id: 'screen'})
const scroller = h('div', {id: 'scroller'})
const contacts = h('div', {id: 'contacts'})

document.body.appendChild(screen)
screen.appendChild(scroller)
screen.appendChild(contacts)
scroller.appendChild(topp)
const composer = h('div', {classList: 'message'}, [
  currentStatus,
  input,
  h('br'),
  sendbutton
])

contacts.appendChild(composer)

if (store.length) {
  for (const raw of store) {
    const opened = await ed25519.open(raw)
    topp.after(await render(opened))  
  }
}

trystero.connect({appId: 'testing4321', password: 'password'})

trystero.onmessage(async (data, id) => {
  if (data.type == 'post' || data.type == 'latest') {
    const opened = await ed25519.open(data.payload)
    if (opened) { log.add(opened.raw)}
    const rendered = await render(opened)
    const got = document.getElementById(opened.hash)
    if (!got) {
      topp.after(rendered)
    }
    if (data.type == 'latest') {
      const getDetails = await cachekv.get(opened.author)

      let latest = {}

      if (getDetails) {latest = JSON.parse(getDetails)}
      if (data.name) { 
        latest.name = data.name
        await cachekv.put(opened.author, JSON.stringify(latest))
      }

      const timestamp = h('span', {style: 'float: right;'}, [human(new Date(opened.timestamp))])
    
      setInterval(() => {
        timestamp.textContent = human(new Date(opened.timestamp))
      }, 10000)

      const got = document.getElementById(id)
      if (got)
        got.remove()
      const contact = h('div', {classList: 'message', id: id}, [
        timestamp,
        await avatar(opened.author),
        ' ',
        opened.text
      ])
      contacts.appendChild(contact)
    }
  }
})

trystero.join(id => {
  //const contact = h('div', {classList: 'message', id: id}, [id])
  //contacts.appendChild(contact)
  const obj = {type: 'latest'}
  if (stat.latest) {
    obj.payload = stat.latest
  }
  if (stat.name) {
    obj.name = stat.name
  } 
  if (stat.latest || stat.name) {
    trystero.send(obj)
  }
})

trystero.leave(id => {
  const got = document.getElementById(id)
  got.remove()
})
