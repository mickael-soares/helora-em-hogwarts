// Trilha Sonora Mágica Multi-Faixas por Mundo (Web Audio API — 100% offline)
// Playlist "valley" (3 faixas em sequência) + Playlist "castle" (2 faixas exclusivas do interior do Castelo)
window.MagicMusic = (function () {
    "use strict";

    // Notas em Hz
    const N = {
        C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, Gs3: 207.65, A3: 220.00, Bb3: 233.08, B3: 246.94,
        C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Gs4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
        C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Gs5: 830.61, A5: 880.00, B5: 987.77,
        C6: 1046.50
    };

    const PLAYLISTS = {
        valley: [
            {
                name: "Valsa da Coruja",
                beatSec: 0.42,
                voice: "celesta",
                loops: 2,
                score: [
                    [N.B4, 1.0, N.E3, [N.G3, N.B3]],
                    [N.E5, 1.5, null, null],
                    [N.G5, 0.5, null, null],
                    [N.Fs5, 1.0, N.E3, [N.G3, N.B3]],
                    [N.E5, 2.0, null, null],
                    [N.B5, 1.0, N.A3, [N.C4, N.E4]],
                    [N.A5, 2.0, null, null],
                    [N.Fs5, 3.0, N.B3, [N.Ds4, N.Fs4]],

                    [N.E5, 1.5, N.E3, [N.G3, N.B3]],
                    [N.G5, 0.5, null, null],
                    [N.Fs5, 1.0, null, null],
                    [N.Ds5, 2.0, N.B3, [N.Fs4, N.A4]],
                    [N.Fs5, 1.0, null, null],
                    [N.B4, 3.0, N.E3, [N.G3, N.B3]],

                    [N.B4, 1.0, N.C4, [N.E4, N.G4]],
                    [N.E5, 1.5, null, null],
                    [N.G5, 0.5, null, null],
                    [N.A5, 1.0, N.D4, [N.Fs4, N.A4]],
                    [N.G5, 2.0, null, null],
                    [N.Fs5, 1.0, N.G3, [N.B3, N.D4]],
                    [N.E5, 1.0, null, null],
                    [N.D5, 1.0, null, null],
                    [N.E5, 3.0, N.E3, [N.G3, N.B3]]
                ]
            },
            {
                name: "Voo sobre o Vale",
                beatSec: 0.36,
                voice: "flute_harp",
                loops: 2,
                score: [
                    [N.D5, 1.0, N.G3, [N.B3, N.D4]],
                    [N.G5, 1.5, null, null],
                    [N.A5, 0.5, null, null],
                    [N.B5, 1.0, N.E3, [N.G3, N.B3]],
                    [N.A5, 1.0, null, null],
                    [N.G5, 1.0, null, null],
                    [N.Fs5, 1.5, N.D3, [N.Fs4, N.A4]],
                    [N.E5, 0.5, null, null],
                    [N.D5, 2.0, null, null],

                    [N.E5, 1.0, N.C3, [N.E4, N.G4]],
                    [N.G5, 1.0, null, null],
                    [N.C6, 1.5, N.C3, [N.E4, N.G4]],
                    [N.B5, 0.5, null, null],
                    [N.A5, 1.0, N.D3, [N.Fs4, N.A4]],
                    [N.G5, 1.0, null, null],
                    [N.Fs5, 2.0, N.D3, [N.A3, N.D4]],

                    [N.G5, 1.0, N.G3, [N.B3, N.D4]],
                    [N.A5, 1.0, null, null],
                    [N.B5, 1.0, N.E3, [N.G3, N.B3]],
                    [N.G5, 1.0, null, null],
                    [N.E5, 1.0, N.C3, [N.E4, N.G4]],
                    [N.Fs5, 1.0, N.D3, [N.Fs4, N.A4]],
                    [N.G5, 3.0, N.G3, [N.B3, N.D4]]
                ]
            },
            {
                name: "Noturno do Lago Negro",
                beatSec: 0.48,
                voice: "harp_bell",
                loops: 2,
                score: [
                    [N.A4, 1.0, N.D3, [N.F3, N.A3]],
                    [N.D5, 1.5, null, null],
                    [N.F5, 0.5, null, null],
                    [N.E5, 1.0, N.C3, [N.E4, N.G4]],
                    [N.D5, 2.0, null, null],

                    [N.A5, 1.5, N.Bb3, [N.D4, N.F4]],
                    [N.G5, 0.5, null, null],
                    [N.F5, 1.0, N.A3, [N.Cs4, N.E4]],
                    [N.E5, 3.0, null, null],

                    [N.F5, 1.0, N.G3, [N.Bb3, N.D4]],
                    [N.G5, 1.0, null, null],
                    [N.A5, 1.0, N.D3, [N.F3, N.A3]],
                    [N.F5, 1.5, null, null],
                    [N.E5, 0.5, null, null],
                    [N.C5, 1.0, N.A3, [N.E4, N.G4]],
                    [N.D5, 3.0, N.D3, [N.F3, N.A3]]
                ]
            }
        ],

        castle: [
            {
                name: "Corredores de Hogwarts",
                beatSec: 0.40,
                voice: "castle_harp",
                loops: 2,
                score: [
                    [N.E5, 1.0, N.A3, [N.C4, N.E4]],
                    [N.C5, 0.5, null, null],
                    [N.E5, 0.5, null, null],
                    [N.A5, 1.0, N.A3, [N.C4, N.E4]],
                    [N.Gs5, 1.5, N.E3, [N.Gs3, N.B3]],
                    [N.E5, 0.5, null, null],
                    [N.B4, 1.0, null, null],

                    [N.C5, 1.0, N.F3, [N.A3, N.C4]],
                    [N.D5, 0.5, null, null],
                    [N.E5, 0.5, null, null],
                    [N.F5, 1.0, N.D3, [N.F3, N.A3]],
                    [N.E5, 2.0, N.E3, [N.Gs3, N.B3]],
                    [N.D5, 1.0, null, null],

                    [N.C5, 1.0, N.A3, [N.C4, N.E4]],
                    [N.E5, 1.0, null, null],
                    [N.G5, 1.0, N.G3, [N.B3, N.D4]],
                    [N.F5, 1.0, N.F3, [N.A3, N.C4]],
                    [N.E5, 1.0, N.E3, [N.Gs3, N.B3]],
                    [N.A4, 3.0, N.A3, [N.C4, N.E4]]
                ]
            },
            {
                name: "Salão Principal à Luz de Velas",
                beatSec: 0.44,
                voice: "celesta",
                loops: 2,
                score: [
                    [N.G4, 1.0, N.C3, [N.E4, N.G4]],
                    [N.C5, 1.5, null, null],
                    [N.E5, 0.5, null, null],
                    [N.G5, 1.0, N.A3, [N.C4, N.E4]],
                    [N.Fs5, 2.0, N.D3, [N.Fs4, N.A4]],

                    [N.G5, 1.0, N.G3, [N.B3, N.D4]],
                    [N.A5, 1.0, null, null],
                    [N.B5, 1.0, N.E3, [N.G3, N.B3]],
                    [N.C6, 2.0, N.C3, [N.E4, N.G4]],
                    [N.G5, 1.0, null, null],

                    [N.A5, 1.5, N.F3, [N.A3, N.C4]],
                    [N.G5, 0.5, null, null],
                    [N.E5, 1.0, N.C3, [N.E4, N.G4]],
                    [N.D5, 1.5, N.G3, [N.B3, N.D4]],
                    [N.E5, 0.5, null, null],
                    [N.C5, 3.0, N.C3, [N.E4, N.G4]]
                ]
            }
        ]
    };

    let ctx = null;
    let masterGain = null;
    let isPlaying = false;
    let isMuted = false;
    let ducked = false;
    let currentWorld = "valley";
    let trackIndex = 0;
    let loopCount = 0;
    let stepIndex = 0;
    let nextNoteTime = 0;
    let timerId = null;

    function ensureContext(sharedCtx) {
        if (sharedCtx && !ctx) ctx = sharedCtx;
        if (!ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return false;
            ctx = new AudioCtx();
        }
        if (!masterGain) {
            masterGain = ctx.createGain();
            masterGain.gain.value = isMuted ? 0.0001 : 0.24;
            masterGain.connect(ctx.destination);
        }
        if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
        }
        return true;
    }

    function playVoice(voice, freq, startTime, duration) {
        if (!ctx || !masterGain) return;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const overtoneGain = ctx.createGain();

        if (voice === "flute_harp") {
            osc1.type = "sine";
            osc2.type = "sine";
            osc1.frequency.setValueAtTime(freq, startTime);
            osc2.frequency.setValueAtTime(freq * 1.5, startTime);
            overtoneGain.gain.setValueAtTime(0.08, startTime);
            overtoneGain.gain.exponentialRampToValueAtTime(0.001, startTime + Math.min(0.25, duration));
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.linearRampToValueAtTime(0.26, startTime + 0.045);
            gain.gain.exponentialRampToValueAtTime(0.0008, startTime + Math.max(0.42, duration * 1.05));
        } else if (voice === "castle_harp") {
            osc1.type = "triangle";
            osc2.type = "sine";
            osc1.frequency.setValueAtTime(freq, startTime);
            osc2.frequency.setValueAtTime(freq * 2, startTime);
            overtoneGain.gain.setValueAtTime(0.22, startTime);
            overtoneGain.gain.exponentialRampToValueAtTime(0.001, startTime + Math.min(0.22, duration));
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.linearRampToValueAtTime(0.27, startTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0008, startTime + Math.max(0.4, duration * 1.1));
        } else if (voice === "harp_bell") {
            osc1.type = "sine";
            osc2.type = "triangle";
            osc1.frequency.setValueAtTime(freq, startTime);
            osc2.frequency.setValueAtTime(freq * 3, startTime);
            overtoneGain.gain.setValueAtTime(0.10, startTime);
            overtoneGain.gain.exponentialRampToValueAtTime(0.001, startTime + Math.min(0.20, duration));
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.linearRampToValueAtTime(0.28, startTime + 0.018);
            gain.gain.exponentialRampToValueAtTime(0.0008, startTime + Math.max(0.55, duration * 1.25));
        } else {
            // Celesta clássica cristalina
            osc1.type = "sine";
            osc2.type = "triangle";
            osc1.frequency.setValueAtTime(freq, startTime);
            osc2.frequency.setValueAtTime(freq * 2, startTime);
            overtoneGain.gain.setValueAtTime(0.18, startTime);
            overtoneGain.gain.exponentialRampToValueAtTime(0.001, startTime + Math.min(0.28, duration));
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.linearRampToValueAtTime(0.30, startTime + 0.014);
            gain.gain.exponentialRampToValueAtTime(0.0008, startTime + Math.max(0.45, duration * 1.15));
        }

        osc1.connect(gain);
        osc2.connect(overtoneGain);
        overtoneGain.connect(gain);
        gain.connect(masterGain);

        osc1.start(startTime);
        osc2.start(startTime);
        const stopAt = startTime + Math.max(0.55, duration * 1.3) + 0.05;
        osc1.stop(stopAt);
        osc2.stop(stopAt);
    }

    function playWarmPad(freq, startTime, duration, vol = 0.085) {
        if (!ctx || !masterGain) return;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(currentWorld === "castle" ? 640 : 740, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.14);
        gain.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
    }

    function scheduler() {
        if (!isPlaying || !ctx) return;
        const list = PLAYLISTS[currentWorld] || PLAYLISTS.valley;
        while (nextNoteTime < ctx.currentTime + 0.18) {
            const track = list[trackIndex % list.length];
            const [melody, beats, bass, chord] = track.score[stepIndex];
            const dur = beats * track.beatSec;

            if (melody) playVoice(track.voice, melody, nextNoteTime, dur);
            if (bass) playWarmPad(bass, nextNoteTime, track.beatSec * 2.8, 0.11);
            if (chord) {
                chord.forEach((f, idx) => {
                    playWarmPad(f, nextNoteTime + idx * 0.035, track.beatSec * 2.4, 0.052);
                });
            }

            nextNoteTime += dur;
            stepIndex += 1;

            if (stepIndex >= track.score.length) {
                stepIndex = 0;
                loopCount += 1;
                if (loopCount >= (track.loops || 2)) {
                    // Terminou a música -> avança automaticamente para a próxima faixa da playlist!
                    loopCount = 0;
                    trackIndex = (trackIndex + 1) % list.length;
                    nextNoteTime += 0.95; // Breve respiro musical entre faixas
                }
            }
        }
    }

    function updateVolume() {
        if (!masterGain || !ctx) return;
        const target = isMuted ? 0.0001 : (ducked ? 0.11 : 0.24);
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.setTargetAtTime(target, ctx.currentTime, 0.18);
    }

    return {
        start(sharedCtx) {
            if (!ensureContext(sharedCtx)) return;
            if (isPlaying) {
                updateVolume();
                return;
            }
            isPlaying = true;
            stepIndex = 0;
            loopCount = 0;
            nextNoteTime = ctx.currentTime + 0.08;
            updateVolume();
            timerId = window.setInterval(scheduler, 60);
        },
        setWorld(worldKey) {
            const nextWorld = PLAYLISTS[worldKey] ? worldKey : "valley";
            if (nextWorld === currentWorld) return;
            currentWorld = nextWorld;
            trackIndex = 0;
            loopCount = 0;
            stepIndex = 0;
            if (ctx && masterGain && isPlaying) {
                // Crossfade suave ao entrar/sair do Castelo
                const now = ctx.currentTime;
                masterGain.gain.cancelScheduledValues(now);
                masterGain.gain.setTargetAtTime(0.001, now, 0.08);
                nextNoteTime = now + 0.35;
                setTimeout(() => updateVolume(), 300);
            }
        },
        getCurrentTrackName() {
            const list = PLAYLISTS[currentWorld] || PLAYLISTS.valley;
            return list[trackIndex % list.length].name;
        },
        setMuted(muted) {
            isMuted = !!muted;
            updateVolume();
        },
        setDucked(isDucked) {
            ducked = !!isDucked;
            updateVolume();
        },
        stop() {
            isPlaying = false;
            if (timerId) {
                clearInterval(timerId);
                timerId = null;
            }
        }
    };
})();
