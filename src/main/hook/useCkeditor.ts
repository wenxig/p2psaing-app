import { readFileSync } from 'fs';
import _ckeditorHTML from '../../../resources/ckeditor5/sample/index.html?asset'
import _ckeditorMainJS from '../../../resources/ckeditor5/build/ckeditor?asset'
import express from 'express';
import { AddressInfo } from 'node:net';
const ckeditorHTML = readFileSync(_ckeditorHTML).toString()
export function useCkeditor() {
  const app = express()
  app.get('/', (_req, res) => {
    if (import.meta.env.DEV) res.send(readFileSync(_ckeditorHTML).toString())
    else res.send(ckeditorHTML)
  })
  app.get('/js', (_, res) => {
    res.sendFile(_ckeditorMainJS)
  })
  const l = app.listen(0)

  return () => (<AddressInfo>l.address()).port
}