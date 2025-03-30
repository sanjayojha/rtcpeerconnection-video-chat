import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import Ws from '#services/ws'

export default class ChatController {
  @inject()
  index(ctx: HttpContext) {
    Ws.boot()

    const offers: Array<{}> = [
      // offererUserName
      // offer
      // offerIceCandidates
      // answererUserName
      // answer
      // answererIceCandidates
    ]

    const connectedSockets = [
      // sockedId, username
    ]

    Ws.io.on('connection', (socket) => {
      console.log('New socket connection:', socket.id)
      const userName = socket.handshake.auth.userName
      const password = socket.handshake.auth.password

      if (password !== 'X') {
        console.log('Invalid password, disconnecting')
        socket.disconnect(true)
        return
      }

      connectedSockets.push({
        socketId: socket.id,
        userName,
      })

      if (offers.length > 0) {
        socket.emit('availableOffers', offers)
      }

      socket.on('newOffer', (newOffer) => {
        offers.push({
          offererUserName: userName,
          offer: newOffer,
          offerIceCandidates: [],
          answererUserName: null,
          answer: null,
          answererIceCandidates: [],
        })
        //send out to all connected sockets EXCEPT the caller
        socket.broadcast.emit('newOfferAwaiting', offers.slice(-1))
      })

      socket.on('newAnswer', (offerObj, ackFunction) => {
        console.log(offerObj)

        const offerToUpdate = offers.find(
          (offer) => offer.offererUserName === offerObj.offererUserName
        )
        if (!offerToUpdate) {
          console.log('No OfferToUpdate')
          return
        }
        ackFunction(offerToUpdate.offererUserName)
        offerToUpdate.answer = offerObj.answer
        offerToUpdate.answererUserName = userName

        //emit this answer (offerToUpdate) back to CLIENT1
        //in order to do that, we need CLIENT1's socketid
        const socketToAnswer = connectedSockets.find(
          (s) => s.userName === offerToUpdate.offererUserName
        )
        if (!socketToAnswer) {
          console.log('No matching socket')
          return
        }
        const socketIdToAnswer = socketToAnswer.socketId
        socket.to(socketIdToAnswer).emit('answerResponse', offerToUpdate)
      })

      socket.on('sendIceCandidateToSignalingServer', (iceCandidateObj) => {
        const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj
        if (didIOffer) {
          const offerInOffers = offers.find((offer) => offer.offererUserName === iceUserName)
          if (offerInOffers) {
            offerInOffers.offerIceCandidates.push(iceCandidate)

            if (offerInOffers.answererUserName) {
              const socketToSendTo = connectedSockets.find(
                (s) => s.userName === offerInOffers.answererUserName
              )
              if (socketToSendTo) {
                socket
                  .to(socketToSendTo.socketId)
                  .emit('receivedIceCandidateFromServer', iceCandidate)
              } else {
                console.log('Ice candidate recieved but could not find answerer')
              }
            }
          }
        } else {
          //this ice is coming from the answerer. Send to the offerer
          //pass it through to the other socket
          const offerInOffers = offers.find((offer) => offer.answererUserName === iceUserName)
          if (offerInOffers) {
            const socketToSendTo = connectedSockets.find(
              (s) => s.userName === offerInOffers.offererUserName
            )
            if (socketToSendTo) {
              socket
                .to(socketToSendTo.socketId)
                .emit('receivedIceCandidateFromServer', iceCandidate)
            } else {
              console.log('Ice candidate recieved but could not find offerer')
            }
          }
        }
      })
    })
    return ctx.view.render('pages/chat')
  }
}
