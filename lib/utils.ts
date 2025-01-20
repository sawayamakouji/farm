import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let soundEnabled = true

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled
}

export const playSound = (sound: 'harvest' | 'unlock' | 'unlock2' | 'unlock3' | 'sell') => {
  if (!soundEnabled) return
  
  const audio = new Audio(`/sounds/${sound}.mp3`)
  audio.play().catch(() => {
    // 音声再生がブロックされた場合のエラーを無視
  })
}