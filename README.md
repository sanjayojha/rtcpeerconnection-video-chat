# Vdeo chat application using RTCPeerConnection

A sample mini web application to make a video chat using WebRTC (RTCPeerconnection) API. It uses AdonisJS for the node server, along with websocket for creating signaling server.

## How to run

Install mkcert to generate cert and keys, then edit `bin/server.ts` to get your privatekey and certificate. This will allow to run your AdonisJs node server on https, which is required for websocket and peerconnection.

It is recommended to change your host (in `.env` file) to your network local ip (192.168.x.x), so that you can test application from other devices connected via your network (like mobile). Once done run `npm run dev` and visit https://your-local-ip:3333/chat. Press on call button. Open same url with other device and click Answer button.
