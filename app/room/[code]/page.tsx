'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Copy, Phone, PhoneOff, Cake, Users, MessageCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import CakeCut from '@/components/CakeCut'
import { io, Socket } from 'socket.io-client'

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

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)

  const roomCode = params.code

  useEffect(() => {
    // Get user info from session storage
    const hostInfo = JSON.parse(sessionStorage.getItem('hostInfo') || 'null')
    const guestInfo = JSON.parse(sessionStorage.getItem('guestInfo') || 'null')
    
    if (hostInfo && hostInfo.roomCode === roomCode) {
      setUserName(hostInfo.name)
      setIsHost(true)
    } else if (guestInfo && guestInfo.roomCode === roomCode) {
      setUserName(guestInfo.name)
      setIsHost(false)
    } else {
      toast({
        title: "Access denied",
        description: "You don't have permission to join this room.",
      })
      router.push('/')
      return
    }

    // Initialize Socket.io
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000')
    
    socketInstance.emit('join-room', roomCode, userName)
    
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
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Create offers for all existing users
      users.forEach(user => {
        if (user.id !== socket?.id) {
          createPeerConnection(user.id, stream)
        }
      })

    } catch (error) {
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
      socket.emit('cut-cake &', roomCode)
    }
    setShowCakeCut(true)
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
            <Card className="bg-white/90 backdrop-blur-sm h-[500px] flex flex-column">
              {/* Chat Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle className="mx-auto h-12 w-12 mb-2" />
                    <p>No messages yet. Start the celebration!</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={index} className={`flex ${message.user === userName ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.user === userName 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        <p className="font-semibold text-sm">{message.user}</p>
                        <p>{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    Send
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
                      <Button
                        onClick={leaveVideoCall}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <PhoneOff className="mr-2 h-4 w-4" />
                        Leave Call
                      </Button>
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
                  <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Local Video */}
                    <div className="relative">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-64 bg-gray-200 rounded-lg"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        You ({userName})
                      </div>
                    </div>

                    {/* Remote Videos */}
                    {Array.from(remoteStreams.entries()).map(([userId, stream]) => {
                      const user = users.find(u => u.id === userId)
                      return (
                        <div key={userId} className="relative">
                          <video
                            autoPlay
                            playsInline
                            ref={(video) => {
                              if (video) video.srcObject = stream
                            }}
                            className="w-full h-64 bg-gray-200 rounded-lg"
                          />
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                            {user?.name || 'Unknown'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Connected Users */}
        {users.length > 0 && (
          <Card className="mt-4 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm text-gray-700">Connected Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback text-sm>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {user.name}
                      {user.isHost && <span className="text-yellow-600 ml-1">👑</span>}
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
