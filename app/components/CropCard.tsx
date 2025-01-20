'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface CropCardProps {
  cropId: string
  cropName: string
  amount: number
  unlocked: boolean
  onClick: () => void
  onUnlock: () => void
  unlockCost: number
  playerMoney: number
}

const cropStyles = {
  wheat: {
    bg: 'bg-yellow-100',
    emoji: '🌾'
  },
  corn: {
    bg: 'bg-green-100', 
    emoji: '🌽'
  },
  strawberry: {
    bg: 'bg-red-100',
    emoji: '🍓'
  }
}

export default function CropCard({
  cropId,
  cropName,
  amount,
  unlocked,
  onClick,
  onUnlock,
  unlockCost,
  playerMoney
}: CropCardProps) {
  const style = cropStyles[cropId as keyof typeof cropStyles] || cropStyles.wheat

  return (
    <motion.div
      className={`${style.bg} rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer ${
        unlocked ? '' : 'opacity-50'
      }`}
      onClick={(e) => {
        e.preventDefault()
        if (unlocked) {
          onClick()
        } else {
          onUnlock()
        }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-2xl mb-2">{cropName}</div>
      {unlocked ? (
        <>
          <div className="text-lg">{amount}</div>
          <motion.div
            key={amount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="text-3xl"
          >
            {style.emoji}
          </motion.div>
        </>
      ) : (
        <Button 
          onClick={(e) => {
            e.preventDefault()
            onUnlock()
          }} 
          disabled={playerMoney < unlockCost}
        >
          アンロック (${unlockCost})
        </Button>
      )}
    </motion.div>
  )
}