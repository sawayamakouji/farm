'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function InstructionsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 bg-[url('/png/BG.jpg')] bg-cover bg-center opacity-50 -z-10" />
      <div className="fixed inset-0 bg-white/30 backdrop-blur-sm -z-20" />
      
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">操作説明</h2>
        <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
          <p>このゲームは、農場を経営しながら作物を育て、収穫し、売却して成長させていくシミュレーションゲームです。</p>
          <p>最初は小麦をクリックして売却をくりかえし、お金がたまったら収穫力アップや新しい作物をアンロックしましょう。</p>
          
          <div className="space-y-6">
            <div>
              <p className="font-medium">1. 作物をクリックして収穫します</p>
              <img 
                src="/png/1.png" 
                alt="収穫画面" 
                className="mt-4 rounded-lg shadow-md w-full max-w-md border-2 border-gray-200" 
              />
            </div>
            
            <div>
              <p className="font-medium">2. 収穫した作物を売却してお金を稼ぎます</p>
              <img 
                src="/png/2.png" 
                alt="売却画面" 
                className="mt-4 rounded-lg shadow-md w-full max-w-md border-2 border-gray-200" 
              />
            </div>
            
            <div>
              <p className="font-medium">3. お金を使ってアップグレードや新しい作物をアンロックします</p>
              <img 
                src="/png/3.png" 
                alt="アンロック画面" 
                className="mt-4 rounded-lg shadow-md w-full max-w-md border-2 border-gray-200" 
              />
            </div>
            
            <div>
              <p className="font-medium">4. 自動化機能を活用して効率的に農場を運営します</p>
              <img 
                src="/png/4.png" 
                alt="自動化機能画面" 
                className="mt-4 rounded-lg shadow-md w-full max-w-md border-2 border-gray-200" 
              />
            </div>
            
            <div className="space-y-2">
              <p className="font-medium">★ 画面右上のスイッチで音声のオン/オフを切り替えられます</p>
              <p className="font-medium">★ 自動化機能アンロック後は、各機能の横にあるスイッチでオン/オフを切り替えられます</p>
            </div>
          </div>
        </div>
        
        <Button 
          asChild
          className="mt-8 w-full py-6 text-xl"
        >
          <Link href="/">
            戻る
          </Link>
        </Button>
      </div>
    </div>
  )
}