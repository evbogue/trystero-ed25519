import { h } from './lib/h.js'
import { human } from './lib/human.js'
import { avatar } from './avatar.js'

export const render = async (msg) => {
  const timestamp = h('span', {style: 'float: right;'}, [human(new Date(msg.timestamp))])

  setInterval(() => {
    timestamp.textContent = human(new Date(msg.timestamp))
  }, 10000)

  const raw = h('code', {style: 'float: right;', onclick: () => {
    const got = document.getElementById('raw:' + msg.hash)
    if (!got) {
      div.appendChild(h('pre', {id: 'raw:' + msg.hash}, [JSON.stringify(msg)]))
    }
    if (got) {
      got.remove()
    }
  }}, ['raw '])

  const div = h('div', {classList: 'message', id: msg.hash}, [
    timestamp,
    raw,
    await avatar(msg.author),
    h('br'),
    h('span', [msg.text]),
  ])
  return div
}

