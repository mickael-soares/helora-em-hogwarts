// Trilha Sonora Mágica (Valsa de Celesta em 3/4 via Web Audio API — 100% offline)
window.MagicMusic = (function () {
    "use strict";

    // Notas em Hz (Escala mística de Mi menor / Lídio mágico — clima clássico de castelo bruxo)
    const N = {
        E3: 164.81, G3: 196.00, A3: 220.00, B3: 246.94, C4: 261.63, D4: 293.66, Ds4: 311.13,
        E4: 329.63, Fs4: 369.99, G4: 392.00, Gs4: 415.30, A4: 440.00, As4: 466.16, B4: 493.88,
        C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, E5: 659.25, Fs5: 739.99, G5: 783.99,
        A5: 880.00, B5: 987.77
    };

    // Valsa mágica original em 3/4 (16 compassos em loop suave e nostálgico)
    // Cada entrada: [notaMelodia (ou null), durBeats, notaBaixo (ou null), acorde (array opcional)]
    const SCORE = [
        // Frase A — misteriosa e encantadora
        [N.B4, 1.0, N.E3, [N.G3, N.B3]],
        [N.E5, 1.5, null, null],
        [N.G5, 0.5, null, null],
        [N.Fs5, 1.0, N.E3, [N.G3, N.B3]],
        [N.E5, 2.0, null, null],

        [N.B5, 1.0, N.A3, [N.C4, N.E4]],
        [N.A5, 2.0, null, null],
        [N.Fs5, 3.0, N.B3, [N.Ds4, N.Fs4]],

        // Frase B — ascendente e sonhadora
        [N.E5, 1.5, N.E3, [N.G3, N.B3]],
        [N.G5, 0.5, null, null],
        [N.Fs5, 1.0, null, null],
        [N.Ds5, 2.0, N.B3, [N.Fs4, N.A4]],
        [N.Fs5, 1.0, null, null],
        [N.B4, 3.0, N.E3, [N.G3, N.B3]],

        // Frase C — brilho da Sonserina (suave e esperançosa)
        [N.B4, 1.0, N.C4, [N.E4, N.G4]],
        [N.E5, 1.5, null, null],
        [N.G5, 0.5, null, null],
        [N.A5, 1.0, N.D4, [N.Fs4, N.A4]],
        [N.G5, 2.0, null, null],

        [N.Fs5, 1.0, N.G3, [N.B3, N.D4]],
        [N.E5, 1.0, null, null],
        [N.D5, 1.0, null, null],
        [N.E5, 3.0, N.E3, [N.G3, N.B3]]
    ];

    const BEAT_SEC = 0.42; // ~142 BPM em 3/4 (valsa leve de caixinha de música)

    let ctx = null;
    let masterGain = null;
    let isPlaying = false;
    let isMuted = false;
    let ducked = false;
    let stepIndex = 0;
    let nextNoteTime = 0;
    let timerId = null;

    function ensureContext(sharedCtx) {
        if (sharedCtx && !ctx) {
            ctx = sharedCtx;
        }
        if (!ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return false;
            ctx = new AudioCtx();
        }
        if (!masterGain) {
            masterGain = ctx.createGain();
            masterGain.gain.value = isMuted ? 0 : 0.24;
            masterGain.connect(ctx.destination);
        }
        if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
        }
        return true;
    }

    // Timbre de Celesta (fundamental senoide + harmônico cristalino suave)
    function playCelesta(freq, startTime, duration) {
        if (!ctx || !masterGain) return;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const overtoneGain = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(freq, startTime);

        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(freq * 2, startTime);
        overtoneGain.gain.setValueAtTime(0.18, startTime);
        overtoneGain.gain.exponentialRampToValueAtTime(0.001, startTime + Math.min(0.28, duration));

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.32, startTime + 0.014);
        gain.gain.exponentialRampToValueAtTime(0.0008, startTime + Math.max(0.45, duration * 1.15));

        osc1.connect(gain);
        osc2.connect(overtoneGain);
        overtoneGain.connect(gain);
        gain.connect(masterGain);

        osc1.start(startTime);
        osc2.start(startTime);
        const stopAt = startTime + Math.max(0.5, duration * 1.2) + 0.05;
        osc1.stop(stopAt);
        osc2.stop(stopAt);
    }

    // Pad suave de cordas/harpa ao fundo
    function playWarmPad(freq, startTime, duration, vol = 0.09) {
        if (!ctx || !masterGain) return;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(720, startTime);

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
        while (nextNoteTime < ctx.currentTime + 0.18) {
            const [melody, beats, bass, chord] = SCORE[stepIndex];
            const dur = beats * BEAT_SEC;

            if (melody) {
                playCelesta(melody, nextNoteTime, dur);
            }
            if (bass) {
                playWarmPad(bass, nextNoteTime, BEAT_SEC * 2.8, 0.12);
            }
            if (chord) {
                chord.forEach((f, idx) => {
                    playWarmPad(f, nextNoteTime + idx * 0.03, BEAT_SEC * 2.4, 0.055);
                });
            }

            nextNoteTime += dur;
            stepIndex = (stepIndex + 1) % SCORE.length;
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
            nextNoteTime = ctx.currentTime + 0.08;
            updateVolume();
            timerId = window.setInterval(scheduler, 60);
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
