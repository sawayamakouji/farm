import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function CropField({ crop, amount, onHarvest }) {
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

