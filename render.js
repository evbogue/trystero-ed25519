import { h } from './lib/h.js'
import { human } from './lib/human.js'
import { avatar } from './avatar.js'

export const render = async (msg) => {
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

