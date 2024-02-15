import { ed25519 } from './ed25519.js'
import { cachekv } from './lib/cachekv.js'

const getStore = await cachekv.get('rawstore')

let store

if (getStore) {
  store = JSON.parse(getStore)
}

if (!getStore) {
  store = []
}

const opened = new Map()

export const log = {}

log.add = async (raw) => {
  if (!store.includes(raw)) { 
    store.push(raw)
    await cachekv.put('rawstore', JSON.stringify(store)) 
  }
}

log.getAll = async () => {
  if (store)
  return store
}
