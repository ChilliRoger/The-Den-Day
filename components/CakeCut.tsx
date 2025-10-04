'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CakeCutProps {
  isVisible: boolean
  onComplete?: () => void
}

const CakeCut: React.FC<CakeCutProps> = ({ isVisible, onComplete }) => {
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowCelebration(true)
      const timer = setTimeout(() => {
        setShowCelebration(false)
        onComplete?.()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2000 + Math.random() * 1000,
  }))

  return (
    <AnimatePresence>
      {isVisible && showCelebration && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Confetti Animation */}
          <div className="absolute inset-0 overflow-hidden">
            {confettiPieces.map((piece) => (
              <motion.div
                key={piece.id}
                className="absolute w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"
                style={{ left: `${piece.left}%` }}
                initial={{ y: -10, rotate: 0, opacity: 1 }}
                animate={{ 
                  y: "100vh", 
                  rotate: 360, 
                  opacity: 0,
                  x: [-50, 50, -30, 30, 0],
                }}
                transition={{ 
                  duration: piece.duration / 1000, 
                  delay: piece.delay,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>

          {/* Cake Animation */}
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Cake Emoji */}
              <motion.div
                className="text-9xl md:text-[12rem]"
                animate={{ 
                  rotateY: [0, -10, 0, -15, 0],
                  rotateX: [0, 5, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                🎂
              </motion.div>

              {/* Cake Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-yellow-200/20 to-transparent"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Slice Animation */}
              <motion.div
                className="absolute top-1/2 -right-8 text-4xl md:text-6xl"
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 20 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                🧁
              </motion.div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <motion.div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-xl md:text-2xl shadow-lg"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                🎉 Happy Birthday! 🎉
              </motion.div>
            </motion.div>

            {/* Floating Hearts */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 12 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{ 
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                  animate={{
                    y: [-20, -100],
                    opacity: [1, 0],
                    scale: [0.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                >
                  {['❤️', '💖', '💝', '🎈'][i % 4]}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CakeCut
