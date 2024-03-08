import { readFileSync } from 'fs';
import _ckeditorHTML from '../../../resources/ckeditor5/sample/index.html?asset'
import _ckeditorMainJS from '../../../resources/ckeditor5/build/ckeditor?asset'
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { AddressInfo } from 'node:net';
const ckeditorHTML = readFileSync(_ckeditorHTML).toString()
const ckeditorMainJS = readFileSync(_ckeditorMainJS).toString()
export function useCkeditor() {
  const app = new Hono()
  app.get('/', c => {
    if (import.meta.env.DEV) return c.html(readFileSync(_ckeditorHTML).toString())
    return c.html(ckeditorHTML)
  })
  app.get('/js', c => c.text(ckeditorMainJS))
  const server = serve(app).listen(0)

  return () => (<AddressInfo>server.address()).port
}