// Open camera with at least minWidth and minHeight capabilities
async function openCamera(cameraId, minWidth, minHeight) {
  const constraints = {
    audio: {
      echoCancellation: true,
    },
    video: {
      deviceId: cameraId,
      width: {
        min: minWidth,
      },
      height: {
        min: minHeight,
      },
    },
  }
  return await navigator.mediaDevices.getUserMedia(constraints)
}

function updateCameraList(cameras) {
  const listElement = document.querySelector('select#availableCameras')
  listElement.innerHTML = ''
  cameras
    .map((camera) => {
      console.log('Camera found:', camera)
      const cameraOption = document.createElement('option')
      cameraOption.label = camera.label
      cameraOption.value = camera.deviceId
      return cameraOption
    })
    .forEach((cameraOption) => listElement.add(cameraOption))
}

async function getConnectedDevices(type) {
  const devices = await navigator.mediaDevices.enumerateDevices()
  return devices.filter((device) => device.kind === type)
}

const cameras = await getConnectedDevices('videoinput')

if (cameras && cameras.length > 0) {
  updateCameraList(cameras)
  // Open first available video camera with a resolution of 1280x720 pixels
  const stream = await openCamera(cameras[0].deviceId, 1280, 720)
  const videoElement = document.querySelector('video#localVideo')
  videoElement.srcObject = stream
  console.log('Camera opened successfully')
}
// Listen for changes to media devices and update the list accordingly

navigator.mediaDevices.addEventListener('devicechange', (event) => {
  const newCameraList = getConnectedDevices('videoinput')
  updateCameraList(newCameraList)
})
