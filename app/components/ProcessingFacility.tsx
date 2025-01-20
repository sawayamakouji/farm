import { Button } from '@/components/ui/button'

export function ProcessingFacility({ facilities, onBuy, disabled }) {
  return (
    <div className="bg-blue-100 rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4">加工施設</h3>
      <p>現在の施設数: {facilities}</p>
      <p>効果: 作物の価値が{facilities * 10}%上昇</p>
      <Button onClick={onBuy} disabled={disabled} className="mt-4">
        加工施設を購入 (${(10000 * (facilities + 1)).toLocaleString()})
      </Button>
    </div>
  )
}

