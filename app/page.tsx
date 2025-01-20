// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { createAudioManager } from '@/lib/audio'
import Game from '@/app/components/Game'

export default function HomePage() {
  const [mode, setMode] = useState<'start' | 'game' | 'instructions'>('start')
  const [isMuted, setIsMuted] = useState(false)
    const [audioManager, setAudioManager] = useState<ReturnType<typeof createAudioManager> | null>(null)
  const [initialBgmPlayed, setInitialBgmPlayed] = useState(false);


  const handleMuteToggle = (checked: boolean) => {
    setIsMuted(!checked)
  }


    const startGame = () => {
        const newAudioManager = createAudioManager();
        setAudioManager(newAudioManager);
      
        setMode('game')
    }
    
    useEffect(() => {
        if(audioManager && !initialBgmPlayed) {
            audioManager.playBgm('/sounds/phase1.mp3')
            setInitialBgmPlayed(true)
        }
    }, [audioManager, initialBgmPlayed])

  if (mode === 'game' && audioManager) {
      return <Game initialSoundEnabled={!isMuted} audioManager={audioManager} />;
  }


  return (
    <div className="min-h-screen bg-green-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Farm Clicker: グローバル農場へ</h1>
      
      {mode === 'start' ? (
        <div className="flex flex-col gap-4 w-full max-w-md">
          <Button 
            onClick={startGame}
            className="py-6 text-xl"
          >
            ゲームスタート
          </Button>
          <Button
            onClick={() => setMode('instructions')}
            className="py-6 text-xl"
            variant="outline"
          >
            操作説明
          </Button>
          <div className="flex items-center gap-2 mt-4">
            <Switch
              checked={!isMuted}
              onCheckedChange={handleMuteToggle}
              className="data-[state=checked]:bg-green-600"
            />
          
          <p className="text-sm text-gray-500 text-center">※ゲーム中でも変更可能です</p>
        </div> 
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">操作説明</h2>
          <div className="space-y-4 text-gray-700">
            <p>このゲームは、農場を経営しながら作物を育て、収穫し、売却して成長させていくシミュレーションゲームです。</p>
            最初は小麦をクリックして売却をくりかえし、お金がたまったら収穫力アップや新しい作物をアンロックしましょう。
            <div className="space-y-4">
              <div>
                <p>1. 作物をクリックして収穫します</p>
                <img src="/png/1.png" alt="収穫画面" className="mt-2 rounded-lg shadow-md w-full max-w-md" />
              </div>
                
              <div>
                <p>2. 収穫した作物を売却してお金を稼ぎます</p>
                <img src="/png/2.png" alt="売却画面" className="mt-2 rounded-lg shadow-md w-full max-w-md" />
              </div>
              
              <div>
                <p>3. お金を使ってアップグレードや新しい作物をアンロックします</p>
                <img src="/png/3.png" alt="アンロック画面" className="mt-2 rounded-lg shadow-md w-full max-w-md" />
              </div>
              
              <div>
                <p>4. 自動化機能を活用して効率的に農場を運営します</p>
                <img src="/png/4.png" alt="自動化機能画面" className="mt-2 rounded-lg shadow-md w-full max-w-md" />
              </div>
              
              <p>★ 画面右上のスイッチで音声のオン/オフを切り替えられます</p>
              <p>★ 自動化機能アンロック後は、各機能の横にあるスイッチでオン/オフを切り替えられます</p>
            </div>
          </div>
          <Button 
            onClick={() => setMode('start')}
            className="mt-6 w-full"
          >
            戻る
          </Button>
        </div>
      )}
    </div>
  )
}