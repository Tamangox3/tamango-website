export class AudioManager {
  private audioContext: AudioContext;
  private audioForwardBuffer: AudioBuffer | null = null;
  private audioReverseBuffer: AudioBuffer | null = null;
  private currentBuffer: AudioBuffer | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private startTime: number = 0;
  private bufferOffset: number = 0;
  private isPlaying: boolean = false;
  private playbackRate: number = 1;
  private playbackDirection: number = 1;

  private lastPlaybackDirectionChange: number = 0;
  private sumPlaybackDirectionChanges: number = 0;

  constructor() {
    this.audioContext = new AudioContext();
    console.log('AudioManager initialized');
  }

  async loadAudio(url: string): Promise<void> {
    console.log(`Loading audio from: ${url}`);
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.currentBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.audioForwardBuffer = this.currentBuffer;
    this.audioReverseBuffer = this.reverseAudioBuffer();
    console.log('Audio loaded and decoded');
  }

  play(startPosition?: number): void {
    if (!this.currentBuffer) {
      console.warn('No audio buffer available to play');
      return;
    }

    // Resume context but don't wait for it
    this.audioContext.resume();

    if (this.currentSource) {
      this.currentSource.stop(0);
      this.currentSource.disconnect();
    }

    const buffer = this.currentBuffer as AudioBuffer;
    
    // Clamp the start position between 0 and buffer duration
    let clampedPosition = startPosition ?? this.bufferOffset;
    clampedPosition = Math.max(0, Math.min(clampedPosition, buffer.duration));

    // Check track bounds based on direction
    if (this.playbackDirection >= 0 && startPosition && startPosition >= buffer.duration) {
      // At the end of track, going forward
      return;
    }
    if (this.playbackDirection < 0 && startPosition && startPosition <= 0) {
      // At the start of track, going backward
      return;
    }

    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = buffer;
    this.currentSource.playbackRate.value = Math.abs(this.playbackRate);
    this.currentSource.connect(this.audioContext.destination);

    this.bufferOffset = startPosition ?? this.bufferOffset;
    this.startTime = this.audioContext.currentTime;

    // For negative playback, we start from the end and play backwards
    const actualStartPosition = this.playbackDirection >= 0 
      ? this.bufferOffset 
      : buffer.duration - this.bufferOffset;

    this.currentSource.start(0, actualStartPosition);
    this.isPlaying = true;


  }

  async pause(): Promise<void> {
    if (!this.isPlaying || !this.currentSource) {
      console.warn('Audio is not playing or no current source to pause');
      return;
    }


    const elapsed = this.audioContext.currentTime - this.startTime;
    this.bufferOffset += elapsed * Math.abs(this.playbackRate) * this.playbackDirection;

    console.log(`Pausing audio at position: ${this.bufferOffset}`);
    this.currentSource.stop(0);
    this.currentSource.disconnect();
    this.currentSource = null;

    await this.audioContext.suspend();
    this.isPlaying = false;
  }

  seek(position: number): void {
    if (!this.currentBuffer) {
      console.warn('No audio buffer available to seek');
      return;
    }

    if (this.isPlaying) {
      this.currentSource?.stop();
      this.currentSource?.disconnect();
    }

    const clampedPosition = Math.max(0, Math.min(position, this.getDuration()));
    console.log(`Seeking to position: ${clampedPosition}`);

    if (this.isPlaying) {
      this.play(clampedPosition);
    } else {
      this.bufferOffset = clampedPosition;
    }
  }

  reverseAudioBuffer(): AudioBuffer {
    if (!this.currentBuffer) {
      console.warn('No audio buffer available to reverse');
      return new AudioBuffer({
        length: 0,
        numberOfChannels: 1,
        sampleRate: this.audioContext.sampleRate
      });
    }

    console.log('Reversing audio buffer');
    const numberOfChannels = this.currentBuffer.numberOfChannels;
    const length = this.currentBuffer.length;
    const sampleRate = this.currentBuffer.sampleRate;
    const reversedBuffer = this.audioContext.createBuffer(numberOfChannels, length, sampleRate);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = this.currentBuffer.getChannelData(channel);
      const reversedChannelData = reversedBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        reversedChannelData[i] = channelData[length - i - 1];
      }
    }

    return reversedBuffer;
  }

  setPlaybackRate(rate: number): void {
    if (!this.currentBuffer || !this.audioForwardBuffer || !this.audioReverseBuffer) {
      console.warn('No audio buffer available');
      return;
    }

    const currentTime = this.getCurrentTime();
    const newDirection = Math.sign(rate);
    const directionChanged = newDirection !== this.playbackDirection;

    this.playbackDirection = newDirection;
    this.playbackRate = rate;

    if (this.isPlaying) {
      this.bufferOffset = currentTime;
      this.startTime = this.audioContext.currentTime;

      if (directionChanged) {
        if (newDirection >= 0) {
          this.currentBuffer = this.audioForwardBuffer;
        } else {          
          this.currentBuffer = this.audioReverseBuffer;
        }

        this.play(this.bufferOffset);
      } else {

        if (this.currentSource) {
          this.currentSource.playbackRate.value = Math.abs(rate);
        }
      }
    }
  }

  getPlaybackRate(): number {
    return this.playbackRate;
  }

  getCurrentTime(): number {
    if (!this.isPlaying) return this.bufferOffset;
  
    const elapsed = this.audioContext.currentTime - this.startTime;
    const elapsedWithSpeed = elapsed * Math.abs(this.playbackRate);
    let currentTime: number;
  
    if (this.playbackDirection >= 0) {
      currentTime = this.bufferOffset + elapsedWithSpeed;
      // Clamp forward playback to duration
      return Math.min(currentTime, this.getDuration());
    } else {
      currentTime = this.bufferOffset - elapsedWithSpeed;
      // Clamp reverse playback to 0
      return Math.max(currentTime, 0);
    }
  }

  getDuration(): number {
    return this.currentBuffer?.duration ?? 0;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getPlaybackDirection(): number {
    return this.playbackDirection;
  }



  getBufferOffset(): number {
    return this.bufferOffset;
  }

  setBufferOffset(offset: number): void {
    this.bufferOffset = offset;
  }
}

// Helper function to fetch audio track (keeping for backward compatibility)
export async function fetchAudioTrack(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const blob = new Blob([uint8Array], { type: response.headers.get("Content-Type") ?? "audio/mp3" });
  return URL.createObjectURL(blob);
}