import React from 'react'
import { Button } from '@/components/ui/button'

interface FranchiseProps {
  franchises: number
  onBuy: () => void
  disabled: boolean
}

const Franchise: React.FC<FranchiseProps> = ({ 
  franchises, 
  onBuy, 
  disabled 
}) => {
  return (
    <div className="bg-yellow-100 rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4">フランチャイズ</h3>
      <p>現在のフランチャイズ数: {franchises}</p>
      <p>効果: 毎秒${franchises * 100}の追加収入</p>
      <Button onClick={onBuy} disabled={disabled} className="mt-4">
        フランチャイズを購入 (${(50000 * (franchises + 1)).toLocaleString()})
      </Button>
    </div>
  )
}

export default Franchise
