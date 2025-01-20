class AudioManager {
  private audioContext: AudioContext
  private bgmSource: AudioBufferSourceNode | null = null
  private currentBgm: string | null = null
  public bgmVolume: number = 0.5
  private bgmGainNode: GainNode | null = null
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
    
    this.bgmGainNode = this.audioContext.createGain()
    this.bgmGainNode.gain.value = this.isMuted ? 0 : this.bgmVolume
    
    this.bgmSource.connect(this.bgmGainNode)
    this.bgmGainNode.connect(this.audioContext.destination)
    
    this.bgmSource.start()
    this.currentBgm = url
  }

  setVolume(volume: number) {
    this.bgmVolume = volume
    if (this.bgmGainNode && !this.isMuted) {
      this.bgmGainNode.gain.value = volume
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = this.isMuted ? 0 : this.bgmVolume
    }
  }

  toggleBgm(enabled: boolean) {
    this.isMuted = !enabled
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = enabled ? this.bgmVolume : 0
    }
  }

  stopBgm() {
    if (this.bgmSource) {
      this.bgmSource.stop()
      this.bgmSource.disconnect()
      this.bgmSource = null
      this.currentBgm = null
    }
  }

  get muted(): boolean {
    return this.isMuted
  }
}

export const audioManager = new AudioManager()