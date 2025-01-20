'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { VisualDisplay } from './VisualDisplay'
import { AutoFeature } from './AutoFeature'
import { playSound, setSoundEnabled } from '@/lib/utils'
import { audioManager } from '@/lib/audio'

const PHASE_BGMS = [
  { threshold: 0, file: '/sounds/phase1.mp3' },
  { threshold: 1000, file: '/sounds/phase2.mp3' },
  { threshold: 100000, file: '/sounds/phase3.mp3' },
  { threshold: 1000000, file: '/sounds/phase4.mp3' },
]

const CROP_TYPES = [
  { id: 'wheat', name: '小麦', baseValue: 1, growthTime: 5, unlockCost: 0 },
  { id: 'corn', name: 'トウモロコシ', baseValue: 4, growthTime: 8, unlockCost: 1000 },
  { id: 'strawberry', name: 'イチゴ', baseValue: 10, growthTime: 15, unlockCost: 10000 },
]

const AUTO_FEATURES = [
  { id: 'autoSell', name: '自動売却', unlockCost: 10000 },
  { id: 'autoLand', name: '自動畑追加', unlockCost: 50000 },
]

interface PlayerState {
  money: number
  crops: { [key: string]: number }
  clickPower: number
  autoHarvesters: number
  land: number
  unlockedCrops: string[]
  unlockedFeatures: string[]
  autoSell: { enabled: boolean; interval: number }
  autoLand: { enabled: boolean; interval: number }
  soundEnabled: boolean
  [key: string]: any // Allow dynamic properties for auto features
}


interface GameProps {
  initialSoundEnabled: boolean
}

