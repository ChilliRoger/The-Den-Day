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
  const [validationError, setValidationError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleJoinParty = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous validation errors
    setValidationError(null)

    if (!roomCode.trim() || !guestName.trim()) {
      setValidationError("Both room code and name are required")
      toast({
        title: "Required fields missing",
        description: "Please enter both the room code and your name.",
      })
      return
    }

    if (roomCode.trim().length !== 6) {
      setValidationError("Room code must be exactly 6 characters")
      toast({
        title: "Invalid room code",
        description: "Room code must be exactly 6 characters.",
      })
      return
    }

    // Validate room code format
    if (!/^[A-Z0-9]{6}$/.test(roomCode.toUpperCase())) {
      setValidationError("Room code must contain only letters and numbers")
      toast({
        title: "Invalid room code format",
        description: "Room code must contain only letters and numbers.",
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
          toast({
            title: "🚫 Party Not Found",
            description: `Room "${roomCode.toUpperCase()}" doesn't exist. Please check the code with your host and try again!`,
          })
          return
        }
        throw new Error('Failed to validate room')
      }

      const roomData = await response.json()
      
      // Verify room data exists
      if (!roomData || !roomData.code) {
        toast({
          title: "🚫 Invalid Party",
          description: "This party room appears to be corrupted. Please try a different code.",
        })
        return
      }

      // Store guest info in sessionStorage
      sessionStorage.setItem('guestInfo', JSON.stringify({ 
        name: guestName.trim(), 
        roomCode: roomCode.toUpperCase()
      }))
      
      toast({
        title: "🎉 Welcome to the Party!",
        description: `Successfully joined "${roomCode.toUpperCase()}" as ${guestName.trim()}`,
      })

      // Redirect to the party room
      router.push(`/room/${roomCode.toUpperCase()}`)
    } catch (error) {
      console.error('Error joining party:', error)
      
      toast({
        title: "❌ Connection Error",
        description: "Unable to connect to the party. Please check your internet connection and try again.",
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
                    onChange={(e) => {
                      setRoomCode(e.target.value.replace(/[^A-Z0-9]/gi, '').substring(0, 6).toUpperCase())
                      setValidationError(null) // Clear error when typing
                    }}
                    className={`w-full text-center text-lg tracking-widest font-mono ${
                      validationError && roomCode.length > 0 
                        ? 'border-red-500 focus:border-red-500' 
                        : roomCode.length === 6 
                          ? 'border-green-500 focus:border-green-500' 
                          : ''
                    }`}
                    maxLength={6}
                  />
                  {validationError ? (
                    <p className="text-xs text-red-500 text-center">
                      {validationError}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 text-center">
                      Enter exactly 6 characters (letters and numbers)
                      {roomCode.length === 6 && (
                        <span className="text-green-600 ml-2">✓ Valid format</span>
                      )}
                    </p>
                  )}
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

              {/* Common Issues */}
              <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">🐍 Problem joining?</h3>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• <strong>Room not found:</strong> Double-check the code with party host</li>
                  <li>• <strong>Typos:</strong> Ensure no spaces or special characters</li>
                  <li>• <strong>Wrong letters:</strong> Try mixing uppercase/lowercase</li>
                  <li>• <strong>Party ended:</strong> Room may have expired or been closed</li>
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
