'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PartyPopper, Users, Video, Cake } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300/20 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-pink-300/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-blue-300/20 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-10 right-10 w-14 h-14 bg-purple-300/20 rounded-full animate-bounce" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center text-white mb-20">
          <div className="animate-pulse mb-8">
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-yellow-200 via-white to-pink-200 bg-clip-text text-transparent drop-shadow-lg">
              🎂 The Den 🎉
            </h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-white drop-shadow-md">
            Virtual Birthday Parties
          </h2>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed animate-fade-in">
            Create magical virtual birthday celebrations with friends and family. 
            Chat in real-time, join video calls, and perform virtual cake cutting ceremonies together!
          </p>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
          <Link href="/create" className="group">
            <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-xl px-12 py-8 rounded-2xl shadow-2xl hover:shadow-yellow-500/25 transform hover:scale-105 transition-all duration-300 border-0">
            <PartyPopper className="mr-3 h-8 w-8 animate-bounce" />
              Host a Party
            </Button>
          </Link>
          <Link href="/join" className="group">
            <Button size="lg" variant="outline" className="border-2 border-white/80 text-white hover:bg-white hover:text-purple-600 font-bold text-xl px-12 py-8 rounded-2xl backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300 transform hover:scale-105 bg-white/10 hover:shadow-2xl">
              <Users className="mr-3 h-8 w-8 group-hover:animate-bounce" />
              Join a Party
            </Button>
          </Link>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 rounded-3xl overflow-hidden group">
            <CardHeader className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:animate-pulse">
                <Video className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 mb-4">Video Calls</CardTitle>
              <CardDescription className="text-gray-600 text-lg leading-relaxed">
                Connect face-to-face with friends and family through crystal-clear video calls powered by WebRTC technology.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 rounded-3xl overflow-hidden group">
            <CardHeader className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:animate-pulse">
                <Users className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 mb-4">Real-time Chat</CardTitle>
              <CardDescription className="text-gray-600 text-lg leading-relaxed">
                Share messages, reactions, and birthday wishes instantly with real-time messaging powered by Socket.io.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 rounded-3xl overflow-hidden group">
            <CardHeader className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg group-hover:animate-pulse">
                <Cake className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 mb-4">Cake Cutting</CardTitle>
              <CardDescription className="text-gray-600 text-lg leading-relaxed">
                Host triggers an amazing virtual cake cutting ceremony with confetti and animations visible to everyone!
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Enhanced How it Works */}
        <div className="mt-24 text-center text-white">
          <h3 className="text-4xl font-black mb-12 text-white drop-shadow-lg">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { step: '1', title: 'Create', description: 'Host creates a party with a unique code', icon: '🎂', color: 'from-yellow-400 to-orange-500' },
              { step: '2', title: 'Share', description: 'Share the 6-character code with guests', icon: '📤', color: 'from-blue-400 to-cyan-500' },
              { step: '3', title: 'Join', description: 'Guests enter the code to join instantly', icon: '🚪', color: 'from-green-400 to-emerald-500' },
              { step: '4', title: 'Celebrate', description: 'Chat, video call, and cut virtual cake!', icon: '🎉', color: 'from-pink-400 to-purple-500' }
            ].map((item) => (
              <div key={item.step} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl border border-white/20">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center text-2xl shadow-lg animate-bounce`}>
                  {item.icon}
                </div>
                <div className={`text-3xl font-black mb-3 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>{item.step}</div>
                <h4 className="text-xl font-bold mb-3 text-white">{item.title}</h4>
                <p className="text-white/90 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="mt-32 pb-8">
          <div className="text-center text-white/80">
            <div className="mb-4 animate-pulse">
              <span className="text-2xl">🎂 🎈 🎉 🌟 🎁 🎪</span>
            </div>
            <p className="text-lg">
              Built with <span className="text-red-400 animate-pulse">❤️</span> using Next.js, Socket.io, WebRTC, and MongoDB
            </p>
            <p className="text-sm mt-2 text-white/60">
              All features are completely free and open-source
            </p>
            <div className="mt-6 text-xs text-white/40">
              © 2024 The Den - Virtual Birthday Parties
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
