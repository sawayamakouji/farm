import React from 'react'

interface VisualDisplayProps {
  money: number
  fields: number
  crops: { [key: string]: number }
  unlockedCrops: string[]
}

const CROP_EMOJIS: { [key: string]: string } = {
  wheat: '🌾',
  corn: '🌽',
  strawberry: '🍓',
}

export function VisualDisplay({ money, fields, crops, unlockedCrops }: VisualDisplayProps) {
  return (
    <div className="bg-green-100 p-4 rounded-lg mb-4">
      <div className="text-2xl mb-2">
        
        {Array(Math.min(fields, 10)).fill('🟩').join('')}
        {fields > 10 ? ` +${fields - 10}` : ''}
      </div>
      <div className="text-2xl mb-2">
        💰 {money.toLocaleString()}
      </div>
      <div className="text-2xl">
        {Object.entries(crops).map(([cropId, amount]) => (
          <span key={cropId} className="mr-2">
            {CROP_EMOJIS[cropId]} {amount}
          </span>
        ))}
      </div>
    </div>
  )
}

