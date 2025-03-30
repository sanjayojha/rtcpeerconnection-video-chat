console.log('socketListeners.js loaded')

const createOfferEls = (offers) => {
  console.log('Creating offer elements:', offers)
  const answerEl = document.getElementById('answer')
  if (!answerEl) {
    console.error('Answer element not found!')
    return
  }
  offers.forEach((offer) => {
    console.log('offer', offer)
    const newOfferEl = document.createElement('div')
    newOfferEl.innerHTML = `<button class="danger">Answer ${offer.offererUserName}</button>`
    newOfferEl.addEventListener('click', () => {
      console.log('Answer button clicked for:', offer)
      // Check if answerOffer exists
      if (typeof answerOffer === 'function') {
        answerOffer(offer)
      } else {
        console.error('answerOffer function not found!')
      }
    })
    answerEl.appendChild(newOfferEl)
  })
}

socket.on('availableOffers', (offers) => {
  console.log('availableOffers', offers)
  const answerEl = document.getElementById('answer')
  answerEl.innerHTML = ''
  createOfferEls(offers)
})

socket.on('newOfferAwaiting', (offers) => {
  console.log('newOfferAwaiting', offers)
  createOfferEls(offers)
})

socket.on('receivedIceCandidateFromServer', (iceCandidate) => {
  console.log('receivedIceCandidateFromServer', iceCandidate)
  addNewIceCandidate(iceCandidate)
})

socket.on('answerResponse', (offerObj) => {
  console.log('answerResponse', offerObj)
  addAnswer(offerObj)
})
