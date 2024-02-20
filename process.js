import { ed25519 } from './ed25519.js'
import { h } from './lib/h.js'
import { human } from './lib/human.js'
import { log } from './log.js'
import { render } from './render.js'
import { cachekv } from './lib/cachekv.js'
import { avatar } from './avatar.js'

export const process = async (data, id) => {
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
      const contacts = document.getElementById('contacts')
      contacts.appendChild(contact)
    }
  }
}
