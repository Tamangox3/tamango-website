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

  // nodes
  // volume
  private gainNode: GainNode;
  // filter, decrease high pitch effect
  private filter: BiquadFilterNode;
  // distortion effect
  private waveshaper: WaveShaperNode;


  constructor() {
    this.audioContext = new AudioContext();
    console.log('AudioManager initialized');
    this.gainNode = this.audioContext.createGain();
        
    // Create effect nodes
    this.filter = this.audioContext.createBiquadFilter();
    this.waveshaper = this.audioContext.createWaveShaper();
    
    // Default setup
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 20000; // Start with no filtering
    
    this.gainNode.connect(this.audioContext.destination);
    this.waveshaper.connect(this.audioContext.destination);
    this.filter.connect(this.audioContext.destination);
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

  // Helper for distortion curves for waveshaper
createDistortionCurve(amount: number) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1;
      curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
  }
  
  return curve;
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


    const absRate = Math.abs(rate);
    // track frequency filter
    // 1x: 20000, scale down to 400 as speed increases
    // could have used gsap tween again but this is simpler

    if (absRate > 1) {
      // chose baseFrequency 5000, it was still really high pitched with the baseFrequency at 20000
      const baseFrequency = 5000; 
      const scaledFrequency = baseFrequency / absRate ;
      
      const minFrequency = 400;
      const frequency = Math.max(minFrequency, scaledFrequency);
      
      this.setFilter(frequency);
      
        } 
      else {
      // reset  
      this.setFilter(20000);
    }
        
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

  getVolume(): number {
    return this.gainNode.gain.value;
  }

  setVolume(volume: number): void {
    this.gainNode.gain.value = volume;
  }

  getDistortion(): number {
    return Number(this.waveshaper.curve);
  }

  setDistortion(distortion: number): void {
    this.waveshaper.curve = this.createDistortionCurve(distortion);
  }

  getFilter(): number {
    return this.filter.frequency.value;
  }

  setFilter(filter: number): void {
    this.filter.frequency.value = filter;
  }
}
