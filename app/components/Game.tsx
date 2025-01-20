// app/components/Game.tsx
'use client'

import { useState, useEffect, useMemo, useLayoutEffect, useRef } from 'react'
import GameStats from './GameStats'
import CropCard from './CropCard'
import HarvestAnimation from './HarvestAnimation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { VisualDisplay } from './VisualDisplay'
import { AutoFeature } from './AutoFeature'
import Footer from '@/components/Footer'
import { playSound, setSoundEnabled } from '@/lib/utils'
import { createAudioManager, destroyAudioManager } from '@/lib/audio'

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
  audioManager: ReturnType<typeof createAudioManager>
}

export default function Game({ initialSoundEnabled }: GameProps) {
  useLayoutEffect(() => {
    document.body.classList.add('no-footer')
    return () => {
      document.body.classList.remove('no-footer')
    }
  }, [])
  const audioManager = useMemo(() => {
    const manager = createAudioManager();
    console.log('[Game] Created AudioManager instance');
    return manager;
  }, []);

  useEffect(() => {
    return () => {
      console.log('[Game] Cleaning up AudioManager');
      destroyAudioManager();
    };
  }, []);
  const [currentPhase, setCurrentPhase] = useState(0)

  const checkPhase = (money: number) => {
    let newPhase = 0
    for (let i = PHASE_BGMS.length - 1; i >= 0; i--) {
      if (money >= PHASE_BGMS[i].threshold) {
        newPhase = i
        break
      }
    }
    if (newPhase !== currentPhase) {
      setCurrentPhase(newPhase)
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
  const [totalClicks, setTotalClicks] = useState(0)
  const [totalCoins, setTotalCoins] = useState(0)
  const prevPlayer = useRef<PlayerState>()
  const [autoHarvestAnimations, setAutoHarvestAnimations] = useState<{cropId: string, amount: number}[]>([])

  useEffect(() => {
    if (!prevPlayer.current) {
      // 初回は前回の状態がないのでtotalCoinsを初期化
      setTotalCoins(player.money)
    } else {
      const moneyGained = player.money - prevPlayer.current.money
      if (moneyGained > 0) {
        setTotalCoins(prev => prev + moneyGained)
      }
    }
    prevPlayer.current = player
  }, [player.money])
  const [totalHarvests, setTotalHarvests] = useState(0)
  const [bgmVolume, setBgmVolume] = useState(0.3)

  useEffect(() => {
    return () => {
      console.log('[Game] Cleaning up AudioManager');
      destroyAudioManager();
    };
  }, []);

  // BGM control effect
  useEffect(() => {
    if (!audioManager) return;

    console.log('[Game] Initial BGM setup');
    const bgmFile = PHASE_BGMS[currentPhase].file;
    
    if (audioManager.muted) {
      console.log('[Game] Muted - stopping BGM');
      audioManager.stopBgm();
    } else {
      // Only play if not already playing the same BGM
      if (audioManager.currentBgm !== bgmFile) {
        console.log(`[Game] Playing new BGM: ${bgmFile}`);
        audioManager.playBgm(bgmFile);
      } else {
        console.log('[Game] Same BGM already playing');
      }
    }

    // Cleanup on unmount
    return () => {
      console.log('[Game] Cleaning up BGM');
      audioManager.stopBgm();
    };
  }, [audioManager]); // Only depend on audioManager

  // Phase change effect
  useEffect(() => {
    if (!audioManager || audioManager.muted) return;

    console.log(`[Game] Phase changed to ${currentPhase}`);
    const bgmFile = PHASE_BGMS[currentPhase].file;
    
    // Only play if not already playing the same BGM
    if (audioManager.currentBgm !== bgmFile) {
      console.log(`[Game] Playing phase BGM: ${bgmFile}`);
      audioManager.playBgm(bgmFile);
    }
  }, [currentPhase, audioManager?.muted]);

  useEffect(() => {
    console.log(`Game: useEffect audioManager=${audioManager}`)
    const timer = setInterval(() => {
      setPlayer(prev => {
        let newState = { ...prev }

        // Auto harvesting
        const harvestedCrops: {cropId: string, amount: number}[] = []
        const newCrops = { ...prev.crops }
        const harvestPerLand = (prev.autoHarvesters * 2) / prev.land // 収穫量を2倍に
        prev.unlockedCrops.forEach(cropId => {
          const amount = Math.floor(harvestPerLand)
          if (amount > 0) {
            harvestedCrops.push({cropId, amount})
            newCrops[cropId] = (newCrops[cropId] || 0) + amount
          }
        })
        newState.crops = newCrops
        
        // Add harvest animations
        if (harvestedCrops.length > 0) {
          setAutoHarvestAnimations(prev => [
            ...prev,
            ...harvestedCrops
          ])
        }

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
        const prevPhase = currentPhase
        checkPhase(newState.money)

        // Change BGM if phase changed
        if (prevPhase !== currentPhase && audioManager) {
          audioManager.playBgm(PHASE_BGMS[currentPhase].file)
        }

        return newState
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [audioManager, currentPhase])

  const harvestCrop = (cropId: string) => {
    playSound('harvest')
    setTotalClicks(prev => prev + 1)
    setTotalHarvests(prev => prev + 1)
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
    setPlayer(prev => ({
      ...prev,
      money: prev.money - crop.unlockCost,
      unlockedCrops: [...prev.unlockedCrops, cropId],
      crops: {
        ...prev.crops,
        [cropId]: 0
      }
    }))
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
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[url('/png/BG.jpg')] bg-cover bg-center opacity-70 -z-10"
      ></div>
      <div className="fixed inset-0 bg-white/30 backdrop-blur-sm -z-20">
        {autoHarvestAnimations.map((animation, index) => (
          <HarvestAnimation
            key={index}
            cropId={animation.cropId}
            amount={animation.amount}
            onComplete={() => {
              setAutoHarvestAnimations(prev =>
                prev.filter((_, i) => i !== index)
              )
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 mb-8">
        <h1 className="text-4xl font-bold">Farm Clicker: グローバル農場へ</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">🔔</span>
            <Switch
              checked={player.soundEnabled}
              onCheckedChange={(checked) => {
                setPlayer(prev => ({ ...prev, soundEnabled: checked }))
                setSoundEnabled(checked)
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">🎵</span>
            <Switch
              checked={!audioManager?.muted}
              onCheckedChange={(checked) => {
                console.log(`Game: BGM Switch onCheckedChange checked=${checked}`)
                  audioManager?.toggleBgm(checked);
              }}
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
            <CropCard
              key={`crop-${crop.id}`}
              cropId={crop.id}
              cropName={crop.name}
              amount={player.crops[crop.id] || 0}
              unlocked={player.unlockedCrops.includes(crop.id)}
              onClick={() => harvestCrop(crop.id)}
              onUnlock={() => unlockCrop(crop.id)}
              unlockCost={crop.unlockCost}
              playerMoney={player.money}
            />
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
        <GameStats
          totalClicks={totalClicks}
          totalCoins={totalCoins}
          totalHarvests={totalHarvests}
        />
      </div>
      <Footer totalCoins={totalCoins} />
    </div>
  )
}
