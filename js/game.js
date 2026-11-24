(function () {
    "use strict";

    const DATA = window.HELORA_QUIZ_DATA;
    const ASSETS = window.HELORA_ASSETS;

    const GAME_W = 1280;
    const GAME_H = 720;
    const GROUND_Y = 646;
    const WALK_SPEED = 295;

    // Web Audio API (efeitos sonoros mágicos leves, 100% offline)
    const SoundFX = {
        ctx: null,
        muted: false,
        unlock() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === "suspended") {
                this.ctx.resume().catch(() => {});
            }
        },
        tone(freq, startOffset, duration, type = "triangle", volume = 0.12) {
            if (this.muted || !this.ctx) return;
            const now = this.ctx.currentTime + startOffset;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + duration + 0.02);
        },
        playCollect() {
            this.tone(880, 0.00, 0.12, "sine", 0.09);
            this.tone(1318.5, 0.05, 0.18, "sine", 0.09);
        },
        playChime() {
            this.tone(523.25, 0.00, 0.25, "triangle", 0.12);
            this.tone(659.25, 0.08, 0.28, "triangle", 0.12);
            this.tone(783.99, 0.16, 0.35, "sine", 0.13);
            this.tone(1046.5, 0.24, 0.45, "sine", 0.10);
        },
        playWrong() {
            this.tone(240, 0.00, 0.18, "sawtooth", 0.07);
            this.tone(195, 0.12, 0.24, "sawtooth", 0.07);
        },
        playPopup() {
            this.tone(440, 0.00, 0.18, "sine", 0.09);
            this.tone(659.25, 0.07, 0.24, "sine", 0.09);
        },
        playSpellCast() {
            const notes = [587.33, 739.99, 880.0, 1174.66, 1479.98];
            notes.forEach((n, i) => this.tone(n, i * 0.055, 0.32, "sine", 0.11));
        },
        playCakeAppear() {
            const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
            notes.forEach((n, i) => this.tone(n, i * 0.06, 0.42, "triangle", 0.13));
        },
        playFanfare() {
            const notes = [523.25, 659.25, 783.99, 1046.5, 987.77, 1046.5];
            const times = [0.00, 0.10, 0.20, 0.32, 0.46, 0.56];
            notes.forEach((n, i) => this.tone(n, times[i], 0.45, "triangle", 0.13));
        },
        playMeow() {
            if (this.muted || !this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(620, now);
            osc.frequency.exponentialRampToValueAtTime(920, now + 0.11);
            osc.frequency.exponentialRampToValueAtTime(540, now + 0.28);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.11, now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.30);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.32);
        },
        playLumos() {
            [523.25, 783.99, 1046.5, 1567.98].forEach((n, i) => this.tone(n, i * 0.06, 0.45, "sine", 0.11));
        },
        playPotion() {
            [659.25, 880, 1174.66, 1318.5].forEach((n, i) => this.tone(n, i * 0.05, 0.26, "triangle", 0.11));
        }
    };

    // UI Controller
    const UI = {
        hud: document.getElementById("hud"),
        hudLocation: document.getElementById("hud-location"),
        hudPoints: document.getElementById("hud-points"),
        hudFelix: document.getElementById("hud-felix"),
        hudCount: document.getElementById("hud-count"),
        orbs: Array.from(document.querySelectorAll("#hud .orb")),
        btnMute: document.getElementById("btn-mute"),
        btnFullscreen: document.getElementById("btn-fullscreen"),
        controlsBar: document.getElementById("controls-bar"),
        btnWalk: document.getElementById("btn-walk"),
        btnLumos: document.getElementById("btn-lumos"),
        challengeBanner: document.getElementById("challenge-banner"),
        phaseTransition: document.getElementById("phase-transition"),
        phaseKicker: document.getElementById("phase-kicker"),
        phaseTitle: document.getElementById("phase-title"),
        phaseSub: document.getElementById("phase-sub"),
        introOverlay: document.getElementById("intro-overlay"),
        btnStart: document.getElementById("btn-start"),
        quizOverlay: document.getElementById("quiz-overlay"),
        quizSeal: document.getElementById("quiz-seal"),
        quizBadge: document.getElementById("quiz-badge"),
        quizLoc: document.getElementById("quiz-loc"),
        quizQuestion: document.getElementById("quiz-question"),
        quizOptions: document.getElementById("quiz-options"),
        quizFeedback: document.getElementById("quiz-feedback"),
        isacBubble: document.getElementById("isac-bubble"),
        isacText: document.getElementById("isac-text"),
        envelopeOverlay: document.getElementById("envelope-overlay"),
        btnOpenEnvelope: document.getElementById("btn-open-envelope"),
        cardOverlay: document.getElementById("card-overlay"),
        confettiLayer: document.getElementById("confetti-layer"),
        bdayBadge: document.getElementById("bday-badge"),
        bdayTitle: document.getElementById("bday-title"),
        bdaySubtitle: document.getElementById("bday-subtitle"),
        bdayMessage: document.getElementById("bday-message"),
        bdayStats: document.getElementById("bday-stats"),
        bdaySignature: document.getElementById("bday-signature"),
        btnReplay: document.getElementById("btn-replay"),

        updateProgress(solvedCount, locationText) {
            this.hudCount.textContent = `${solvedCount}/${DATA.quizzes.length}`;
            this.orbs.forEach((orb, idx) => {
                orb.classList.toggle("done", idx < solvedCount);
            });
            if (locationText) this.hudLocation.textContent = locationText;
        },

        updatePoints(pts) {
            if (this.hudPoints) this.hudPoints.textContent = `${pts} pts`;
        },

        showPhaseTransition(stageIdx, stage, onMidpoint, onDone) {
            this.phaseKicker.textContent = `FASE ${stageIdx + 1} DE ${DATA.quizzes.length}`;
            this.phaseTitle.textContent = stage.location;
            this.phaseSub.textContent = stage.subtitle || "";
            this.phaseTransition.classList.remove("hidden");
            requestAnimationFrame(() => {
                this.phaseTransition.classList.add("show");
            });
            setTimeout(() => {
                if (onMidpoint) onMidpoint();
                setTimeout(() => {
                    this.phaseTransition.classList.remove("show");
                    setTimeout(() => {
                        this.phaseTransition.classList.add("hidden");
                        if (onDone) onDone();
                    }, 380);
                }, 780);
            }, 380);
        },

        showQuiz(quiz, onSolved) {
            SoundFX.playPopup();
            this.quizSeal.textContent = String(quiz.id);
            this.quizBadge.textContent = `Quiz ${quiz.id}/${DATA.quizzes.length}`;
            this.quizLoc.textContent = quiz.location;
            this.quizQuestion.textContent = quiz.question;
            this.quizFeedback.className = "quiz-feedback hidden";
            this.quizFeedback.textContent = "";
            this.quizOptions.innerHTML = "";

            const letters = ["A", "B", "C", "D"];
            let locked = false;

            quiz.options.forEach((optText, idx) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "quiz-opt-btn";
                btn.innerHTML = `<span class="opt-letter">${letters[idx]}</span><span>${optText}</span>`;
                btn.addEventListener("click", () => {
                    if (locked) return;
                    if (idx === quiz.correctIndex) {
                        locked = true;
                        btn.classList.add("correct");
                        Array.from(this.quizOptions.children).forEach((b) => (b.disabled = true));
                        this.quizFeedback.textContent = quiz.successMsg;
                        this.quizFeedback.className = "quiz-feedback ok";
                        SoundFX.playChime();
                        setTimeout(() => {
                            this.quizOverlay.classList.add("hidden");
                            onSolved();
                        }, 1150);
                    } else {
                        btn.classList.add("wrong");
                        btn.disabled = true;
                        this.quizFeedback.textContent = quiz.wrongHint;
                        this.quizFeedback.className = "quiz-feedback err";
                        SoundFX.playWrong();
                    }
                });
                this.quizOptions.appendChild(btn);
            });

            this.quizOverlay.classList.remove("hidden");
        },

        showEnvelope(housePoints, onOpen) {
            SoundFX.playFanfare();
            this.envelopeOverlay.classList.remove("hidden");
            this.btnOpenEnvelope.onclick = () => {
                this.envelopeOverlay.classList.add("hidden");
                this.showBirthdayCard(housePoints);
                if (onOpen) onOpen();
            };
        },

        showBirthdayCard(housePoints = 0) {
            const c = DATA.birthdayCard;
            this.bdayBadge.textContent = c.badge;
            this.bdayTitle.textContent = c.title;
            this.bdaySubtitle.textContent = c.subtitle;
            this.bdayMessage.innerHTML = c.message.map((p) => `<p>${p}</p>`).join("");
            if (this.bdayStats) {
                this.bdayStats.textContent = `🏆 ${DATA.quizzes.length}/${DATA.quizzes.length} fases completas • ${housePoints} pts para a Sonserina!`;
            }
            this.bdaySignature.textContent = c.signature;
            this.cardOverlay.classList.remove("hidden");
            SoundFX.playFanfare();
            this.spawnConfetti();
        },

        spawnConfetti() {
            this.confettiLayer.innerHTML = "";
            const colors = ["#2ea367", "#e6c267", "#d9e2e6", "#1a5c3a", "#fff2b2", "#9b1c26"];
            for (let i = 0; i < 65; i++) {
                const el = document.createElement("div");
                el.className = "confetti-piece";
                el.style.left = `${Math.random() * 100}%`;
                el.style.background = colors[i % colors.length];
                el.style.width = `${7 + Math.random() * 7}px`;
                el.style.height = `${10 + Math.random() * 10}px`;
                el.style.animationDuration = `${2.6 + Math.random() * 2.8}s`;
                el.style.animationDelay = `${Math.random() * 1.4}s`;
                this.confettiLayer.appendChild(el);
            }
        }
    };

    const InputState = {
        touchWalk: false,
        canvasHoldRight: false
    };

    class HogwartsJourneyScene extends Phaser.Scene {
        constructor() {
            super({ key: "HogwartsJourneyScene" });
        }

        preload() {
            // 5 Backgrounds 100% únicos e inteiros (1 por fase — sem cortar, sem duplicar!)
            this.load.image("bg_diagon_alley", ASSETS.bg_diagon_alley);
            this.load.image("bg_forest_rail", ASSETS.bg_forest_rail);
            this.load.image("bg_quidditch_pitch", ASSETS.bg_quidditch_pitch);
            this.load.image("bg_slytherin_common", ASSETS.bg_slytherin_common);
            this.load.image("bg_hogwarts", ASSETS.bg_hogwarts);
            this.load.image("bg_hogwarts_approach", ASSETS.bg_hogwarts_approach);

            // Personagens (Helora e Gatinho laterais 100% intactos + sprites de costas para Fase 5!)
            this.load.image("helora_idle", ASSETS.helora_idle);
            this.load.image("helora_celebrate", ASSETS.helora_celebrate);
            this.load.spritesheet("helora_walk", ASSETS.helora_walk, { frameWidth: 256, frameHeight: 256 });
            this.load.spritesheet("helora_back_walk", ASSETS.helora_back_walk, { frameWidth: 256, frameHeight: 256 });
            this.load.image("isac_broom", ASSETS.isac_broom);
            this.load.image("kitten_idle", ASSETS.kitten_idle);
            this.load.spritesheet("kitten_walk", ASSETS.kitten_walk, { frameWidth: 144, frameHeight: 128 });
            this.load.image("kitten_back", ASSETS.kitten_back);

            // Props e coletáveis
            this.load.image("decor_star", ASSETS.decor_star);
            this.load.image("decor_potion", ASSETS.decor_potion);
            this.load.image("mid_train", ASSETS.mid_train);
            this.load.image("prop_platform", ASSETS.prop_platform);
            this.load.image("prop_owl", ASSETS.prop_owl);
            this.load.image("prop_snitch", ASSETS.prop_snitch);
            this.load.image("prop_hat", ASSETS.prop_hat);
            this.load.image("prop_gate", ASSETS.prop_gate);
            this.load.image("prop_cake", ASSETS.prop_cake);
        }

        create() {
            this.state = "INTRO"; // INTRO | WALKING | QUIZ | SNITCH_HUNT | CELEBRATE | TRANSITION | FINALE
            this.stageIdx = 0;
            this.stageWidth = 2250;
            this.solvedIds = new Set();
            this.housePoints = 0;
            this.walkPhase = 0;
            this.playerVel = 0;
            this.particleTimer = 0;
            this.stepDustTimer = 0;
            this.shootingStarTimer = 3.5;
            this.felixTimer = 0;
            this.lastPetTime = 0;
            this.stageObjects = [];
            this.stageTweens = [];

            // Texturas auxiliares de brilho suave
            if (!this.textures.exists("sparkle_dot")) {
                const g = this.make.graphics({ x: 0, y: 0, add: false });
                g.fillStyle(0xffffff, 1);
                g.fillCircle(8, 8, 5);
                g.fillStyle(0xfff5cc, 0.45);
                g.fillCircle(8, 8, 8);
                g.generateTexture("sparkle_dot", 16, 16);
                g.destroy();
            }
            if (!this.textures.exists("soft_glow")) {
                const g = this.make.graphics({ x: 0, y: 0, add: false });
                g.fillStyle(0xffe484, 0.16);
                g.fillCircle(48, 48, 48);
                g.fillStyle(0xffe484, 0.28);
                g.fillCircle(48, 48, 28);
                g.fillStyle(0xffffff, 0.45);
                g.fillCircle(48, 48, 12);
                g.generateTexture("soft_glow", 96, 96);
                g.destroy();
            }

            // 1. Background Único e Inteiro da Fase Atual (sempre 100% íntegro, sem corte/emenda!)
            this.stageBg = this.add.image(GAME_W / 2, GAME_H / 2, DATA.quizzes[0].bgKey);
            this.stageBg.setDepth(0);

            // Overlay escuro exclusivo do mini-desafio Lumos (Fase 2)
            this.darknessOverlay = this.add.rectangle(GAME_W / 2, GAME_H / 2, 2600, GAME_H, 0x040712, 0).setDepth(12.5);

            // 2. Isac voando no céu (somente nas fases externas!)
            this.isacBgDir = 1;
            this.isacBgRelX = -120;
            this.isacBgTrailTimer = 0;
            this.isacBg = this.add.image(100, 148, "isac_broom").setScale(0.36).setAlpha(0.94).setDepth(1);

            // 3. Animações da Helora e do Gatinho (100% intactas!)
            if (!this.anims.exists("kitten_walk_anim")) {
                this.anims.create({
                    key: "kitten_walk_anim",
                    frames: this.anims.generateFrameNumbers("kitten_walk", { start: 0, end: 3 }),
                    frameRate: 9,
                    repeat: -1
                });
            }
            if (!this.anims.exists("helora_walk_anim")) {
                this.anims.create({
                    key: "helora_walk_anim",
                    frames: this.anims.generateFrameNumbers("helora_walk", { start: 0, end: 3 }),
                    frameRate: 7,
                    repeat: -1
                });
            }
            if (!this.anims.exists("helora_back_anim")) {
                this.anims.create({
                    key: "helora_back_anim",
                    frames: this.anims.generateFrameNumbers("helora_back_walk", { start: 0, end: 1 }),
                    frameRate: 5.5,
                    repeat: -1
                });
            }

            // Gatinho Laranjinha (interativo para carinho!)
            this.kittenShadow = this.add.ellipse(95, GROUND_Y - 2, 54, 12, 0x080716, 0.36).setDepth(8);
            this.kitten = this.add.sprite(95, GROUND_Y - 2, "kitten_idle").setOrigin(0.5, 1).setScale(0.74).setDepth(10);
            this.kitten.setInteractive({ useHandCursor: true });
            this.kitten.on("pointerdown", () => this.petKitten());

            // Aura dourada da Poção Felix Felicis
            this.felixAura = this.add.image(210, GROUND_Y - 95, "soft_glow").setTint(0xffe066).setScale(2.1).setAlpha(0).setDepth(9);

            // Helora
            this.playerShadow = this.add.ellipse(210, GROUND_Y - 4, 96, 22, 0x080716, 0.42).setDepth(8);
            this.player = this.add.sprite(210, GROUND_Y, "helora_idle").setOrigin(0.5, 1).setScale(0.92).setDepth(10);

            // Controles
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keyL = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
            this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

            this.input.on("pointerdown", (pointer, currentlyOver) => {
                if (currentlyOver && currentlyOver.length > 0) return; // Não andar quando tocar no gatinho ou Pomo!
                if (this.state === "WALKING" && pointer.x > this.scale.width * 0.35) {
                    InputState.canvasHoldRight = true;
                }
            });
            this.input.on("pointerup", () => { InputState.canvasHoldRight = false; });
            this.input.on("pointerupoutside", () => { InputState.canvasHoldRight = false; });

            // Carregar Fase 1 (Beco Diagonal)
            this.loadStage(0);

            // Câmera responsiva (100% tela cheia PC + Celular retrato/paisagem)
            this.applyResponsiveCamera(this.scale.width, this.scale.height);
            this.scale.on("resize", (gameSize) => {
                this.applyResponsiveCamera(gameSize.width, gameSize.height);
            });

            window.__heloraScene = this;
        }

        trackObj(obj) {
            this.stageObjects.push(obj);
            return obj;
        }

        clearStageObjects() {
            this.stageTweens.forEach((tw) => tw && tw.stop && tw.stop());
            this.stageTweens = [];
            this.stageObjects.forEach((obj) => {
                if (obj && obj.destroy) obj.destroy();
            });
            this.stageObjects = [];
            if (this.huntSnitch) {
                this.huntSnitch.destroy();
                this.huntSnitch = null;
            }
            if (this.isacHero) {
                this.isacHero.destroy();
                this.isacHero = null;
            }
            this.trainRig = null;
            this.cakeSprite = null;
            this.finaleGlow = null;
            this.finaleMarker = null;
            this.exitMarker = null;
            this.checkpoint = null;
            this.collectibleStars = [];
            this.stagePotion = null;
            this.ambientFireflies = [];
        }

        loadStage(idx) {
            this.clearStageObjects();
            this.stageIdx = idx;
            const stage = DATA.quizzes[idx];
            this.currentStage = stage;
            this.isPerspective = !!stage.perspectiveMode;
            this.depthProgress = 0;
            this.depthVel = 0;
            this.stageWidth = this.isPerspective ? GAME_W : 2200;
            this.stageQuizSolved = false;
            this.lumosActive = false;
            this.lumosSolved = false;
            this.snitchSolved = false;
            this.snitchHits = 0;

            UI.btnLumos.classList.add("hidden");
            UI.challengeBanner.classList.add("hidden");
            this.darknessOverlay.setAlpha(0);

            // Configurar o background único e inteiro desta fase!
            this.stageBg.setTexture(stage.bgKey);
            this.cameras.main.setBounds(0, 0, this.stageWidth, GAME_H);

            // Isac voando no céu apenas em fases ao ar livre (fica fora da Sala Comunal!)
            this.isacBg.setVisible(!stage.indoor);
            this.isacBgRelX = -120;
            this.isacBgDir = 1;
            this.isacBg.setFlipX(false);

            // 1. Vagalumes mágicos sutis
            for (let i = 0; i < 18; i++) {
                const fx = Phaser.Math.Between(120, this.stageWidth - 120);
                const fy = Phaser.Math.Between(100, 540);
                const dot = this.trackObj(this.add.image(fx, fy, "sparkle_dot")
                    .setTint(i % 2 === 0 ? 0x52f29b : 0xffe484)
                    .setScale(Phaser.Math.FloatBetween(0.26, 0.56))
                    .setAlpha(Phaser.Math.FloatBetween(0.28, 0.78))
                    .setDepth(3));
                dot.baseY = fy;
                dot.phase = Math.random() * Math.PI * 2;
                dot.speed = Phaser.Math.FloatBetween(0.8, 1.8);
                this.ambientFireflies.push(dot);
            }

            // === FASE 5 EM PERSPECTIVA 2.5D "DE COSTAS" ENTRANDO EM HOGWARTS ===
            if (this.isPerspective) {
                this.playerVel = 0;
                this.player.anims.stop();
                this.player.setPosition(GAME_W / 2 + 24, 686).setTexture("helora_back_walk", 0).setFlipX(false).setAngle(0).setScale(1.02);
                this.playerShadow.setPosition(GAME_W / 2 + 24, 682).setScale(1);

                this.kitten.anims.stop();
                this.kitten.setPosition(GAME_W / 2 - 86, 690).setTexture("kitten_back").setFlipX(false).setAngle(0).setScale(0.84);
                this.kittenShadow.setPosition(GAME_W / 2 - 86, 686).setScale(1);

                // 3 Estrelas coletáveis ao longo da estrada em perspectiva!
                [0.24, 0.44, 0.60].forEach((prog, i) => {
                    const sy = Phaser.Math.Linear(640, 470, prog);
                    const sScale = Phaser.Math.Linear(0.95, 0.52, prog);
                    const star = this.trackObj(this.add.image(GAME_W / 2, sy, "decor_star").setScale(sScale).setDepth(6));
                    this.stageTweens.push(this.tweens.add({
                        targets: star, y: sy - 10, duration: 900 + i * 110, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
                    }));
                    this.collectibleStars.push({ sprite: star, collected: false, progressTarget: prog, baseX: GAME_W / 2, baseY: sy });
                });

                // Marcador do 5º Quiz no Portão de Hogwarts
                const marker = this.trackObj(this.add.text(GAME_W / 2, 398, `✦ Quiz 5 • Portão de Hogwarts ✦`, {
                    fontFamily: "Cinzel, serif", fontSize: "19px", fontStyle: "bold",
                    color: "#fff3c4", backgroundColor: "rgba(13, 43, 29, 0.88)", padding: { x: 12, y: 5 }
                }).setOrigin(0.5).setDepth(7));
                this.stageTweens.push(this.tweens.add({
                    targets: marker, y: 390, duration: 1000, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
                }));
                this.checkpoint = { quiz: stage, worldX: GAME_W / 2, sprite: null, marker };

                // Chegada Mágica + Bolo Invisível (invocado pela magia do Isac em frente ao Castelo!)
                this.finaleX = GAME_W / 2;
                this.finaleGlow = this.trackObj(this.add.image(GAME_W / 2, 530, "soft_glow")
                    .setTint(0x52f29b).setScale(1.6, 0.5).setAlpha(0.75).setDepth(4));
                this.stageTweens.push(this.tweens.add({
                    targets: this.finaleGlow, alpha: 0.35, scaleX: 1.9, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
                }));

                this.cakeSprite = this.trackObj(this.add.image(GAME_W / 2, 540, "prop_cake")
                    .setOrigin(0.5, 1).setScale(0.1).setAlpha(0).setDepth(11));

                UI.updateProgress(this.solvedIds.size, `Fase 5/5 • ${stage.location}`);
                this.applyResponsiveCamera(this.scale.width, this.scale.height);
                return;
            }

            // === FASES 1–4: SIDE-SCROLLER 2.5D PROFUNDO ===
            this.playerVel = 0;
            this.player.anims.stop();
            this.player.setPosition(200, GROUND_Y).setTexture("helora_idle").setFlipX(false).setAngle(0).setScale(0.92);
            this.playerShadow.setPosition(200, GROUND_Y - 4).setScale(1);

            this.kitten.anims.stop();
            this.kitten.setPosition(90, GROUND_Y - 2).setTexture("kitten_idle").setFlipX(false).setAngle(0).setScale(0.74);
            this.kittenShadow.setPosition(90, GROUND_Y - 2).setScale(1);

            // Camada de primeiro plano (1.28x) — vaga-lumes dourados/esmeralda passando na frente da estrada!
            for (let gx = 160; gx < this.stageWidth * 1.28; gx += 320) {
                const gy = GAME_H - Phaser.Math.Between(22, 84);
                const orb = this.trackObj(this.add.image(gx, gy, "sparkle_dot")
                    .setScrollFactor(1.28, 0)
                    .setTint(gx % 2 === 0 ? 0x52f29b : 0xffe484)
                    .setScale(Phaser.Math.FloatBetween(0.45, 0.85))
                    .setAlpha(0.62)
                    .setDepth(14));
                this.stageTweens.push(this.tweens.add({
                    targets: orb, y: gy - 18, alpha: 0.22, duration: 1500 + (gx % 500), yoyo: true, repeat: -1, ease: "Sine.easeInOut"
                }));
            }

            // 2. Expresso de Hogwarts animado (exclusivo da Fase 2 — sobre o viaduto de pedra!)
            if (stage.hasTrain) {
                this.buildAnimatedTrain(442);
            }

            // 3. Estrelas coletáveis da fase
            const starXs = [460, 740, 1020, 1280];
            starXs.forEach((sx, i) => {
                const sy = GROUND_Y - 94 - (i % 2) * 24;
                const star = this.trackObj(this.add.image(sx, sy, "decor_star").setScale(0.84).setDepth(6));
                this.stageTweens.push(this.tweens.add({
                    targets: star, y: sy - 12, scale: 0.94, duration: 900 + i * 100, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
                }));
                this.collectibleStars.push({ sprite: star, collected: false, baseX: sx, baseY: sy, secret: false });
            });

            // Estrelas secretas do Lumos (Fase 2)
            if (stage.miniGame === "lumos") {
                [880, 1120, 1340].forEach((sx, i) => {
                    const sy = GROUND_Y - 126 - (i % 2) * 22;
                    const star = this.trackObj(this.add.image(sx, sy, "decor_star").setScale(0.92).setVisible(false).setAlpha(0).setDepth(6));
                    this.stageTweens.push(this.tweens.add({
                        targets: star, y: sy - 14, duration: 850 + i * 90, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
                    }));
                    this.collectibleStars.push({ sprite: star, collected: false, baseX: sx, baseY: sy, secret: true });
                });
            }

            // 4. Poção Felix Felicis (Fases 2 e 4)
            if (stage.hasPotion) {
                const px = 610;
                const py = GROUND_Y - 108;
                const glow = this.trackObj(this.add.image(px, py, "soft_glow").setTint(0xffe066).setScale(0.85).setAlpha(0.55).setDepth(5.5));
                const vial = this.trackObj(this.add.image(px, py, "decor_potion").setScale(0.92).setDepth(6));
                this.stageTweens.push(this.tweens.add({
                    targets: [vial, glow], y: py - 14, duration: 950, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
                }));
                this.stagePotion = { sprite: vial, glow, collected: false, baseX: px, baseY: py };
            }

            // 5. Checkpoint do Quiz da Fase
            const quizX = stage.isFinaleStage ? 1480 : 1560;
            const isSnitchProp = stage.propKey === "prop_snitch";
            const propY = isSnitchProp ? GROUND_Y - 128 : GROUND_Y - 12;
            const propSprite = this.trackObj(this.add.image(quizX, propY, stage.propKey).setOrigin(0.5, isSnitchProp ? 0.5 : 1).setDepth(5));
            if (isSnitchProp) {
                this.stageTweens.push(this.tweens.add({
                    targets: propSprite, y: propY - 22, duration: 1150, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
                }));
            }

            const markerY = isSnitchProp ? propY - 90 : propY - propSprite.displayHeight - 16;
            const marker = this.trackObj(this.add.text(quizX, markerY, `✦ Quiz ${stage.id} ✦`, {
                fontFamily: "Cinzel, serif", fontSize: "19px", fontStyle: "bold",
                color: "#fff3c4", backgroundColor: "rgba(13, 43, 29, 0.86)", padding: { x: 10, y: 5 }
            }).setOrigin(0.5).setDepth(7));
            this.stageTweens.push(this.tweens.add({
                targets: marker, y: markerY - 8, duration: 1000, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
            }));

            this.checkpoint = { quiz: stage, worldX: quizX, sprite: propSprite, marker };

            // 6. Saída para Próxima Fase (Fases 1–4) OU Chegada Mágica + Bolo Invisível (Fase 5)
            if (!stage.isFinaleStage) {
                const exitX = 2040;
                this.exitX = exitX;
                this.exitMarker = this.trackObj(this.add.text(exitX, GROUND_Y - 130, `➜ Fase ${stage.id + 1}`, {
                    fontFamily: "Cinzel, serif", fontSize: "20px", fontStyle: "bold",
                    color: "#7affb2", backgroundColor: "rgba(13, 43, 29, 0.86)", padding: { x: 12, y: 6 }
                }).setOrigin(0.5).setDepth(7).setAlpha(0.35));
                this.stageTweens.push(this.tweens.add({
                    targets: this.exitMarker, x: exitX + 10, duration: 850, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
                }));
            } else {
                this.finaleX = 2220;
                // Tapete verde/dourado da Sonserina na chegada final
                this.trackObj(this.add.rectangle(2020, GROUND_Y - 12, 760, 30, 0x145232, 0.88).setDepth(3));
                this.trackObj(this.add.rectangle(2020, GROUND_Y - 26, 760, 3, 0xe6c267, 0.95).setDepth(3));
                this.trackObj(this.add.rectangle(2020, GROUND_Y + 2, 760, 3, 0xe6c267, 0.95).setDepth(3));

                this.finaleGlow = this.trackObj(this.add.image(this.finaleX, GROUND_Y - 18, "soft_glow")
                    .setTint(0x52f29b).setScale(1.8, 0.55).setAlpha(0.75).setDepth(4));
                this.stageTweens.push(this.tweens.add({
                    targets: this.finaleGlow, alpha: 0.35, scaleX: 2.1, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
                }));

                // Bolo começa INVISÍVEL (invocado pela magia do Isac!)
                this.cakeSprite = this.trackObj(this.add.image(this.finaleX, GROUND_Y - 12, "prop_cake")
                    .setOrigin(0.5, 1).setScale(0.1).setAlpha(0).setDepth(6));

                this.finaleMarker = this.trackObj(this.add.text(this.finaleX, GROUND_Y - 135, "✨ Chegada Mágica ✨", {
                    fontFamily: "Cinzel, serif", fontSize: "21px", fontStyle: "bold",
                    color: "#ffe680", backgroundColor: "rgba(13, 43, 29, 0.86)", padding: { x: 12, y: 6 }
                }).setOrigin(0.5).setDepth(7));
                this.stageTweens.push(this.tweens.add({
                    targets: this.finaleMarker, y: this.finaleMarker.y - 10, duration: 950, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
                }));
            }

            UI.updateProgress(this.solvedIds.size, `Fase ${stage.id}/5 • ${stage.location}`);
            this.applyResponsiveCamera(this.scale.width, this.scale.height);
        }

        applyResponsiveCamera(screenW, screenH) {
            const cam = this.cameras.main;
            const zoom = Math.max(0.42, screenH / GAME_H);
            cam.setZoom(zoom);
            const viewW = screenW / zoom;

            if (this.isPerspective) {
                cam.stopFollow();
                cam.centerOn(GAME_W / 2, GAME_H / 2);
                this.bgDisplayW = Math.max(Math.ceil(viewW) + 80, GAME_W);
                this.stageBg.setDisplaySize(this.bgDisplayW, GAME_H);
                this.stageBg.setPosition(GAME_W / 2, GAME_H / 2);
            } else {
                const offsetX = viewW < 640 ? -24 : -Math.min(200, Math.round(viewW * 0.16));
                cam.startFollow(this.player, true, 0.08, 0.08, offsetX, 0);
                cam.centerOn(this.player.x - offsetX, GAME_H / 2);
                this.bgDisplayW = Math.max(Math.ceil(viewW) + 260, 1580);
                this.stageBg.setDisplaySize(this.bgDisplayW, GAME_H);
            }
            if (this.darknessOverlay) this.darknessOverlay.setSize(Math.ceil(viewW) + 160, GAME_H);
        }

        buildAnimatedTrain(baseY) {
            this.trainBaseY = baseY;
            this.trainRelX = -180;
            this.trainWheelAngle = 0;
            this.trainSmokeTimer = 0;

            this.trainRig = this.trackObj(this.add.container(0, baseY).setScale(0.70).setDepth(1.4));
            this.trainBody = this.add.image(0, 0, "mid_train").setOrigin(0.5, 1).setFlipX(true);
            this.trainMechGfx = this.add.graphics();
            this.trainRig.add([this.trainBody, this.trainMechGfx]);
        }

        updateAnimatedTrain(time, dt) {
            if (!this.trainRig || !this.trainRig.active) return;

            const bgLeft = this.stageBg.x - this.bgDisplayW / 2 + 80;
            const bgRight = this.stageBg.x + this.bgDisplayW / 2 - 80;
            const trackSpan = bgRight - bgLeft;

            this.trainRelX += 92 * dt;
            if (this.trainRelX > trackSpan + 200) {
                this.trainRelX = -200;
            }

            const progress = Phaser.Math.Clamp(this.trainRelX / trackSpan, 0, 1);
            const edgeFade = Math.min(Phaser.Math.Clamp(progress / 0.10, 0, 1), Phaser.Math.Clamp((1 - progress) / 0.10, 0, 1));
            this.trainRig.setAlpha(edgeFade);

            const slopeOffset = (progress - 0.5) * -18;
            this.trainRig.setPosition(bgLeft + this.trainRelX, this.trainBaseY + slopeOffset + Math.sin(time * 0.022) * 1.1);
            this.trainRig.setAngle(-1.1);

            this.trainWheelAngle += dt * 4.5;
            const a = this.trainWheelAngle;
            const g = this.trainMechGfx;
            g.clear();

            const bigWheels = [{ x: -112, y: -30, r: 24 }, { x: -42, y: -30, r: 24 }, { x: 28, y: -30, r: 24 }];
            const smallWheels = [{ x: 88, y: -17, r: 12 }, { x: 156, y: -17, r: 12 }];

            g.lineStyle(2.2, 0xc9b48a, 0.72);
            bigWheels.forEach((w) => {
                for (let s = 0; s < 4; s++) {
                    const ang = a + (s * Math.PI) / 4;
                    g.lineBetween(w.x - Math.cos(ang) * (w.r - 4), w.y - Math.sin(ang) * (w.r - 4), w.x + Math.cos(ang) * (w.r - 4), w.y + Math.sin(ang) * (w.r - 4));
                }
            });
            g.lineStyle(1.8, 0xb8a88a, 0.68);
            smallWheels.forEach((w) => {
                for (let s = 0; s < 3; s++) {
                    const ang = a * 1.7 + (s * Math.PI) / 3;
                    g.lineBetween(w.x - Math.cos(ang) * (w.r - 2), w.y - Math.sin(ang) * (w.r - 2), w.x + Math.cos(ang) * (w.r - 2), w.y + Math.sin(ang) * (w.r - 2));
                }
            });

            const rodDx = Math.cos(a) * 9;
            const rodDy = Math.sin(a) * 9;
            g.lineStyle(4.5, 0xd9dee6, 0.92);
            g.lineBetween(bigWheels[0].x + rodDx, bigWheels[0].y + rodDy, bigWheels[2].x + rodDx, bigWheels[2].y + rodDy);
            g.lineStyle(3.5, 0xbec5d0, 0.9);
            g.lineBetween(bigWheels[2].x + rodDx, bigWheels[2].y + rodDy, 102, -32);
            g.fillStyle(0xf2d16b, 1);
            bigWheels.forEach((w) => g.fillCircle(w.x + rodDx, w.y + rodDy, 3.5));

            this.trainSmokeTimer += dt;
            if (this.trainSmokeTimer > 0.24 && edgeFade > 0.25) {
                this.trainSmokeTimer = 0;
                const scale = this.trainRig.scaleX;
                const chimneyX = this.trainRig.x + 118 * scale;
                const chimneyY = this.trainRig.y - 168 * scale;
                const puff = this.add.image(chimneyX, chimneyY, "soft_glow").setTint(0xf2f4fa).setScale(0.28).setAlpha(0.5 * edgeFade).setDepth(1.5);
                this.tweens.add({
                    targets: puff, x: chimneyX - Phaser.Math.Between(65, 115), y: chimneyY - Phaser.Math.Between(65, 110),
                    scale: Phaser.Math.FloatBetween(1.05, 1.5), alpha: 0, duration: 1850, ease: "Quad.easeOut", onComplete: () => puff.destroy()
                });
            }
        }

        petKitten() {
            const now = this.time.now;
            if (now - this.lastPetTime < 550) return;
            this.lastPetTime = now;
            SoundFX.unlock();
            SoundFX.playMeow();

            const heart = this.add.text(this.kitten.x, this.kitten.y - 68, "💛", { fontSize: "24px" }).setOrigin(0.5).setDepth(18);
            this.tweens.add({ targets: heart, y: heart.y - 46, alpha: 0, duration: 820, ease: "Cubic.easeOut", onComplete: () => heart.destroy() });
            this.tweens.add({
                targets: this.kitten, y: GROUND_Y - 22, duration: 150, yoyo: true, ease: "Sine.easeOut",
                onComplete: () => { this.kitten.y = GROUND_Y - 2; }
            });
        }

        castLumos() {
            if (this.lumosSolved || !this.lumosActive) return;
            this.lumosSolved = true;
            this.lumosActive = false;
            SoundFX.playLumos();
            UI.btnLumos.classList.add("hidden");
            UI.challengeBanner.classList.add("hidden");

            const flash = this.add.image(this.player.x + 28, this.player.y - 75, "soft_glow").setTint(0xfff4b8).setScale(0.6).setAlpha(0.95).setDepth(16);
            this.tweens.add({ targets: flash, scale: 9.5, alpha: 0, duration: 850, ease: "Cubic.easeOut", onComplete: () => flash.destroy() });
            this.tweens.add({ targets: this.darknessOverlay, alpha: 0, duration: 650, ease: "Sine.easeOut" });

            this.collectibleStars.forEach((item) => {
                if (item.secret && !item.collected) {
                    item.sprite.setVisible(true);
                    this.tweens.add({ targets: item.sprite, alpha: 1, duration: 500 });
                }
            });

            this.burstMagic(this.player.x + 30, this.player.y - 80, 34);
            this.addHousePoints(40, this.player.x, this.player.y - 170);
        }

        startSnitchHunt() {
            this.state = "SNITCH_HUNT";
            this.snitchHits = 0;
            InputState.touchWalk = false;
            InputState.canvasHoldRight = false;
            UI.btnWalk.classList.remove("walking");
            this.resetLegsToIdle();

            UI.challengeBanner.textContent = "🏆 Toque no Pomo de Ouro! (0/3)";
            UI.challengeBanner.classList.remove("hidden");
            SoundFX.playPopup();

            const wv = this.cameras.main.worldView;
            this.huntSnitch = this.add.image(wv.centerX, 240, "prop_snitch").setScale(0.62).setDepth(17).setInteractive({ useHandCursor: true });

            const moveSnitch = () => {
                if (!this.huntSnitch || !this.huntSnitch.active) return;
                const cur = this.cameras.main.worldView;
                const marginX = Math.min(110, cur.width * 0.18);
                const tx = Phaser.Math.Between(Math.round(cur.left + marginX), Math.round(cur.right - marginX));
                const ty = Phaser.Math.Between(140, 420);
                this.snitchTween = this.tweens.add({
                    targets: this.huntSnitch, x: tx, y: ty,
                    duration: Math.max(680, 1180 - this.snitchHits * 170), ease: "Sine.easeInOut", onComplete: moveSnitch
                });
            };
            moveSnitch();

            this.huntSnitch.on("pointerdown", () => {
                if (this.state !== "SNITCH_HUNT") return;
                this.snitchHits += 1;
                SoundFX.playCollect();
                this.burstMagic(this.huntSnitch.x, this.huntSnitch.y, 18);
                UI.challengeBanner.textContent = `🏆 Toque no Pomo de Ouro! (${this.snitchHits}/3)`;

                if (this.snitchHits >= 3) {
                    this.snitchSolved = true;
                    if (this.snitchTween) this.snitchTween.stop();
                    const sx = this.huntSnitch.x, sy = this.huntSnitch.y;
                    this.huntSnitch.destroy();
                    this.huntSnitch = null;
                    UI.challengeBanner.classList.add("hidden");
                    SoundFX.playChime();
                    this.burstMagic(sx, sy, 40);
                    this.addHousePoints(100, sx, sy);
                    this.celebrateJump(() => { this.state = "WALKING"; });
                } else {
                    if (this.snitchTween) this.snitchTween.stop();
                    moveSnitch();
                }
            });
        }

        addHousePoints(amount, x, y) {
            const mult = this.felixTimer > 0 ? 2 : 1;
            const gained = amount * mult;
            this.housePoints += gained;
            UI.updatePoints(this.housePoints);
            const pop = this.add.text(x, y - 20, mult > 1 ? `+${gained} pts (2x!) ✨` : `+${gained} pts 🐍`, {
                fontFamily: "Cinzel, serif", fontSize: "18px", fontStyle: "bold",
                color: mult > 1 ? "#ffe680" : "#7affb2", stroke: "#092617", strokeThickness: 4
            }).setOrigin(0.5).setDepth(18);
            this.tweens.add({ targets: pop, y: pop.y - 54, alpha: 0, duration: 850, ease: "Cubic.easeOut", onComplete: () => pop.destroy() });
        }

        startJourney() {
            this.state = "WALKING";
            UI.hud.classList.remove("hidden");
            UI.controlsBar.classList.remove("hidden");
            UI.updateProgress(0, `Fase 1/5 • ${DATA.quizzes[0].location}`);
            UI.updatePoints(0);
        }

        resetJourney() {
            this.solvedIds.clear();
            this.housePoints = 0;
            this.felixTimer = 0;
            UI.hudFelix.classList.add("hidden");
            UI.isacBubble.classList.add("hidden");
            this.felixAura.setAlpha(0);
            this.loadStage(0);
            this.state = "WALKING";
            UI.updatePoints(0);
            UI.controlsBar.classList.remove("hidden");
        }

        advanceToNextStage() {
            this.state = "TRANSITION";
            InputState.touchWalk = false;
            InputState.canvasHoldRight = false;
            UI.btnWalk.classList.remove("walking");
            this.resetLegsToIdle();

            const nextIdx = this.stageIdx + 1;
            const nextStage = DATA.quizzes[nextIdx];
            UI.showPhaseTransition(
                nextIdx,
                nextStage,
                () => { this.loadStage(nextIdx); },
                () => { this.state = "WALKING"; }
            );
        }

        burstMagic(x, y, count = 26) {
            const colors = [0x44e38e, 0xffe484, 0xffffff, 0x2ea367];
            for (let i = 0; i < count; i++) {
                const p = this.add.image(x, y, "sparkle_dot").setTint(colors[i % colors.length]).setScale(Phaser.Math.FloatBetween(0.45, 1.05)).setDepth(15);
                const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                const dist = Phaser.Math.FloatBetween(55, 175);
                this.tweens.add({
                    targets: p, x: x + Math.cos(angle) * dist, y: y + Math.sin(angle) * dist - 30,
                    alpha: 0, scale: 0.1, duration: Phaser.Math.Between(550, 950), ease: "Cubic.easeOut", onComplete: () => p.destroy()
                });
            }
        }

        celebrateJump(onDone) {
            this.state = "CELEBRATE";
            const basePlayerY = this.player.y;
            const baseKittenY = this.kitten.y;
            this.player.anims.stop();
            this.player.setTexture("helora_celebrate");
            this.player.setAngle(0);
            this.burstMagic(this.player.x, basePlayerY - 90, 32);

            this.kitten.anims.stop();
            if (!this.isPerspective) this.kitten.setTexture("kitten_idle");
            const heart = this.add.text(this.kitten.x, baseKittenY - 60, "💛", { fontSize: "24px" }).setOrigin(0.5).setDepth(16);
            this.tweens.add({ targets: heart, y: heart.y - 48, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => heart.destroy() });
            this.tweens.add({
                targets: this.kitten, y: baseKittenY - 24, duration: 210, yoyo: true, repeat: 1, ease: "Sine.easeOut",
                onComplete: () => { this.kitten.y = baseKittenY; }
            });

            this.tweens.add({
                targets: this.player, y: basePlayerY - 34, duration: 240, yoyo: true, repeat: 1, ease: "Sine.easeOut",
                onComplete: () => {
                    this.player.y = basePlayerY;
                    this.player.setTexture(this.isPerspective ? "helora_back_walk" : "helora_idle", 0);
                    if (onDone) onDone();
                }
            });
        }

        triggerQuiz() {
            this.state = "QUIZ";
            InputState.touchWalk = false;
            InputState.canvasHoldRight = false;
            UI.btnWalk.classList.remove("walking");
            this.resetLegsToIdle();

            if (window.MagicMusic) window.MagicMusic.setDucked(true);

            const cp = this.checkpoint;
            UI.showQuiz(cp.quiz, () => {
                if (window.MagicMusic) window.MagicMusic.setDucked(false);
                this.stageQuizSolved = true;
                this.solvedIds.add(cp.quiz.id);
                cp.marker.setText(`✓ ${cp.quiz.location}`);
                cp.marker.setColor("#7affb2");
                if (this.exitMarker) this.exitMarker.setAlpha(1);
                UI.updateProgress(this.solvedIds.size, `Fase ${cp.quiz.id}/5 • ${cp.quiz.location}`);
                this.addHousePoints(50, this.player.x, this.player.y - 170);

                this.celebrateJump(() => { this.state = "WALKING"; });
            });
        }

        castSpellBeam(fromX, fromY, toX, toY) {
            SoundFX.playSpellCast();
            const colors = [0x44e38e, 0xffe484, 0xffffff, 0x2ea367];
            for (let i = 0; i < 28; i++) {
                this.time.delayedCall(i * 20, () => {
                    const orb = this.add.image(fromX, fromY, "sparkle_dot").setTint(colors[i % colors.length]).setScale(Phaser.Math.FloatBetween(0.55, 1.2)).setDepth(16);
                    this.tweens.add({
                        targets: orb, x: toX + Phaser.Math.Between(-24, 24), y: toY + Phaser.Math.Between(-24, 24),
                        scale: 0.2, alpha: 0.15, duration: 420, ease: "Quad.easeOut", onComplete: () => orb.destroy()
                    });
                });
            }
        }

        triggerFinale() {
            this.state = "FINALE";
            InputState.touchWalk = false;
            InputState.canvasHoldRight = false;
            UI.btnWalk.classList.remove("walking");
            UI.controlsBar.classList.add("hidden");
            UI.updateProgress(DATA.quizzes.length, "Salão Principal 🎂");
            this.resetLegsToIdle();

            this.isacBg.setVisible(false);
            if (this.finaleMarker) this.finaleMarker.setVisible(false);

            const wv = this.cameras.main.worldView;
            const startX = wv.right + 160;
            const hoverX = this.isPerspective ? GAME_W / 2 + 125 : Math.min(this.finaleX + 70, wv.right - 130);
            const hoverY = this.isPerspective ? 290 : GROUND_Y - 245;
            const cakeTargetY = this.isPerspective ? 510 : GROUND_Y - 70;
            const burstTargetY = this.isPerspective ? 500 : GROUND_Y - 95;

            this.isacHero = this.add.image(startX, 110, "isac_broom").setScale(0.76).setFlipX(true).setDepth(12);

            const trailEvent = this.time.addEvent({
                delay: 75, repeat: 70,
                callback: () => {
                    if (!this.isacHero || !this.isacHero.active) return;
                    const tailOffsetX = this.isacHero.flipX ? 85 : -85;
                    const sp = this.add.image(this.isacHero.x + tailOffsetX, this.isacHero.y + Phaser.Math.Between(-12, 24), "sparkle_dot")
                        .setTint(Math.random() > 0.45 ? 0x52f29b : 0xffe484).setScale(Phaser.Math.FloatBetween(0.35, 0.75)).setDepth(11);
                    this.tweens.add({ targets: sp, alpha: 0, scale: 0.1, duration: 480, onComplete: () => sp.destroy() });
                }
            });

            this.tweens.add({
                targets: this.isacHero, x: hoverX, y: hoverY, duration: 1250, ease: "Cubic.easeOut",
                onComplete: () => {
                    const hoverTween = this.tweens.add({
                        targets: this.isacHero, y: hoverY - 12, duration: 850, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
                    });

                    UI.isacText.textContent = DATA.brother.greeting;
                    UI.isacBubble.classList.remove("hidden");
                    SoundFX.playPopup();

                    this.time.delayedCall(2200, () => {
                        this.castSpellBeam(this.isacHero.x - 95, this.isacHero.y - 25, this.cakeSprite.x, cakeTargetY);

                        this.time.delayedCall(400, () => {
                            SoundFX.playCakeAppear();
                            this.burstMagic(this.cakeSprite.x, burstTargetY, 56);
                            if (this.finaleGlow) this.finaleGlow.setVisible(false);
                            const finalCakeScale = this.isPerspective ? 0.72 : 1;
                            this.tweens.add({ targets: this.cakeSprite, alpha: 1, scale: finalCakeScale, duration: 680, ease: "Back.easeOut" });
                            this.celebrateJump(() => { this.player.setTexture("helora_celebrate"); });
                        });

                        this.time.delayedCall(1550, () => {
                            UI.isacBubble.classList.add("hidden");
                            hoverTween.stop();
                            this.tweens.add({
                                targets: this.isacHero, x: wv.left - 240, y: 65, angle: -8, duration: 1150, ease: "Quad.easeIn",
                                onComplete: () => {
                                    trailEvent.remove(false);
                                    if (this.isacHero) { this.isacHero.destroy(); this.isacHero = null; }
                                    UI.showEnvelope(this.housePoints);
                                }
                            });
                        });
                    });
                }
            });
        }

        resetLegsToIdle() {
            this.playerVel = 0;
            this.depthVel = 0;
            this.player.anims.stop();
            this.player.setTexture(this.isPerspective ? "helora_back_walk" : "helora_idle", 0);
            this.player.setAngle(0);
            if (!this.isPerspective) this.player.y = GROUND_Y;
        }

        spawnShootingStar() {
            if (this.currentStage && this.currentStage.indoor) return;
            const wv = this.cameras.main.worldView;
            const sx = Phaser.Math.Between(Math.round(wv.left + 80), Math.round(wv.right - 60));
            const sy = Phaser.Math.Between(45, 190);
            const star = this.add.image(sx, sy, "sparkle_dot").setTint(0xfff6cc).setScale(0.65).setDepth(1.2);
            this.tweens.add({ targets: star, x: sx - 240, y: sy + 115, alpha: 0, scale: 0.1, duration: 780, ease: "Quad.easeOut", onComplete: () => star.destroy() });
        }

        update(time, delta) {
            const dt = delta / 1000;
            const cam = this.cameras.main;
            const wv = cam.worldView;
            const midX = wv.centerX;

            // 1. Movimento da câmera / background (Modo Perspectiva 2.5D na Fase 5 OU Parallax Lateral nas Fases 1–4)
            if (this.isPerspective) {
                const bgZoom = 1 + this.depthProgress * 0.36;
                this.stageBg.setDisplaySize(this.bgDisplayW * bgZoom, GAME_H * bgZoom);
                // Mantém o portão do castelo bem enquadrado enquanto cresce na aproximação
                this.stageBg.setPosition(GAME_W / 2, GAME_H / 2 + this.depthProgress * 46);
            } else {
                const progress = Phaser.Math.Clamp((this.player.x - 180) / Math.max(1, this.stageWidth - 380), 0, 1);
                const maxPan = Math.max(0, (this.bgDisplayW - wv.width) / 2);
                this.stageBg.setPosition(midX + (0.5 - progress) * (maxPan * 2), GAME_H / 2);
            }
            if (this.darknessOverlay) this.darknessOverlay.setPosition(midX, GAME_H / 2);

            // Vagalumes e estrelas cadentes
            for (const dot of this.ambientFireflies) {
                dot.y = dot.baseY + Math.sin(time * 0.0015 * dot.speed + dot.phase) * 14;
            }
            this.shootingStarTimer -= dt;
            if (this.shootingStarTimer <= 0) {
                this.shootingStarTimer = Phaser.Math.FloatBetween(4.0, 7.5);
                this.spawnShootingStar();
            }

            // Expresso animado na Fase 2
            if (this.trainRig) this.updateAnimatedTrain(time, dt);

            // Isac voando no céu nas fases externas
            if (this.isacBg && this.isacBg.visible) {
                this.isacBgRelX += this.isacBgDir * 95 * dt;
                if (this.isacBgRelX > wv.width + 130) {
                    this.isacBgDir = -1;
                    this.isacBg.setFlipX(true);
                } else if (this.isacBgRelX < -130) {
                    this.isacBgDir = 1;
                    this.isacBg.setFlipX(false);
                }
                this.isacBg.setPosition(wv.left + this.isacBgRelX, 148 + Math.sin(time * 0.0026) * 18);
                this.isacBgTrailTimer += dt;
                if (this.isacBgTrailTimer > 0.18) {
                    this.isacBgTrailTimer = 0;
                    const sp = this.add.image(this.isacBg.x - this.isacBgDir * 44, this.isacBg.y + 8, "sparkle_dot")
                        .setTint(Math.random() > 0.5 ? 0x52f29b : 0xffe484).setScale(0.26).setAlpha(0.75).setDepth(1);
                    this.tweens.add({ targets: sp, alpha: 0, scale: 0.08, duration: 550, onComplete: () => sp.destroy() });
                }
            }

            // Timer da Poção Felix Felicis
            if (this.felixTimer > 0) {
                this.felixTimer = Math.max(0, this.felixTimer - dt);
                this.felixAura.setPosition(this.player.x, this.player.y - 95);
                this.felixAura.setAlpha(0.55 + Math.sin(time * 0.015) * 0.2);
                if (this.felixTimer <= 0) {
                    this.felixAura.setAlpha(0);
                    UI.hudFelix.classList.add("hidden");
                }
            }

            if (this.lumosActive && (Phaser.Input.Keyboard.JustDown(this.keyL) || Phaser.Input.Keyboard.JustDown(this.keySpace))) {
                this.castLumos();
            }

            // === UPDATE MODO PERSPECTIVA 2.5D "DE COSTAS" (FASE 5) ===
            if (this.isPerspective) {
                if (this.state !== "WALKING") return;
                const moveForward = this.cursors.right.isDown || this.cursors.up.isDown || this.keyD.isDown || this.keyW.isDown || InputState.touchWalk || InputState.canvasHoldRight;
                const targetDVel = moveForward ? 0.24 : 0;
                this.depthVel += (targetDVel - this.depthVel) * Math.min(1, 8.5 * dt);
                if (this.depthVel < 0.005 && !moveForward) this.depthVel = 0;

                if (this.depthVel > 0.008) {
                    this.depthProgress = Phaser.Math.Clamp(this.depthProgress + this.depthVel * dt, 0, 0.96);
                    if (this.player.anims.currentAnim?.key !== "helora_back_anim" || !this.player.anims.isPlaying) {
                        this.player.play("helora_back_anim", true);
                    }
                    this.walkPhase += dt * 10;
                    UI.btnWalk.classList.add("walking");
                } else {
                    if (this.player.anims.isPlaying) {
                        this.player.anims.stop();
                        this.player.setTexture("helora_back_walk", 0);
                    }
                    UI.btnWalk.classList.remove("walking");
                }

                const p = this.depthProgress;
                const bob = this.depthVel > 0.008 ? Math.abs(Math.sin(this.walkPhase)) * (5 * (1 - p * 0.4)) : 0;
                const hScale = Phaser.Math.Linear(1.02, 0.56, p);
                const hY = Phaser.Math.Linear(686, 540, p);
                const hX = GAME_W / 2 + Phaser.Math.Linear(26, 16, p);
                this.player.setPosition(hX, hY - bob).setScale(hScale);
                this.playerShadow.setPosition(hX, hY - 4).setScale(hScale);

                const kScale = Phaser.Math.Linear(0.84, 0.44, p);
                const kBob = this.depthVel > 0.008 ? Math.abs(Math.sin(this.walkPhase * 1.25)) * 4 : 0;
                const kX = GAME_W / 2 - Phaser.Math.Linear(86, 44, p);
                const kY = hY + 6;
                this.kitten.setPosition(kX, kY - kBob).setScale(kScale);
                this.kittenShadow.setPosition(kX, kY - 2).setScale(kScale);

                // Coletar estrelas na perspectiva
                for (const item of this.collectibleStars) {
                    if (!item.collected && p >= item.progressTarget - 0.05) {
                        item.collected = true;
                        item.sprite.setVisible(false);
                        SoundFX.playCollect();
                        this.burstMagic(item.baseX, item.baseY, 14);
                        this.addHousePoints(10, item.baseX, item.baseY);
                    }
                }

                // Quiz 5 no Portão de Hogwarts
                if (!this.stageQuizSolved && p >= 0.72) {
                    this.triggerQuiz();
                    return;
                }

                // Chegada Final — Isac desce voando sobre Hogwarts e invoca o bolo!
                if (this.stageQuizSolved && p >= 0.92) {
                    if (this.checkpoint && this.checkpoint.marker) this.checkpoint.marker.setVisible(false);
                    this.triggerFinale();
                }
                return;
            }

            // Gatinho seguindo Helora (animação 100% intacta!)
            const facingDir = this.player.flipX ? -1 : 1;
            const kittenTargetX = this.player.x - facingDir * 112;
            const kDist = kittenTargetX - this.kitten.x;
            if (Math.abs(kDist) > 8 && this.state !== "CELEBRATE") {
                const kStep = Math.sign(kDist) * Math.min(Math.abs(kDist), WALK_SPEED * 0.96 * dt);
                this.kitten.x += kStep;
                this.kitten.setFlipX(kDist < 0);
                this.kitten.setScale(0.74);
                this.kitten.setAngle(0);
                if (this.kitten.anims.currentAnim?.key !== "kitten_walk_anim" || !this.kitten.anims.isPlaying) {
                    this.kitten.play("kitten_walk_anim", true);
                }
                this.kitten.y = GROUND_Y - 2;
            } else if (this.state !== "CELEBRATE") {
                if (this.kitten.anims.isPlaying) {
                    this.kitten.anims.stop();
                    this.kitten.setTexture("kitten_idle");
                }
                const kBreath = 0.74 * (1 + Math.sin(time * 0.004) * 0.02);
                this.kitten.setScale(0.74, kBreath);
                this.kitten.setAngle(0);
                this.kitten.y = GROUND_Y - 2;
            }
            this.kittenShadow.x = this.kitten.x;

            if (this.state !== "WALKING") return;

            const moveRight = this.cursors.right.isDown || this.keyD.isDown || InputState.touchWalk || InputState.canvasHoldRight;
            const moveLeft = this.cursors.left.isDown || this.keyA.isDown;

            const activeSpeed = this.felixTimer > 0 ? WALK_SPEED * 1.32 : WALK_SPEED;
            const targetVel = moveRight ? activeSpeed : (moveLeft ? -activeSpeed * 0.82 : 0);
            const accelRate = targetVel !== 0 ? 9.5 : 8.5;
            this.playerVel += (targetVel - this.playerVel) * Math.min(1, accelRate * dt);
            if (Math.abs(this.playerVel) < 4 && targetVel === 0) this.playerVel = 0;

            const isMoving = Math.abs(this.playerVel) > 8;
            if (isMoving) {
                const dir = this.playerVel >= 0 ? 1 : -1;
                const speedRatio = Math.min(1, Math.abs(this.playerVel) / WALK_SPEED);
                const maxX = this.currentStage.isFinaleStage ? this.finaleX - 115 : this.stageWidth - 90;
                this.player.x = Phaser.Math.Clamp(this.player.x + this.playerVel * dt, 130, maxX);
                this.player.setFlipX(dir < 0);
                this.player.setScale(0.92);

                if (this.player.anims.currentAnim?.key !== "helora_walk_anim" || !this.player.anims.isPlaying) {
                    this.player.play("helora_walk_anim", true);
                }
                this.player.anims.timeScale = 0.65 + speedRatio * 0.55;

                this.walkPhase += dt * (6 + speedRatio * 5.5);
                this.player.y = GROUND_Y - Math.abs(Math.sin(this.walkPhase)) * (3.5 * speedRatio);
                this.player.setAngle(Math.sin(this.walkPhase) * (1.1 * speedRatio));

                UI.btnWalk.classList.toggle("walking", moveRight);

                this.stepDustTimer += dt * speedRatio;
                if (this.stepDustTimer > 0.22) {
                    this.stepDustTimer = 0;
                    const puff = this.add.image(this.player.x - dir * 10, GROUND_Y - 5, "sparkle_dot")
                        .setTint(0xffe9a8).setScale(0.32).setAlpha(0.55).setDepth(9);
                    this.tweens.add({ targets: puff, x: puff.x - dir * 24, y: puff.y - 12, alpha: 0, scale: 0.1, duration: 380, onComplete: () => puff.destroy() });
                }

                this.particleTimer += dt * speedRatio;
                if (this.particleTimer > 0.14) {
                    this.particleTimer = 0;
                    const sp = this.add.image(this.player.x + dir * 24, this.player.y - 68 + Phaser.Math.Between(-8, 8), "sparkle_dot")
                        .setTint(Math.random() > 0.45 ? 0xffe484 : 0x52f29b).setScale(Phaser.Math.FloatBetween(0.24, 0.48)).setDepth(9);
                    this.tweens.add({ targets: sp, x: sp.x - dir * 26, y: sp.y - 16, alpha: 0, duration: 420, onComplete: () => sp.destroy() });
                }
            } else {
                if (this.player.anims.isPlaying) {
                    this.player.anims.stop();
                    this.player.setTexture("helora_idle");
                }
                const breath = 0.92 * (1 + Math.sin(time * 0.0035) * 0.015);
                this.player.setScale(0.92, breath);
                this.player.setAngle(0);
                this.player.y = GROUND_Y;
                UI.btnWalk.classList.remove("walking");
            }

            this.playerShadow.x = this.player.x;

            // Coletar estrelas
            for (const item of this.collectibleStars) {
                if (!item.collected && item.sprite.visible && Math.abs(this.player.x - item.baseX) < 58) {
                    item.collected = true;
                    item.sprite.setVisible(false);
                    SoundFX.playCollect();
                    this.burstMagic(item.baseX, item.baseY, 12);
                    this.addHousePoints(10, item.baseX, item.baseY);
                }
            }

            // Coletar Poção Felix Felicis
            if (this.stagePotion && !this.stagePotion.collected && Math.abs(this.player.x - this.stagePotion.baseX) < 62) {
                this.stagePotion.collected = true;
                this.stagePotion.sprite.setVisible(false);
                this.stagePotion.glow.setVisible(false);
                this.felixTimer = 5.5;
                UI.hudFelix.classList.remove("hidden");
                SoundFX.playPotion();
                this.burstMagic(this.stagePotion.baseX, this.stagePotion.baseY, 26);
                this.addHousePoints(25, this.stagePotion.baseX, this.stagePotion.baseY);
            }

            // Mini-Desafio Lumos (Fase 2)
            if (this.currentStage.miniGame === "lumos" && !this.lumosSolved && !this.lumosActive && this.player.x >= 780) {
                this.lumosActive = true;
                this.tweens.add({ targets: this.darknessOverlay, alpha: 0.56, duration: 550 });
                UI.btnLumos.classList.remove("hidden");
                UI.challengeBanner.textContent = "🌑 Floresta escura! Toque em ✨ Lumos para iluminar!";
                UI.challengeBanner.classList.remove("hidden");
            }

            // Mini-Desafio Caça ao Pomo (Fase 3)
            if (this.currentStage.miniGame === "snitch" && !this.snitchSolved && this.player.x >= 880) {
                this.startSnitchHunt();
                return;
            }

            // Checkpoint do Quiz da Fase
            if (this.checkpoint && !this.stageQuizSolved && this.player.x >= this.checkpoint.worldX - 115) {
                this.triggerQuiz();
                return;
            }

            // Avançar para próxima fase (Fases 1–4) ou Chegada Final (Fase 5)
            if (!this.currentStage.isFinaleStage && this.stageQuizSolved && this.player.x >= this.exitX - 40) {
                this.advanceToNextStage();
            } else if (this.currentStage.isFinaleStage && this.stageQuizSolved && this.player.x >= this.finaleX - 140) {
                this.triggerFinale();
            }
        }
    }

    UI.btnStart.addEventListener("click", () => {
        SoundFX.unlock();
        SoundFX.playChime();
        if (window.MagicMusic) window.MagicMusic.start(SoundFX.ctx);
        UI.introOverlay.classList.add("hidden");
        if (window.__heloraScene) window.__heloraScene.startJourney();
    });

    UI.btnReplay.addEventListener("click", () => {
        SoundFX.unlock();
        if (window.MagicMusic) window.MagicMusic.setDucked(false);
        UI.cardOverlay.classList.add("hidden");
        if (window.__heloraScene) window.__heloraScene.resetJourney();
    });

    UI.btnMute.addEventListener("click", () => {
        SoundFX.muted = !SoundFX.muted;
        if (window.MagicMusic) window.MagicMusic.setMuted(SoundFX.muted);
        UI.btnMute.textContent = SoundFX.muted ? "🔇" : "🔊";
    });

    if (UI.btnFullscreen) {
        UI.btnFullscreen.addEventListener("click", () => {
            const el = document.documentElement;
            if (!document.fullscreenElement) {
                (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el)?.catch?.(() => {});
            } else {
                (document.exitFullscreen || document.webkitExitFullscreen)?.call(document)?.catch?.(() => {});
            }
        });
    }

    if (UI.btnLumos) {
        UI.btnLumos.addEventListener("click", () => {
            SoundFX.unlock();
            if (window.__heloraScene) window.__heloraScene.castLumos();
        });
    }

    const startWalkBtn = (e) => { e.preventDefault(); SoundFX.unlock(); InputState.touchWalk = true; };
    const stopWalkBtn = (e) => { if (e) e.preventDefault(); InputState.touchWalk = false; };
    UI.btnWalk.addEventListener("pointerdown", startWalkBtn);
    UI.btnWalk.addEventListener("pointerup", stopWalkBtn);
    UI.btnWalk.addEventListener("pointerleave", stopWalkBtn);
    UI.btnWalk.addEventListener("pointercancel", stopWalkBtn);

    const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: "phaser-container",
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#0a0918",
        pixelArt: true,
        antialias: false,
        roundPixels: true,
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.NO_CENTER
        },
        scene: [HogwartsJourneyScene]
    });

    let resizeTimer = null;
    const syncViewportSize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const w = window.visualViewport ? Math.round(window.visualViewport.width) : window.innerWidth;
            const h = window.visualViewport ? Math.round(window.visualViewport.height) : window.innerHeight;
            if (w > 0 && h > 0) game.scale.resize(w, h);
        }, 120);
    };
    window.addEventListener("orientationchange", syncViewportSize);
    window.addEventListener("resize", syncViewportSize);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", syncViewportSize);
})();
