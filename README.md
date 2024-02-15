# Trying Trystero with ed25519

A chat client built with [Trystero-torrent](https://github.com/dmotz/trystero) and [Ed25519: high-speed high-security signatures](https://ed25519.cr.yp.to/)

Trystero is magic, but has random ids upon every WebRTC connection. To maintain an identity within a chat room and also ensure message integrity we'll add some Ed25519.

We save a keypair in the browser and use that to sign a simple message protocol that is `<pubkey><signature>` which opens to `<timestamp><textcontent>`.

This app is just a website, but we ship with a built-in Deno file server:

```
deno run --allow-all serve.js
```

---
MIT
