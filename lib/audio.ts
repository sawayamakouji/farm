// lib/audio.ts
class AudioManager {
  private audioContext: AudioContext;
  private bgmSource: AudioBufferSourceNode | null = null;
  private currentBgm: string | null = null;
  private bgmGainNode: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
      this.audioContext = new AudioContext();
  }

  async loadAudio(url: string): Promise<AudioBuffer> {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  async playBgm(url: string, loop = true) {
     
      // Stop current BGM
      if (this.bgmSource) {
          this.bgmSource.stop();
          this.bgmSource.disconnect();
          if (this.bgmGainNode) {
              this.bgmGainNode.disconnect();
          }
          this.bgmSource = null;
      }

      // Load and play new BGM
      const buffer = await this.loadAudio(url);
      this.bgmSource = this.audioContext.createBufferSource();
      this.bgmSource.buffer = buffer;
      this.bgmSource.loop = loop;

      this.bgmGainNode = this.audioContext.createGain();
      this.bgmGainNode.gain.value = this.isMuted ? 0 : 0.5; // 初期音量を0.5に固定

      this.bgmSource.connect(this.bgmGainNode);
      this.bgmGainNode.connect(this.audioContext.destination);

      this.bgmSource.start();
      this.currentBgm = url;
  }


toggleMute() {
  this.isMuted = !this.isMuted
  if (this.bgmGainNode) {
    this.bgmGainNode.gain.value = this.isMuted ? 0 : 0.5
  }
}
  
  toggleBgm(enabled: boolean) {
      // isMuted の値を更新
      this.isMuted = !enabled;
      console.log(`AudioManager: toggleBgm isMuted=${this.isMuted} enabled=${enabled}`);
    
      if (enabled) {
           if (this.currentBgm) {
               this.playBgm(this.currentBgm);
              }
      } else {
          // オフにするなら stopBgm しておく
          this.stopBgm();
      }
  }

  stopBgm() {
      if (this.bgmSource) {
          this.bgmSource.stop();
          this.bgmSource.disconnect();
          if (this.bgmGainNode) {
              this.bgmGainNode.disconnect();
          }
          this.bgmSource = null;
      }
  }

  get muted(): boolean {
      return this.isMuted;
  }
}

let audioManagerInstance: AudioManager | null = null;

export const createAudioManager = () => {
  if (!audioManagerInstance) {
      audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
};

export const audioManager = () => {
  return audioManagerInstance;
};