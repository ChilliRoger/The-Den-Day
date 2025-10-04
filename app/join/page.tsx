'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast-simple'

export default function JoinPartyPage() {
  const [roomCode, setRoomCode] = useState('')
  const [guestName, setGuestName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleJoinParty = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!roomCode.trim() || !guestName.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please enter both the room code and your name.",
      })
      return
    }

    if (roomCode.trim().length !== 6) {
      toast({
        title: "Invalid room code",
        description: "Room code must be exactly 6 characters.",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/rooms/${roomCode.toUpperCase()}`, {
        method: 'GET',
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Room not found')
        }
        throw new Error('Failed to validate room')
      }

      const roomData = await response.json()
      
      // Store guest info in sessionStorage
      sessionStorage.setItem('guestInfo', JSON.stringify({ 
        name: guestName.trim(), 
        roomCode: roomCode.toUpperCase()
      }))
      
      toast({
        title: "Welcome to the party! 🎉",
        description: `Joining ${roomCode.toUpperCase()} as ${guestName}`,
      })

      // Redirect to the party room
      router.push(`/room/${roomCode.toUpperCase()}`)
    } catch (error) {
      console.error('Error joining party:', error)
      
      const errorMessage = (error instanceof Error && error.message === 'Room not found') 
        ? 'This room code does not exist. Please check the code and try again.'
        : 'Something went wrong. Please try again.'
        
      toast({
        title: "Could not join party",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-white hover:text-yellow-200 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">
            🎉 Join a Party
          </h1>
          <p className="text-white/80 text-center mt-2">
            Enter your code to join an existing celebration
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-purple-600">
                <Users className="inline-block mr-2 h-6 w-6" />
                Join Existing Party
              </CardTitle>
              <CardDescription>
                Enter the 6-character room code and your name to join the virtual party.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinParty} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="roomCode" className="text-sm font-medium text-gray-700">
                    Room Code
                  </label>
                  <Input
                    id="roomCode"
                    type="text"
                    placeholder="ABCD12"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.replace(/[^A-Z0-9]/gi, '').substring(0, 6).toUpperCase())}
                    className="w-full text-center text-lg tracking-widest font-mono"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 text-center">
                    Enter exactly 6 characters (letters and numbers)
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="guestName" className="text-sm font-medium text-gray-700">
                    Your Name
                  </label>
                  <Input
                    id="guestName"
                    type="text"
                    placeholder="Your name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full"
                    maxLength={50}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={isLoading || roomCode.length !== 6 || !guestName.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining Party...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Join Party Room
                    </>
                  )}
                </Button>
              </form>

              {/* Help Section */}
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Need help?</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Ask the host for the 6-character room code</li>
                  <li>• The code contains only letters and numbers</li>
                  <li>• Make sure to enter your name so others know who you are</li>
                  <li>• You&apos;ll join the party room once validated</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="max-w-2xl mx-auto mt-12">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-purple-600">
                Don&apos;t have a code?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Ask your friend or family member who is hosting the party for the room code.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link href="/create">
                  <Button variant="outline" size="sm">
                    Create Your Own Party
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
