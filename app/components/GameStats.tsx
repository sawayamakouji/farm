'use client'

interface GameStatsProps {
  totalClicks: number
  totalCoins: number
  totalHarvests: number
}

export default function GameStats({
  totalClicks,
  totalCoins,
  totalHarvests,
}: GameStatsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/50 backdrop-blur-sm p-4 border-t">
      <div className="container mx-auto flex justify-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🖱️</span>
          <span className="text-lg font-medium">{totalClicks}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className="text-lg font-medium">{totalCoins}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <span className="text-lg font-medium">{totalHarvests}</span>
        </div>
      </div>
    </div>
  )
}