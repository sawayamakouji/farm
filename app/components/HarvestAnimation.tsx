'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface HarvestAnimationProps {
  cropId: string
  amount: number
  onComplete: () => void
}

const cropEmojis = {
  wheat: '🌾',
  corn: '🌽',
  strawberry: '🍓'
}

export default function HarvestAnimation({ cropId, amount, onComplete }: HarvestAnimationProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete()
    }, 1000)
    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible) return null

  return (
    <motion.div
      className="absolute"
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: -50 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-2xl">
        {cropEmojis[cropId as keyof typeof cropEmojis]} ×{amount}
      </div>
    </motion.div>
  )
}