class AudioManager {
  private audioContext: AudioContext
  private bgmSource: AudioBufferSourceNode | null = null
  private currentBgm: string | null = null
  public bgmVolume: number = 0.5
  private isMuted: boolean = false

  constructor() {
    this.audioContext = new AudioContext()
  }

  async loadAudio(url: string): Promise<AudioBuffer> {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return await this.audioContext.decodeAudioData(arrayBuffer)
  }

  async playBgm(url: string, loop = true) {
    if (this.currentBgm === url) return
    
    // Stop current BGM
    if (this.bgmSource) {
      this.bgmSource.stop()
      this.bgmSource.disconnect()
    }

    // Load and play new BGM
    const buffer = await this.loadAudio(url)
    this.bgmSource = this.audioContext.createBufferSource()
    this.bgmSource.buffer = buffer
    this.bgmSource.loop = loop
    
    const gainNode = this.audioContext.createGain()
    gainNode.gain.value = this.isMuted ? 0 : this.bgmVolume
    
    this.bgmSource.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    this.bgmSource.start()
    this.currentBgm = url
  }

  setVolume(volume: number) {
    // Convert linear volume (0-1) to logarithmic scale (0.0001-1)
    const minVolume = 0.0001
    const logVolume = minVolume * Math.pow(10, volume * 2)
    
    this.bgmVolume = volume
    if (this.bgmSource) {
      // Create new gain node
      const gainNode = this.audioContext.createGain()
      gainNode.gain.value = logVolume
      
      // Disconnect existing connections
      this.bgmSource.disconnect()
      
      // Reconnect through new gain node
      this.bgmSource.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted
    this.setVolume(this.bgmVolume)
  }

  stopBgm() {
    if (this.bgmSource) {
      this.bgmSource.stop()
      this.bgmSource.disconnect()
      this.bgmSource = null
      this.currentBgm = null
    }
  }
}

export const audioManager = new AudioManager()