import React from 'react'
import { Button } from '@/components/ui/button'

interface AdvertisingCampaignProps {
  campaigns: number
  onStart: () => void
  disabled: boolean
}

const AdvertisingCampaign: React.FC<AdvertisingCampaignProps> = ({ 
  campaigns, 
  onStart, 
  disabled 
}) => {
  return (
    <div className="bg-purple-100 rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4">広告キャンペーン</h3>
      <p>現在のキャンペーン数: {campaigns}</p>
      <p>効果: 作物の売却価格が{campaigns * 10}%上昇</p>
      <Button onClick={onStart} disabled={disabled} className="mt-4">
        新しいキャンペーンを開始 (${(5000 * (campaigns + 1)).toLocaleString()})
      </Button>
    </div>
  )
}

export default AdvertisingCampaign
