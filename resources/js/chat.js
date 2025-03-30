const userName = 'User-' + Math.floor(Math.random() * 100000)
const password = 'X'
//document.querySelector('#userName').innerHTML = userName

//if trying it on a phone, use this instead...
// const socket = io.connect('https://LOCAL-DEV-IP-HERE:3333/chat',{
const socket = io.connect('https://localhost:3333', {
  auth: {
    userName,
    password,
  },
  rejectUnauthorized: false,
})

// Add these debugging lines
socket.on('connect', () => {
  console.log('Socket connected!', socket.id)
  document.querySelector('#userName').innerHTML = userName + ' (Connected)'
})
socket.on('connect_error', (error) => {
  console.error('Connection error:', error)
  document.querySelector('#userName').innerHTML = userName + ' (Connection Error)'
})

const localVideoEl = document.querySelector('#localVideo')
const remoteVideoEl = document.querySelector('#remoteVideo')

let localStream //a var to hold the local video stream
let remoteStream //a var to hold the remote video stream
let peerConnection //the peerConnection that the two clients use to talk
let didIOffer = false

let peerConfiguration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
    },
  ],
}

const call = async (e) => {
  await fetchUserMedia()
  //peerConnection is all set with our STUN servers sent over
  await createPeerConnection()
  try {
    console.log('Creating offer...')
    const offer = await peerConnection.createOffer()
    console.log('Created offer', offer)
    await peerConnection.setLocalDescription(offer)
    didIOffer = true
    socket.emit('newOffer', offer) //send offer to signalingServer
  } catch (err) {
    console.log('Error creating offer', err)
  }
}

const answerOffer = async (offerObj) => {
  await fetchUserMedia()
  await createPeerConnection(offerObj)

  const answer = await peerConnection.createAnswer()
  console.log('Created answer', answer)
  await peerConnection.setLocalDescription(answer) //this is CLIENT2, and CLIENT2 uses the answer as the localDesc

  offerObj.answer = answer
  //emit the answer to the signaling server, so it can emit to CLIENT1
  //expect a response from the server with the already existing ICE candidates
  const offerIceCandidates = await socket.emitWithAck('newAnswer', offerObj)

  offerIceCandidates.forEach((iceCandidate) => {
    console.log('Adding ice candidate from server', iceCandidate)
    addNewIceCandidate(iceCandidate)
  })
}

const addAnswer = async (offerObj) => {
  console.log('addAnswer', offerObj)
  await peerConnection.setRemoteDescription(offerObj.answer)
}

const fetchUserMedia = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    localVideoEl.srcObject = localStream
  } catch (err) {
    console.error('Error accessing media devices.', err)
  }
}

const createPeerConnection = async (offerObj) => {
  peerConnection = new RTCPeerConnection(peerConfiguration)
  remoteStream = new MediaStream()
  remoteVideoEl.srcObject = remoteStream

  // Add tracks from local stream to peer connection
  localStream.getTracks().forEach((track) => {
    console.log('Adding local track to peer connection:', track.kind)
    peerConnection.addTrack(track, localStream)
  })

  peerConnection.addEventListener('signalingstatechange', (e) => {
    console.log('Signaling state changed to:', peerConnection.signalingState)
  })

  peerConnection.addEventListener('connectionstatechange', () => {
    console.log('Connection state changed to:', peerConnection.connectionState)
  })

  peerConnection.addEventListener('iceconnectionstatechange', () => {
    console.log('ICE connection state changed to:', peerConnection.iceConnectionState)
  })

  peerConnection.addEventListener('signalingstatechange', (e) => {
    console.log('signalingstatechange', e)
    console.log(peerConnection.signalingState)
  })

  peerConnection.addEventListener('icecandidate', (e) => {
    console.log('........Ice candidate found!......')
    console.log('New ICE candidate:', e.candidate.candidate.substr(0, 50) + '...')
    if (e.candidate) {
      socket.emit('sendIceCandidateToSignalingServer', {
        iceCandidate: e.candidate,
        iceUserName: userName,
        didIOffer,
      })
    }
  })

  peerConnection.addEventListener('track', (e) => {
    console.log('Received remote track of type:', e.track.kind)
    e.streams[0].getTracks().forEach((track) => {
      console.log('Adding remote track to remote stream:', track.kind)
      remoteStream.addTrack(track, remoteStream)
    })
  })

  if (offerObj) {
    console.log('Setting remote description from offer object')
    await peerConnection.setRemoteDescription(offerObj.offer)
  }
}

const addNewIceCandidate = async (iceCandidate) => {
  try {
    await peerConnection.addIceCandidate(iceCandidate)
  } catch (err) {
    console.error('Error adding received ice candidate', err)
  }
}

document.querySelector('#call').addEventListener('click', call)