export default function Game({ initialSoundEnabled }: GameProps) {
  const [currentPhase, setCurrentPhase] = useState(0)
  
  const checkPhase = (money: number) => {
    const newPhase = PHASE_BGMS
      .slice()
      .reverse()
      .findIndex(phase => money >= phase.threshold)
    if (newPhase !== currentPhase) {
      setCurrentPhase(newPhase)
      audioManager.playBgm(PHASE_BGMS[newPhase].file)
    }
  }

  const [player, setPlayer] = useState<PlayerState>({
    money: 0,
    crops: {},
    clickPower: 1,
    autoHarvesters: 0,
    land: 1,
    unlockedCrops: ['wheat'],
    unlockedFeatures: [],
    autoSell: { enabled: false, interval: 10 },
    autoLand: { enabled: false, interval: 60 },
    soundEnabled: true
  })
  const [bgmVolume, setBgmVolume] = useState(0.3)

  useEffect(() => {
    const timer = setInterval(() => {
      setPlayer(prev => {
        let newState = { ...prev }
        
        // Auto harvesting
        const newCrops = { ...prev.crops }
        const harvestPerLand = prev.autoHarvesters / prev.land
        prev.unlockedCrops.forEach(cropId => {
          newCrops[cropId] = (newCrops[cropId] || 0) + Math.floor(harvestPerLand)
        })
        newState.crops = newCrops

        // Auto selling
        if (prev.unlockedFeatures.includes('autoSell') && prev.autoSell.enabled) {
          const totalValue = Object.entries(newState.crops).reduce((sum, [cropId, amount]) => {
            const crop = CROP_TYPES.find(c => c.id === cropId)
            return sum + (amount * (crop?.baseValue || 0)) * prev.land
          }, 0)
          newState.money += totalValue
          newState.crops = Object.fromEntries(Object.keys(newState.crops).map(key => [key, 0]))
          playSound('sell')
        }

        // Auto buying land
        if (prev.unlockedFeatures.includes('autoLand') && prev.autoLand.enabled) {
          const landCost = 1000 * prev.land
          if (newState.money >= landCost) {
            newState.money -= landCost
            newState.land += 1
          }
        }

        // Check phase after money changes
        checkPhase(newState.money)

        return newState
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const harvestCrop = (cropId: string) => {
    playSound('harvest')
    setPlayer(prev => ({
      ...prev,
      crops: {
        ...prev.crops,
        [cropId]: (prev.crops[cropId] || 0) + prev.clickPower
      }
    }))
  }

  const sellCrops = () => {
    playSound('sell')
    setPlayer(prev => {
      const totalValue = Object.entries(prev.crops).reduce((sum, [cropId, amount]) => {
        const crop = CROP_TYPES.find(c => c.id === cropId)
        return sum + (amount * (crop?.baseValue || 0)) * prev.land
      }, 0)
      return {
        ...prev,
        money: prev.money + totalValue,
        crops: Object.fromEntries(Object.keys(prev.crops).map(key => [key, 0]))
      }
    })
  }

  const upgradeClickPower = () => {
    const cost = 50 * (player.clickPower + 1)
    if (player.money >= cost) {
      playSound('unlock2')
      setPlayer(prev => ({
        ...prev,
        money: prev.money - cost,
        clickPower: prev.clickPower + 1
      }))
    }
  }

  const buyAutoHarvester = () => {
    const cost = 200 * (player.autoHarvesters + 1)
    if (player.money >= cost) {
      playSound('unlock2')
      setPlayer(prev => ({
        ...prev,
        money: prev.money - cost,
        autoHarvesters: prev.autoHarvesters + 1
      }))
    }
  }

  const buyLand = () => {
    const cost = 1000 * player.land
    if (player.money >= cost) {
      playSound('unlock2')
      setPlayer(prev => ({
        ...prev,
        money: prev.money - cost,
        land: prev.land + 1
      }))
    }
  }

  const unlockCrop = (cropId: string) => {
    const crop = CROP_TYPES.find(c => c.id === cropId)
    if (!crop || player.money < crop.unlockCost || player.unlockedCrops.includes(cropId)) {
      return
    }
    playSound('unlock')
    setPlayer(prev => {
      const newCrops = { ...prev.crops }
      if (!(cropId in newCrops)) {
        newCrops[cropId] = 0
      }
      
      return {
        ...prev,
        money: prev.money - crop.unlockCost,
        unlockedCrops: [...prev.unlockedCrops, cropId],
        crops: newCrops
      }
    })
  }

  const unlockFeature = (featureId: string) => {
    const feature = AUTO_FEATURES.find(f => f.id === featureId)
    if (feature && player.money >= feature.unlockCost && !player.unlockedFeatures.includes(featureId)) {
      playSound('unlock3')
      setPlayer(prev => ({
        ...prev,
        money: prev.money - feature.unlockCost,
        unlockedFeatures: [...prev.unlockedFeatures, featureId]
      }))
    }
  }

  const toggleAutoFeature = (featureId: string) => {
    setPlayer(prev => ({
      ...prev,
      [featureId]: { ...prev[featureId], enabled: !prev[featureId].enabled }
    }))
  }

  const setAutoFeatureInterval = (featureId: string, interval: number) => {
    setPlayer(prev => ({
      ...prev,
      [featureId]: { ...prev[featureId], interval: interval }
    }))
  }

  return (
    <div className="min-h-screen bg-green-100 flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-center gap-4 mb-8">
        <h1 className="text-4xl font-bold">Farm Clicker: グローバル農場へ</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">効果音</span>
            <Switch
              checked={player.soundEnabled}
              onCheckedChange={(checked) => {
                setPlayer(prev => ({ ...prev, soundEnabled: checked }))
                setSoundEnabled(checked)
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">BGM</span>
            <Switch
              checked={!audioManager.muted}
              onCheckedChange={(checked) => {
                audioManager.toggleBgm(checked)
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">BGM音量</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={bgmVolume}
              onChange={(e) => {
                const volume = parseFloat(e.target.value)
                setBgmVolume(volume)
                audioManager.setVolume(volume)
                console.log(`BGM Volume set to: ${volume}`)
                window.dispatchEvent(new CustomEvent('bgmVolumeChanged', {
                  detail: { volume }
                }))
              }}
              className="w-24"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <VisualDisplay
          money={player.money}
          fields={player.land}
          crops={player.crops}
          unlockedCrops={player.unlockedCrops}
        />
        <div className="grid grid-cols-2 gap-4 mb-4">
          {CROP_TYPES.map(crop => (
            <motion.div
              key={`crop-${crop.id}`}
              className={`bg-brown-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer ${
                player.unlockedCrops.includes(crop.id) ? '' : 'opacity-50'
              }`}
              onClick={(e) => {
                e.preventDefault()
                if (player.unlockedCrops.includes(crop.id)) {
                  harvestCrop(crop.id)
                } else {
                  unlockCrop(crop.id)
                }
                }
              }
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-2xl mb-2">{crop.name}</div>
              {player.unlockedCrops.includes(crop.id) ? (
                <div className="text-lg">{player.crops[crop.id] || 0}</div>
              ) : (
                <Button 
                  onClick={(e) => {
                    e.preventDefault()
                    unlockCrop(crop.id)
                  }} 
                  disabled={player.money < crop.unlockCost || player.unlockedCrops.includes(crop.id)}
                >
                  アンロック (${crop.unlockCost})
                </Button>
              )}
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button onClick={sellCrops}>全ての作物を売却</Button>
          <Button onClick={upgradeClickPower} disabled={player.money < 50 * (player.clickPower + 1)}>
            収穫力アップ (${50 * (player.clickPower + 1)})
          </Button>
          <Button onClick={buyAutoHarvester} disabled={player.money < 200 * (player.autoHarvesters + 1)}>
            自動収穫機 (${200 * (player.autoHarvesters + 1)})
          </Button>
          <Button onClick={buyLand} disabled={player.money < 1000 * player.land}>
            土地購入 (${1000 * player.land})
          </Button>
        </div>
        <div className="mt-4 mb-4 text-sm text-gray-600">
          自動収穫: {player.autoHarvesters}/秒/区画
        </div>
        <div className="grid gap-4">
          {AUTO_FEATURES.map(feature => (
            <AutoFeature
              key={feature.id}
              feature={feature}
              isUnlocked={player.unlockedFeatures.includes(feature.id)}
              isEnabled={player[feature.id].enabled}
              interval={player[feature.id].interval}
              onUnlock={() => unlockFeature(feature.id)}
              onToggle={() => toggleAutoFeature(feature.id)}
              onIntervalChange={(value) => setAutoFeatureInterval(feature.id, value)}
              playerMoney={player.money}
            />
          ))}
        </div>
      </div>
    </div>
  )
}