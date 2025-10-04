export interface Peer {
  id: string
  stream: MediaStream | null
  connection: RTCPeerConnection | null
}

export const createPeerConnection = (): RTCPeerConnection => {
  const configuration = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302'
      }
    ]
  }

  return new RTCPeerConnection(configuration)
}

export const getUserMedia = async (): Promise<MediaStream> => {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
  } catch (error) {
    console.error('Error accessing media devices:', error)
    throw new Error('Unable to access camera and microphone')
  }
}

export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
