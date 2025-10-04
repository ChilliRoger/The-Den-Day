'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, PartyPopper, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast-simple'

export default function CreatePartyPage() {
  const [hostName, setHostName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hostName.trim()) {
      toast({
        title: "Host name required",
        description: "Please enter your name to create a party.",
        type: "error"
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ host: hostName.trim() }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const { roomCode } = await response.json()
      
      // Store host info in sessionStorage
      sessionStorage.setItem('hostInfo', JSON.stringify({ 
        name: hostName.trim(), 
        roomCode 
      }))
      
      toast({
        title: "Party created successfully! 🎉",
        description: `Your room code is: ${roomCode}`,
        type: "success"
      })

      // Redirect to the party room
      router.push(`/room/${roomCode}`)
    } catch (error) {
      console.error('Error creating party:', error)
      toast({
        title: "Failed to create party",
        description: "Something went wrong. Please try again.",
        type: "error"
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
            🎂 Host a Party
          </h1>
          <p className="text-white/80 text-center mt-2">
            Create your virtual birthday celebration room
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-purple-600">
                <PartyPopper className="inline-block mr-2 h-6 w-6" />
                Create New Party
              </CardTitle>
              <CardDescription>
                Enter your name and generate a unique party room code to share with friends and family.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateParty} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="hostName" className="text-sm font-medium text-gray-700">
                    Host Name
                  </label>
                  <Input
                    id="hostName"
                    type="text"
                    placeholder="Your name"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full"
                    maxLength={50}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Party...
                    </>
                  ) : (
                    <>
                      <PartyPopper className="mr-2 h-4 w-4" />
                      Create Party Room
                    </>
                  )}
                </Button>
              </form>

              {/* Info Section */}
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">What happens next?</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• A unique 6-character room code will be generated</li>
                  <li>• You&apos;ll be redirected to your party room</li>
                  <li>• Share the code with your guests to join</li>
                  <li>• Start chatting and video calling!</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Recap */}
        <div className="max-w-2xl mx-auto mt-12">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-purple-600">
                Party Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="text-center">
                  <div className="text-2xl mb-1">💬</div>
                  Real-time Chat
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">📹</div>
                  Video Calls
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🎂</div>
                  Cake Cutting
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">👥</div>
                  Guest Management
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
