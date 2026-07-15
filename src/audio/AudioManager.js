/**
 * AudioManager - Handles background music and sound effects.
 * BGM auto-plays and loops. Settings saved to localStorage.
 */
class AudioManager {
    constructor() {
        this.bgm = null;
        this.isPlaying = false;
        this.volume = this._loadVolume();
        this.muted = this._loadMuted();
    }

    /** Start BGM - call from any scene */
    playBGM(scene) {
        if (this.bgm) return;

        try {
            this.bgm = scene.sound.add('bgm', { loop: true, volume: this.muted ? 0 : this.volume });
            this.bgm.play();
            this.isPlaying = true;
        } catch (e) {
            console.warn('[AudioManager] BGM load failed:', e);
        }
    }

    stopBGM() {
        if (this.bgm) { this.bgm.stop(); this.isPlaying = false; }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.bgm) this.bgm.setVolume(this.muted ? 0 : this.volume);
        this._saveMuted();
        return this.muted;
    }

    setVolume(v) {
        this.volume = Phaser.Math.Clamp(v, 0, 1);
        if (this.bgm && !this.muted) this.bgm.setVolume(this.volume);
        this._saveVolume();
    }

    isMuted() { return this.muted; }
    getVolume() { return this.volume; }

    _loadVolume() {
        try { return parseFloat(localStorage.getItem('isekai_bgm_volume')) || 0.5; } catch(e) { return 0.5; }
    }
    _saveVolume() {
        try { localStorage.setItem('isekai_bgm_volume', String(this.volume)); } catch(e) {}
    }
    _loadMuted() {
        try { return localStorage.getItem('isekai_bgm_muted') === 'true'; } catch(e) { return false; }
    }
    _saveMuted() {
        try { localStorage.setItem('isekai_bgm_muted', String(this.muted)); } catch(e) {}
    }
}

const audioManager = new AudioManager();
