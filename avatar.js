import { h } from './lib/h.js'
import { cachekv } from './lib/cachekv.js'
import { stat } from './latest.js'
import { ed25519 } from './ed25519.js'

const pubkey = await ed25519.pubkey()

export const avatar = async (id) => {
  const link = h('a', {href: '#', id: 'name' + id.substring(0, 10)}, [id.substring(0, 7) + '...'])

  const getInfo = await cachekv.get(id)

  let latest = {}

  if (getInfo) {
    latest = JSON.parse(getInfo)
  }
  if (latest.name) {
    link.textContent = latest.name
  }

  const span = h('span', [link])

  const edit = h('button', {onclick: () => {
    const input = h('input', {style: 'width: 125px;', placeholder: id.substring(0, 7) + '...' || stat.name })
    const editSpan = h('span', [
      input,
      h('button', {onclick: async () => {
        if (input.value) {
          stat.name = input.value
          link.textContent = input.value
          await cachekv.put(pubkey, JSON.stringify(stat))
          const namesOnScreen = document.querySelectorAll('a#name' + id.substring(0, 10))
          for (const names of namesOnScreen) {
            names.textContent = input.value
          }
          editSpan.replaceWith(span)
        }
      }}, ['Save'])
    ])
    span.replaceWith(editSpan)
  }}, ['Edit name'])


  if (id === pubkey)
    link.after(edit)

  return span
}

