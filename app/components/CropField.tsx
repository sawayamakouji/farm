import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface CropFieldProps {
  crop: {
    id: string
    name: string
    baseValue: number
    growthTime: number
    unlockCost: number
  }
  amount: number
  onHarvest: () => void
}

export function CropField({ crop, amount, onHarvest }: CropFieldProps) {
  return (
    <motion.div
      className="bg-brown-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer"
      onClick={onHarvest}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-xl font-semibold mb-2">{crop.name}</div>
      <div className="text-lg">{amount}</div>
      <div className="text-sm">価値: ${crop.baseValue}</div>
    </motion.div>
  )
}

