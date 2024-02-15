import nacl from './lib/nacl-fast-es.js'
import { encode, decode } from './lib/base64.js'

export const ed25519 = {}

export const generate = async () => {
  const genkey = nacl.sign.keyPair()
  const keygen = encode(genkey.publicKey) + encode(genkey.secretKey)
  return keygen
}

ed25519.keypair = async () => {
  const keypair = await localStorage.getItem('keypair')
  if (!keypair) {
    const keypair = await generate()
    await localStorage.setItem('keypair', keypair)
    location.reload()
  } else {
    return keypair
  }
}

ed25519.pubkey = async () => {
  const keypair = await ed25519.keypair()
  return keypair.substring(0, 44)
}

ed25519.privkey = async () => {
  const keypair = await ed25519.keypair()
  return keypair.substring(44)
}

ed25519.deletekey = async () => {
  localStorage.removeItem('keypair')
}

ed25519.sign = async (text) => {
  const pubkey = await ed25519.pubkey()
  const privkey = await ed25519.privkey()

  const timestamp = Date.now()

  const msg = timestamp + text

  const sig = encode(nacl.sign(new TextEncoder().encode(msg), decode(privkey)))

  return pubkey + sig
}

ed25519.open = async (signed) => {
  const opened = new TextDecoder().decode(
    nacl.sign.open(
      decode(signed.substring(44)), 
      decode(signed.substring(0, 44))
    )
  )

  const obj = {
    author: signed.substring(0, 44),
    timestamp: new Number(opened.substring(0, 13)),
    text: opened.substring(13),
    raw: signed    
  }

  return obj
}
