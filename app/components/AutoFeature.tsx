import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'

interface AutoFeatureProps {
  feature: { id: string; name: string; unlockCost: number }
  isUnlocked: boolean
  isEnabled: boolean
  interval: number
  onUnlock: () => void
  onToggle: () => void
  onIntervalChange: (value: number) => void
  playerMoney: number
}

export function AutoFeature({
  feature,
  isUnlocked,
  isEnabled,
  interval,
  onUnlock,
  onToggle,
  onIntervalChange,
  playerMoney
}: AutoFeatureProps) {
  if (!isUnlocked) {
    return (
      <div className="bg-gray-100 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
        <Button onClick={onUnlock} disabled={playerMoney < feature.unlockCost}>
          アンロック (${feature.unlockCost})
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
      <div className="flex items-center justify-between mb-2">
        <span>有効/無効</span>
        <Switch checked={isEnabled} onCheckedChange={onToggle} />
      </div>
      <div className="flex items-center">
        <span className="mr-2">間隔 (秒):</span>
        <Input
          type="number"
          value={interval}
          onChange={(e) => onIntervalChange(Number(e.target.value))}
          min={1}
          className="w-32"
        />
        <span className="ml-2 text-sm text-gray-600">秒ごとに実行</span>
      </div>
    </div>
  )
}

