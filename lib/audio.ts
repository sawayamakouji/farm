// lib/audio.ts
class AudioManager {
  private audioContext: AudioContext;
  private bgmSource: AudioBufferSourceNode | null = null;
  public currentBgm: string | null = null;
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
      console.log(`[AudioManager] Attempting to play BGM: ${url}, muted: ${this.isMuted}`);
      
      if (this.isMuted) {
          console.log('[AudioManager] BGM playback skipped due to muted state');
          return;
      }

      // Stop current BGM
      console.log('[AudioManager] Stopping current BGM before playing new one');
      if (this.bgmSource) {
          this.bgmSource.stop();
          this.bgmSource.disconnect();
          if (this.bgmGainNode) {
              this.bgmGainNode.disconnect();
          }
          this.bgmSource = null;
      }

      try {
          console.log('[AudioManager] Loading audio buffer...');
          const buffer = await this.loadAudio(url);
          
          console.log('[AudioManager] Creating audio source and gain nodes');
          this.bgmSource = this.audioContext.createBufferSource();
          this.bgmSource.buffer = buffer;
          this.bgmSource.loop = loop;

          this.bgmGainNode = this.audioContext.createGain();
          this.bgmGainNode.gain.value = this.isMuted ? 0 : 0.5;

          console.log('[AudioManager] Connecting audio nodes');
          this.bgmSource.connect(this.bgmGainNode);
          this.bgmGainNode.connect(this.audioContext.destination);

          console.log('[AudioManager] Starting playback');
          this.bgmSource.start();
          this.currentBgm = url;
          
          console.log('[AudioManager] BGM playback started successfully');
      } catch (error) {
          console.error('[AudioManager] Error playing BGM:', error);
      }
  }


toggleMute() {
  this.isMuted = !this.isMuted
  if (this.bgmGainNode) {
    this.bgmGainNode.gain.value = this.isMuted ? 0 : 0.5
  }
}
  
  toggleBgm(enabled: boolean) {
      console.log(`[AudioManager] Toggling BGM: enabled=${enabled}`);
      
      this.isMuted = !enabled;
      console.log(`[AudioManager] New muted state: ${this.isMuted}`);
      
      // Always update gain node immediately
      if (this.bgmGainNode) {
          console.log('[AudioManager] Updating gain node value');
          this.bgmGainNode.gain.setValueAtTime(
              this.isMuted ? 0 : 0.5,
              this.audioContext.currentTime
          );
      }
      
      // Stop completely if muted
      if (this.isMuted) {
          console.log('[AudioManager] Muted - stopping BGM');
          this.stopBgm();
      } else if (this.currentBgm) {
          // Only play if not already playing
          if (!this.bgmSource) {
              console.log('[AudioManager] Unmuted - starting BGM playback');
              this.playBgm(this.currentBgm);
          } else {
              console.log('[AudioManager] BGM already playing, no action needed');
          }
      } else {
          console.log('[AudioManager] No current BGM to play');
      }
  }

  stopBgm() {
      console.log('[AudioManager] Attempting to stop BGM');
      
      if (this.bgmSource) {
          try {
              console.log('[AudioManager] Stopping audio source');
              this.bgmSource.stop();
              this.bgmSource.disconnect();
              
              if (this.bgmGainNode) {
                  console.log('[AudioManager] Disconnecting gain node');
                  this.bgmGainNode.disconnect();
              }
          } catch (e) {
              console.error('[AudioManager] Error stopping BGM:', e);
          } finally {
              console.log('[AudioManager] Cleaning up audio resources');
              this.bgmSource = null;
              this.currentBgm = null;
          }
      } else {
          console.log('[AudioManager] No BGM to stop');
      }
  }

  get muted(): boolean {
      return this.isMuted;
  }
}

let audioManagerInstance: AudioManager | null = null;

export const createAudioManager = () => {
  if (!audioManagerInstance) {
      console.log('[AudioManager] Creating new AudioManager instance');
      audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
};

export const getAudioManager = () => {
  if (!audioManagerInstance) {
      throw new Error('AudioManager not initialized');
  }
  return audioManagerInstance;
};

export const destroyAudioManager = () => {
  if (audioManagerInstance) {
      console.log('[AudioManager] Destroying AudioManager instance');
      audioManagerInstance.stopBgm();
      audioManagerInstance = null;
  }
};