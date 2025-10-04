'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Copy, Phone, PhoneOff, Cake, Users, MessageCircle, Mic, MicOff, Video, VideoOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import CakeCut from '@/components/CakeCut'
import { io, Socket } from 'socket.io-client'

// Dynamic Video Grid Component
function DynamicVideoGrid({ 
  localVideoRef, 
  localStream, 
  userName, 
  isVideoOff, 
  isMuted, 
  toggleMicrophone, 
  toggleVideo, 
  remoteStreams, 
  users 
}: {
  localVideoRef: React.RefObject<HTMLVideoElement>
  localStream: MediaStream | null
  userName: string
  isVideoOff: boolean
  isMuted: boolean
  toggleMicrophone: () => void
  toggleVideo: () => void
  remoteStreams: Map<string, MediaStream>
  users: User[]
}) {
  // Calculate total video participants (local + remote)
  const totalParticipants = 1 + remoteStreams.size
  
  // Calculate optimal grid layout based on number of participants
  const getGridLayout = (count: number) => {
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2'
    if (count === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    if (count === 4) return 'grid-cols-1 sm:grid-cols-2'
    if (count <= 6) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
    if (count <= 9) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  }

  // Calculate video height based on layout
  const getVideoHeight = (count: number) => {
    if (count === 1) return 'h-64 sm:h-80' // Single video gets more space
    if (count === 2) return 'h-56 sm:h-64' // Two videos side by side
    if (count === 3) return 'h-48 sm:h-56' // Three videos in row
    if (count === 4) return 'h-44 sm:h-52' // 2x2 grid
    return 'h-40 sm:h-48' // Smaller for many participants
  }

  const gridLayout = getGridLayout(totalParticipants)
  const videoHeight = getVideoHeight(totalParticipants)

  return (
    <div className={`h-full w-full`}>
      <div className={`grid ${gridLayout} gap-3 h-full`}>
        {/* Local Video */}
        <div className={`relative group ${videoHeight}`}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            controls={false}
            className={`w-full ${videoHeight} bg-gray-200 rounded-lg object-cover ${isVideoOff ? 'hidden' : ''}`}
          />
          {isVideoOff && (
            <div className={`w-full ${videoHeight} bg-gray-800 rounded-lg flex items-center justify-center`}>
              <div className="text-center text-white">
                <VideoOff className={`mx-auto mb-2 ${totalParticipants > 1 ? 'h-8 w-8' : 'h-12 w-12'}`} />
                <p className={`${totalParticipants > 1 ? 'text-xs' : 'text-sm'}`}>Camera Off</p>
              </div>
            </div>
          )}
          {!localStream && !isVideoOff && (
            <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg ${videoHeight}`}>
              <div className="text-center text-gray-600">
                <MessageCircle className={`mx-auto mb-2 ${totalParticipants > 1 ? 'h-6 w-6' : 'h-8 w-8'}`} />
                <p className={`${totalParticipants > 1 ? 'text-xs' : 'text-sm'}`}>Starting camera...</p>
              </div>
            </div>
          )}
          <div className={`absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm ${totalParticipants > 4 ? 'text-xs px-1 py-0.5' : ''}`}>
            You ({userName})
            {isMuted && <MicOff className={`ml-1 inline ${totalParticipants > 4 ? 'h-2 w-2' : 'h-3 w-3'}`} />}
          </div>
          
          {/* Floating Control Buttons - only show for larger videos */}
          {totalParticipants <= 2 && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex gap-1">
                <Button
                  size={totalParticipants === 1 ? "sm" : "sm"}
                  onClick={toggleMicrophone}
                  className={isMuted ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                >
                  {isMuted ? <MicOff className={totalParticipants === 1 ? "h-4 w-4" : "h-3 w-3"} /> : <Mic className={totalParticipants === 1 ? "h-4 w-4" : "h-3 w-3"} />}
                </Button>
                <Button
                  size={totalParticipants === 1 ? "sm" : "sm"}
                  onClick={toggleVideo}
                  className={isVideoOff ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                >
                  {isVideoOff ? <VideoOff className={totalParticipants === 1 ? "h-4 w-4" : "h-3 w-3"} /> : <Video className={totalParticipants === 1 ? "h-4 w-4" : "h-3 w-3"} />}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Remote Videos */}
        {Array.from(remoteStreams.entries()).map(([userId, stream]) => {
          const user = users.find(u => u.id === userId)
          return (
            <div key={userId} className={`relative ${videoHeight}`}>
              <video
                autoPlay
                playsInline
                controls={false}
                ref={(video) => {
                  if (video) {
                    video.srcObject = stream
                    video.play().catch(console.error)
                  }
                }}
                className={`w-full ${videoHeight} bg-gray-200 rounded-lg object-cover`}
              />
              <div className={`absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm ${totalParticipants > 4 ? 'text-xs px-1 py-0.5' : ''}`}>
                {user?.name || 'Guest'}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Video count indicator */}
      <div className="mt-2 text-center text-sm text-gray-600">
        {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''} in call
      </div>
    </div>
  )
}

interface Message {
  user: string
  text: string
  timestamp: string
}

interface User {
  id: string
  name: string
  isHost: boolean
}

interface PartyRoomProps {
  params: { code: string }
}

export default function PartyRoomPage({ params }: PartyRoomProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isHost, setIsHost] = useState(false)
  const [userName, setUserName] = useState('')
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [peerConnections, setPeerConnections] = useState<Map<string, RTCPeerConnection>>(new Map())
  const [videoCallActive, setVideoCallActive] = useState(false)
  const [showCakeCut, setShowCakeCut] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)

  const roomCode = params.code

  useEffect(() => {
    // Get user info from session storage
    const hostInfo = JSON.parse(sessionStorage.getItem('hostInfo') || 'null')
    const guestInfo = JSON.parse(sessionStorage.getItem('guestInfo') || 'null')
    
    let currentUserName = ''
    let currentIsHost = false
    
    if (hostInfo && hostInfo.roomCode === roomCode) {
      currentUserName = hostInfo.name
      currentIsHost = true
      setUserName(currentUserName)
      setIsHost(currentIsHost)
    } else if (guestInfo && guestInfo.roomCode === roomCode) {
      currentUserName = guestInfo.name
      currentIsHost = false
      setUserName(currentUserName)
      setIsHost(currentIsHost)
    } else {
      toast({
        title: "Access denied",
        description: "You don't have permission to join this room.",
      })
      router.push('/')
      return
    }

    console.log('🔑 User authentication successful:', { currentUserName, currentIsHost, roomCode })

    // Initialize Socket.io
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000')
    
    socketInstance.emit('join-room', roomCode, currentUserName)
    
    socketInstance.on('user-joined', (user: User) => {
      setUsers(prev => {
        if (!prev.find(u => u.id === user.id)) {
          return [...prev, user]
        }
        return prev
      })
    })

    socketInstance.on('user-left', (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId))
      // Close peer connection
      const pc = peerConnections.get(userId)
      if (pc) {
        pc.close()
        setPeerConnections(prev => {
          const newMap = new Map(prev)
          newMap.delete(userId)
          return newMap
        })
      }
    })

    socketInstance.on('message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socketInstance.on('cake-cut', () => {
      setShowCakeCut(true)
    })

    // WebRTC signaling
    socketInstance.on('offer', async (data: { from: string, offer: RTCSessionDescriptionInit }) => {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        })

        pc.setRemoteDescription(data.offer)
        
        if (localStream) {
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream)
          })
        }

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        
        socketInstance.emit('answer', { to: data.from, answer })

        pc.ontrack = (event) => {
          setRemoteStreams(prev => new Map(prev).set(data.from, event.streams[0]))
        }

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socketInstance.emit('ice-candidate', { to: data.from, candidate: event.candidate })
          }
        }

        setPeerConnections(prev => new Map(prev).set(data.from, pc))
      } catch (error) {
        console.error('Error handling offer:', error)
      }
    })

    socketInstance.on('answer', async (data: { from: string, answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnections.get(data.from)
      if (pc) {
        await pc.setRemoteDescription(data.answer)
      }
    })

    socketInstance.on('ice-candidate', async (data: { from: string, candidate: RTCIceCandidateInit }) => {
      const pc = peerConnections.get(data.from)
      if (pc) {
        await pc.addIceCandidate(data.candidate)
      }
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      peerConnections.forEach(pc => pc.close())
    }
  }, [roomCode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Effect to handle video stream assignment
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
      localVideoRef.current.play().catch(err => {
        console.error('Error auto-playing video:', err)
      })
      console.log('Stream assigned via useEffect:', localStream)
    }
  }, [localStream])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket) return

    const message: Message = {
      user: userName,
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    }

    socket.emit('message', message)
    setNewMessage('')
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    toast({
      title: "Code copied!",
      description: "Share this code with your guests.",
    })
  }

  const joinVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setLocalStream(stream)
      setVideoCallActive(true)
      
      // Assign stream to video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
        localVideoRef.current.play().catch(err => {
          console.error('Error playing local video:', err)
        })
        console.log('Local stream assigned to video element:', stream)
      } else {
        console.error('Local video ref not available')
      }

      // Create offers for all existing users
      users.forEach(user => {
        if (user.id !== socket?.id) {
          createPeerConnection(user.id, stream)
        }
      })

    } catch (error) {
      console.error('Error accessing media devices:', error)
      toast({
        title: "Camera access denied",
        description: "Please allow camera and microphone access to join video calls.",
      })
    }
  }

  const leaveVideoCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
    setRemoteStreams(new Map())
    setVideoCallActive(false)
    setIsMuted(false)
    setIsVideoOff(false)
    
    peerConnections.forEach(pc => pc.close())
    setPeerConnections(new Map())
  }

  const createPeerConnection = async (userId: string, stream: MediaStream) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream)
    })

    pc.ontrack = (event) => {
      setRemoteStreams(prev => new Map(prev).set(userId, event.streams[0]))
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', { to: userId, candidate: event.candidate })
      }
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    
    if (socket) {
      socket.emit('offer', { to: userId, offer })
    }

    setPeerConnections(prev => new Map(prev).set(userId, pc))
  }

  const cutCake = () => {
    if (socket) {
      socket.emit('cut-cake', roomCode)
    }
    setShowCakeCut(true)
  }

  const toggleMicrophone = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0] 
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <CakeCut isVisible={showCakeCut} onComplete={() => setShowCakeCut(false)} />
      
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Leave Party
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white font-mono text-lg font-bold">{roomCode}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={copyRoomCode}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white text-sm">
              <Users className="inline-block mr-1 h-4 w-4" />
              {users.length}
            </span>
            {videoCallActive && (
              <div className="flex items-center gap-1 text-white text-sm">
                {isMuted && <MicOff className="h-4 w-4 text-red-400" />}
                {isVideoOff && <VideoOff className="h-4 w-4 text-red-400" />}
              </div>
            )}
            {isHost && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                onClick={cutCake}
              >
                <Cake className="mr-2 h-4 w-4" />
                Cut Cake
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/20">
            <TabsTrigger value="chat" className="text-white data-[state=active]:bg-white/30">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="video" className="text-white data-[state=active]:bg-white/30">
              <Phone className="mr-2 h-4 w-4" />
              Video Call
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-4">
            <Card className="bg-white/90 backdrop-blur-sm h-[500px] flex flex-col shadow-xl border-0">
              {/* Chat Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-300">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-4 rounded-full mb-4">
                      <MessageCircle className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Start the celebration! 🎉</h3>
                    <p className="text-center text-sm">Be the first to send a message and get the party started!</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={index} className={`flex ${message.user === userName ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`flex items-start gap-3 max-w-xs lg:max-w-md ${message.user === userName ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          message.user === userName 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        }`}>
                          {message.user.charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Message Bubble */}
                        <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                          message.user === userName 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm' 
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                        }`}>
                          {/* Sender name for others' messages */}
                          {message.user !== userName && (
                            <p className="font-semibold text-sm mb-1 text-purple-600">{message.user}</p>
                          )}
                          
                          {/* Message text */}
                          <p className={`text-sm leading-relaxed ${message.user === userName ? 'text-white' : 'text-gray-800'}`}>
                            {message.text}
                          </p>
                          
                          {/* Timestamp */}
                          <div className={`flex ${message.user === userName ? 'justify-end' : 'justify-start'} mt-1`}>
                            <p className={`text-xs ${message.user === userName ? 'text-purple-100' : 'text-gray-500'}`}>
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-gray-200 bg-gray-50/50 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="bg-white border-gray-200 rounded-full px-4 py-3 pr-12 focus:border-purple-300 focus:ring-purple-200 shadow-sm"
                    />
                    {/* Emoji button */}
                    <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors">
                      <span className="text-lg">😊</span>
                    </button>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </TabsContent>

          {/* Video Tab */}
          <TabsContent value="video" className="mt-4">
            <Card className="bg-white/90 backdrop-blur-sm h-[500px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5" />
                    Video Call
                  </CardTitle>
                  <div className="flex gap-2">
                    {!videoCallActive ? (
                      <Button
                        onClick={joinVideoCall}
                    className="bg-green-600 hover:bg-green-700"
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Join Call
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={toggleMicrophone}
                          className={isMuted ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                        >
                          {isMuted ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                          {isMuted ? "Unmute" : "Mute"}
                        </Button>
                        <Button
                          onClick={toggleVideo}
                          className={isVideoOff ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                        >
                          {isVideoOff ? <VideoOff className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
                          {isVideoOff ? "Video On" : "Video Off"}
                        </Button>
                        <Button
                          onClick={leaveVideoCall}
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <PhoneOff className="mr-2 h-4 w-4" />
                          Leave Call
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!videoCallActive ? (
                  <div className="text-center py-8">
                    <Phone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">Click &quot;Join Call&quot; to start or join the video call</p>
                  </div>
                ) : (
                  <DynamicVideoGrid 
                    localVideoRef={localVideoRef}
                    localStream={localStream}
                    userName={userName}
                    isVideoOff={isVideoOff}
                    isMuted={isMuted}
                    toggleMicrophone={toggleMicrophone}
                    toggleVideo={toggleVideo}
                    remoteStreams={remoteStreams}
                    users={users}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Connected Users */}
        {users.length > 0 && (
          <Card className="mt-4 bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                Party Attendees ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-3">
                {users.map((user) => (
                  <div key={user.id} className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm transition-all duration-200 hover:scale-105 ${
                    user.isHost 
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200' 
                      : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100'
                  }`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      user.isHost 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.name}
                      {user.isHost && (
                        <span className="text-yellow-600 ml-1 text-sm">👑</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
