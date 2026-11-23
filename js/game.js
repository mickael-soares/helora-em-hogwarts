(function () {
    "use strict";

    const DATA = window.HELORA_QUIZ_DATA;
    const ASSETS = window.HELORA_ASSETS;

    const WORLD_WIDTH = 8600;
    const GAME_W = 1280;
    const GAME_H = 720;
    const GROUND_Y = 646;
    const WALK_SPEED = 275;

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
        playLantern() {
            this.tone(659.25, 0.00, 0.16, "triangle", 0.06);
            this.tone(987.77, 0.06, 0.22, "sine", 0.06);
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
        }
    };

    // UI Controller
    const UI = {
        hud: document.getElementById("hud"),
        hudLocation: document.getElementById("hud-location"),
        hudPoints: document.getElementById("hud-points"),
        hudCount: document.getElementById("hud-count"),
        orbs: Array.from(document.querySelectorAll("#hud .orb")),
        btnMute: document.getElementById("btn-mute"),
        btnFullscreen: document.getElementById("btn-fullscreen"),
        controlsBar: document.getElementById("controls-bar"),
        btnWalk: document.getElementById("btn-walk"),
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
                        }, 1200);
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
                this.bdayStats.textContent = `🏆 5/5 desafios completos • ${housePoints} pts para a Sonserina!`;
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
            this.load.image("bg_hogwarts", ASSETS.bg_hogwarts);
            this.load.image("bg_path_tile", ASSETS.bg_path_tile);
            this.load.image("helora_idle", ASSETS.helora_idle);
            this.load.image("helora_celebrate", ASSETS.helora_celebrate);
            this.load.spritesheet("helora_walk", ASSETS.helora_walk, {
                frameWidth: 256,
                frameHeight: 256
            });
            this.load.image("isac_broom", ASSETS.isac_broom);
            this.load.image("kitten_idle", ASSETS.kitten_idle);
            this.load.spritesheet("kitten_walk", ASSETS.kitten_walk, {
                frameWidth: 144,
                frameHeight: 128
            });

            this.load.image("decor_star", ASSETS.decor_star);
            this.load.image("decor_banner", ASSETS.decor_banner);

            this.load.image("mid_train", ASSETS.mid_train);
            this.load.image("mid_forest", ASSETS.mid_forest);
            this.load.image("mid_quidditch", ASSETS.mid_quidditch);
            this.load.image("mid_arch", ASSETS.mid_arch);

            this.load.image("prop_platform", ASSETS.prop_platform);
            this.load.image("prop_owl", ASSETS.prop_owl);
            this.load.image("prop_snitch", ASSETS.prop_snitch);
            this.load.image("prop_hat", ASSETS.prop_hat);
            this.load.image("prop_gate", ASSETS.prop_gate);
            this.load.image("prop_cake", ASSETS.prop_cake);
        }

        create() {
            this.state = "INTRO"; // INTRO | WALKING | QUIZ | CELEBRATE | FINALE
            this.solvedIds = new Set();
            this.housePoints = 0;
            this.walkPhase = 0;
            this.playerVel = 0;
            this.particleTimer = 0;
            this.lastZoneName = "";

            // Textura de brilho mágico para partículas e halos
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

            this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_H);

            // 1. Camada Parallax Distante: Céu estrelado + Castelo de Hogwarts (acompanha qualquer tela 100% cheia)
            this.bgSky = this.add.image(GAME_W / 2, GAME_H / 2, "bg_hogwarts");
            this.bgSky.setDisplaySize(1680, GAME_H);
            this.bgSky.setDepth(0);

            // 1.2 Atmosfera suave por bioma (muda a cor/luz nos 5 trechos)
            this.biomeOverlay = this.add.rectangle(GAME_W / 2, GAME_H / 2, 2200, GAME_H, 0x1a2844, 0.06);
            this.biomeOverlay.setDepth(0.5);

            // 1.5 Isac voando de fundo no céu (indo e voltando até a Helora chegar no final)
            this.isacBgDir = 1;
            this.isacBgRelX = -120;
            this.isacBgTrailTimer = 0;
            this.shootingStarTimer = 3.2;
            this.biomeFxTimer = 0;
            this.stepDustTimer = 0;
            this.isacBg = this.add.image(100, 148, "isac_broom");
            this.isacBg.setScale(0.36);
            this.isacBg.setAlpha(0.94);
            this.isacBg.setDepth(1);

            // 1.8 Camada Parallax Intermediária
            this.buildMidParallaxLayer();

            // 2. Camada Parallax Chão/Lanternas: TileSprite 1:1 com a caminhada (preenche 100% da largura da tela)
            this.pathTile = this.add.tileSprite(GAME_W / 2, GAME_H - 130, 2200, 260, "bg_path_tile");
            this.pathTile.setDepth(2);

            // 2.5 Camada de Primeiro Plano (1.18x) — silhuetas sutis de grama/brilhos na frente da estrada
            this.buildForegroundLayer();

            // 3. Cenário 2D Vivo: Estandartes da Sonserina + Velas Flutuantes + Lanternas Interativas
            this.buildLivingScenery();

            // 4. Coletáveis mágicos (estrelinhas da Sonserina pelo caminho)
            this.buildCollectibleStars();

            // 5. Props dos 5 Checkpoints + Spot Mágico Final (Bolo INVISÍVEL até a magia do Isac!)
            this.checkpointSprites = [];
            DATA.quizzes.forEach((quiz) => {
                const isSnitch = quiz.propKey === "prop_snitch";
                const baseY = isSnitch ? GROUND_Y - 128 : GROUND_Y - 12;
                const sprite = this.add.image(quiz.worldX, baseY, quiz.propKey);
                sprite.setOrigin(0.5, isSnitch ? 0.5 : 1);
                sprite.setDepth(5);

                if (isSnitch) {
                    this.tweens.add({
                        targets: sprite,
                        y: baseY - 24,
                        duration: 1150,
                        yoyo: true,
                        repeat: -1,
                        ease: "Sine.easeInOut"
                    });
                }

                const markerY = isSnitch ? baseY - 92 : baseY - sprite.displayHeight - 16;
                const marker = this.add.text(quiz.worldX, markerY, `✦ Quiz ${quiz.id} ✦`, {
                    fontFamily: "Cinzel, serif",
                    fontSize: "19px",
                    fontStyle: "bold",
                    color: "#fff3c4",
                    backgroundColor: "rgba(13, 43, 29, 0.84)",
                    padding: { x: 10, y: 5 }
                }).setOrigin(0.5).setDepth(7);

                this.tweens.add({
                    targets: marker,
                    y: markerY - 8,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut"
                });

                this.checkpointSprites.push({ quiz, sprite, marker });
            });

            // Círculo mágico brilhante no chão marcando a chegada final
            this.finaleGlow = this.add.image(DATA.finaleX, GROUND_Y - 18, "soft_glow");
            this.finaleGlow.setTint(0x52f29b);
            this.finaleGlow.setScale(1.8, 0.55);
            this.finaleGlow.setAlpha(0.75);
            this.finaleGlow.setDepth(4);
            this.tweens.add({
                targets: this.finaleGlow,
                alpha: 0.35,
                scaleX: 2.1,
                duration: 1100,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });

            // Bolo Final começa INVISÍVEL (só aparece quando o Isac lança a magia!)
            this.cakeSprite = this.add.image(DATA.finaleX, GROUND_Y - 12, "prop_cake");
            this.cakeSprite.setOrigin(0.5, 1);
            this.cakeSprite.setScale(0.1);
            this.cakeSprite.setAlpha(0);
            this.cakeSprite.setDepth(6);

            this.finaleMarker = this.add.text(DATA.finaleX, GROUND_Y - 135, "✨ Chegada Mágica ✨", {
                fontFamily: "Cinzel, serif",
                fontSize: "21px",
                fontStyle: "bold",
                color: "#ffe680",
                backgroundColor: "rgba(13, 43, 29, 0.86)",
                padding: { x: 12, y: 6 }
            }).setOrigin(0.5).setDepth(7);

            this.tweens.add({
                targets: this.finaleMarker,
                y: this.finaleMarker.y - 10,
                duration: 950,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });

            // 6. Gatinho Laranjinha (sentado quando parado + 4 quadros reais de patas andando!)
            if (!this.anims.exists("kitten_walk_anim")) {
                this.anims.create({
                    key: "kitten_walk_anim",
                    frames: this.anims.generateFrameNumbers("kitten_walk", { start: 0, end: 3 }),
                    frameRate: 9,
                    repeat: -1
                });
            }

            this.kittenShadow = this.add.ellipse(95, GROUND_Y - 2, 54, 12, 0x080716, 0.36).setDepth(8);
            this.kitten = this.add.sprite(95, GROUND_Y - 2, "kitten_idle");
            this.kitten.setOrigin(0.5, 1);
            this.kitten.setScale(0.74);
            this.kitten.setDepth(10);

            // 7. Helora (4 quadros reais com varinha sempre na mesma mão)
            if (!this.anims.exists("helora_walk_anim")) {
                this.anims.create({
                    key: "helora_walk_anim",
                    frames: this.anims.generateFrameNumbers("helora_walk", { start: 0, end: 3 }),
                    frameRate: 7,
                    repeat: -1
                });
            }

            this.playerShadow = this.add.ellipse(210, GROUND_Y - 4, 96, 22, 0x080716, 0.42).setDepth(8);
            this.player = this.add.sprite(210, GROUND_Y, "helora_idle");
            this.player.setOrigin(0.5, 1);
            this.player.setScale(0.92);
            this.player.setDepth(10);

            // Câmera segue a Helora suavemente e adapta zoom para 100% tela cheia (PC + Celular retrato/paisagem)
            this.applyResponsiveCamera(this.scale.width, this.scale.height);
            this.scale.on("resize", (gameSize) => {
                this.applyResponsiveCamera(gameSize.width, gameSize.height);
            });

            // Controles
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

            this.input.on("pointerdown", (pointer) => {
                if (this.state === "WALKING" && pointer.x > this.scale.width * 0.35) {
                    InputState.canvasHoldRight = true;
                }
            });
            this.input.on("pointerup", () => { InputState.canvasHoldRight = false; });
            this.input.on("pointerupoutside", () => { InputState.canvasHoldRight = false; });

            window.__heloraScene = this;
        }

        applyResponsiveCamera(screenW, screenH) {
            const cam = this.cameras.main;
            const zoom = Math.max(0.42, screenH / GAME_H);
            cam.setZoom(zoom);
            const viewW = screenW / zoom;
            const offsetX = viewW < 640 ? -24 : -Math.min(200, Math.round(viewW * 0.16));
            cam.startFollow(this.player, true, 0.08, 0.08, offsetX, 0);
            cam.centerOn(this.player.x - offsetX, GAME_H / 2);

            // Redimensionar fundo e chão para cobrir 100% da largura visível sem faixas pretas
            const bgW = Math.max(viewW * 1.28, 1680);
            this.bgSky.setDisplaySize(bgW, GAME_H);
            this.pathTile.setSize(Math.ceil(viewW) + 160, 260);
            this.biomeOverlay.setSize(Math.ceil(viewW) + 160, GAME_H);
        }

        buildMidParallaxLayer() {
            // Continuidade limpa por trecho (scrollFactor 1.0 na margem atrás da estrada — sem empilhar em cima do lago/checkpoints!)
            const horizonY = 556;

            // Zona 1 (Plataforma 9¾: 0..1550) — limpa, deixando o castelo, o lago e o arco 9¾ respirarem!

            // Zona 2 (Floresta Proibida: 1750..2950) — bosque de pinheiros ao fundo + Expresso de Hogwarts animado!
            [1840, 2120, 2400, 2680].forEach((fx, i) => {
                this.add.image(fx, horizonY + 4, "mid_forest")
                    .setOrigin(0.5, 1)
                    .setScale(0.95 + (i % 2) * 0.12)
                    .setAlpha(0.94)
                    .setDepth(1.5);
            });

            // Expresso de Hogwarts animado passando na frente da Floresta Proibida (rodas, biela e fumaça reais!)
            this.buildAnimatedTrain(1920, horizonY + 8);

            // Zona 3 (Campo de Quadribol: 3400..4450) — aros dourados e torre da Sonserina bem espaçados
            this.add.image(3620, horizonY + 4, "mid_quidditch").setOrigin(0.5, 1).setScale(0.94).setAlpha(0.94).setDepth(1.6);
            this.add.image(3990, horizonY + 4, "mid_quidditch").setOrigin(0.5, 1).setScale(0.86).setAlpha(0.90).setDepth(1.6);

            // Zona 4 (Corredores de Hogwarts: 4950..5950) — arcos góticos iluminados antes do Chapéu Seletor
            this.add.image(5080, horizonY + 4, "mid_arch").setOrigin(0.5, 1).setScale(0.94).setAlpha(0.93).setDepth(1.6);
            this.add.image(5430, horizonY + 4, "mid_arch").setOrigin(0.5, 1).setScale(0.94).setAlpha(0.93).setDepth(1.6);

            // Zona 5 (Salão Principal: 7150..8350) — tapete verde e dourado da Sonserina no chão final
            const carpetX = 7680;
            const carpetW = 1080;
            this.add.rectangle(carpetX, GROUND_Y - 12, carpetW, 30, 0x145232, 0.88).setDepth(3);
            this.add.rectangle(carpetX, GROUND_Y - 26, carpetW, 3, 0xe6c267, 0.95).setDepth(3);
            this.add.rectangle(carpetX, GROUND_Y + 2, carpetW, 3, 0xe6c267, 0.95).setDepth(3);
        }

        buildAnimatedTrain(startX, baseY) {
            this.trainBaseY = baseY;
            this.trainWheelAngle = 0;
            this.trainSmokeTimer = 0;

            this.trainRig = this.add.container(startX, baseY).setScale(0.88).setDepth(1.8);

            // Corpo real da locomotiva (invertido para apontar para a DIREITA seguindo a jornada)
            this.trainBody = this.add.image(0, 0, "mid_train").setOrigin(0.5, 1).setFlipX(true);
            // Camada de mecanismo animado (raios das rodas + biela/pistão metálico)
            this.trainMechGfx = this.add.graphics();

            this.trainRig.add([this.trainBody, this.trainMechGfx]);
        }

        updateAnimatedTrain(time, dt) {
            if (!this.trainRig) return;

            // Desliza suavemente pelo trecho da Floresta Proibida (1780 -> 2820)
            const speed = 58;
            this.trainRig.x += speed * dt;
            if (this.trainRig.x > 2840) {
                this.trainRig.x = 1760;
            }

            // Vibração sutil da caldeira em movimento
            this.trainRig.y = this.trainBaseY + Math.sin(time * 0.022) * 1.3;

            // Rotação das 5 rodas + movimento orbital da biela/pistão
            this.trainWheelAngle += dt * 4.2;
            const a = this.trainWheelAngle;
            const g = this.trainMechGfx;
            g.clear();

            // 3 rodas motrizes grandes + 2 rodas dianteiras menores
            const bigWheels = [
                { x: -112, y: -30, r: 24 },
                { x: -42, y: -30, r: 24 },
                { x: 28, y: -30, r: 24 }
            ];
            const smallWheels = [
                { x: 88, y: -17, r: 12 },
                { x: 156, y: -17, r: 12 }
            ];

            // Raios girando nas rodas grandes
            g.lineStyle(2.2, 0xc9b48a, 0.72);
            bigWheels.forEach((w) => {
                for (let s = 0; s < 4; s++) {
                    const ang = a + (s * Math.PI) / 4;
                    g.lineBetween(
                        w.x - Math.cos(ang) * (w.r - 4),
                        w.y - Math.sin(ang) * (w.r - 4),
                        w.x + Math.cos(ang) * (w.r - 4),
                        w.y + Math.sin(ang) * (w.r - 4)
                    );
                }
            });

            // Raios girando nas rodas dianteiras
            g.lineStyle(1.8, 0xb8a88a, 0.68);
            smallWheels.forEach((w) => {
                for (let s = 0; s < 3; s++) {
                    const ang = a * 1.7 + (s * Math.PI) / 3;
                    g.lineBetween(
                        w.x - Math.cos(ang) * (w.r - 2),
                        w.y - Math.sin(ang) * (w.r - 2),
                        w.x + Math.cos(ang) * (w.r - 2),
                        w.y + Math.sin(ang) * (w.r - 2)
                    );
                }
            });

            // Biela principal conectando as 3 rodas motrizes em órbita circular + pistão
            const rodDx = Math.cos(a) * 9;
            const rodDy = Math.sin(a) * 9;
            g.lineStyle(4.5, 0xd9dee6, 0.92);
            g.lineBetween(bigWheels[0].x + rodDx, bigWheels[0].y + rodDy, bigWheels[2].x + rodDx, bigWheels[2].y + rodDy);
            // Haste do pistão indo até o cilindro dianteiro
            g.lineStyle(3.5, 0xbec5d0, 0.9);
            g.lineBetween(bigWheels[2].x + rodDx, bigWheels[2].y + rodDy, 102, -32);
            // Pinos dourados da biela
            g.fillStyle(0xf2d16b, 1);
            bigWheels.forEach((w) => {
                g.fillCircle(w.x + rodDx, w.y + rodDy, 3.5);
            });

            // Fumaça branca viva saindo da chaminé e subindo no céu noturno
            this.trainSmokeTimer += dt;
            if (this.trainSmokeTimer > 0.24) {
                this.trainSmokeTimer = 0;
                const scale = this.trainRig.scaleX;
                const chimneyX = this.trainRig.x + 118 * scale;
                const chimneyY = this.trainRig.y - 168 * scale;
                const puff = this.add.image(chimneyX, chimneyY, "soft_glow")
                    .setTint(0xf2f4fa)
                    .setScale(0.32)
                    .setAlpha(0.55)
                    .setDepth(1.9);
                this.tweens.add({
                    targets: puff,
                    x: chimneyX - Phaser.Math.Between(65, 115),
                    y: chimneyY - Phaser.Math.Between(70, 115),
                    scale: Phaser.Math.FloatBetween(1.15, 1.65),
                    alpha: 0,
                    duration: 1850,
                    ease: "Quad.easeOut",
                    onComplete: () => puff.destroy()
                });
            }
        }

        buildForegroundLayer() {
            // Vagalumes mágicos em primeiro plano (scrollFactor 1.18) para profundidade 2D real
            for (let gx = 120; gx < WORLD_WIDTH * 1.18; gx += 310) {
                const gy = GAME_H - Phaser.Math.Between(24, 95);
                const orb = this.add.image(gx, gy, "sparkle_dot")
                    .setScrollFactor(1.18, 0)
                    .setTint(gx % 2 === 0 ? 0x52f29b : 0xffe484)
                    .setScale(Phaser.Math.FloatBetween(0.45, 0.85))
                    .setAlpha(0.65)
                    .setDepth(14);
                this.tweens.add({
                    targets: orb,
                    y: gy - 22,
                    alpha: 0.25,
                    duration: 1600 + (gx % 600),
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut"
                });
            }
        }

        spawnShootingStar() {
            const wv = this.cameras.main.worldView;
            const sx = Phaser.Math.Between(Math.round(wv.left + 80), Math.round(wv.right - 60));
            const sy = Phaser.Math.Between(45, 190);
            const star = this.add.image(sx, sy, "sparkle_dot")
                .setTint(0xfff6cc)
                .setScale(0.65)
                .setDepth(1.2);
            this.tweens.add({
                targets: star,
                x: sx - 240,
                y: sy + 115,
                alpha: 0,
                scale: 0.1,
                duration: 780,
                ease: "Quad.easeOut",
                onComplete: () => star.destroy()
            });
        }

        buildLivingScenery() {
            // Vagalumes ambientais espalhados por todo o mapa estendido
            this.ambientFireflies = [];
            for (let i = 0; i < 68; i++) {
                const fx = Phaser.Math.Between(60, WORLD_WIDTH - 60);
                const fy = Phaser.Math.Between(85, 555);
                const dot = this.add.image(fx, fy, "sparkle_dot");
                dot.setTint(i % 3 === 0 ? 0x52f29b : 0xffe484);
                dot.setScale(Phaser.Math.FloatBetween(0.28, 0.65));
                dot.setAlpha(Phaser.Math.FloatBetween(0.25, 0.85));
                dot.setDepth(3);
                dot.baseY = fy;
                dot.phase = Math.random() * Math.PI * 2;
                dot.speed = Phaser.Math.FloatBetween(0.8, 1.8);
                this.ambientFireflies.push(dot);
            }

            // Estandartes da Sonserina balançando ao vento (camada 2D de profundidade)
            const bannerXs = [620, 1780, 3350, 3820, 4720, 5260, 6200, 6700, 7560, 7880];
            bannerXs.forEach((bx, idx) => {
                const pole = this.add.rectangle(bx, GROUND_Y - 120, 6, 220, 0x262833).setDepth(3);
                const bar = this.add.rectangle(bx, GROUND_Y - 226, 74, 6, 0x3b3d4c).setDepth(3);
                const flag = this.add.image(bx, GROUND_Y - 223, "decor_banner").setOrigin(0.5, 0).setScale(0.88).setDepth(3);
                this.tweens.add({
                    targets: flag,
                    angle: { from: -2.2, to: 2.2 },
                    duration: 1800 + (idx % 3) * 350,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut"
                });
                void pole; void bar;
            });

            // Pontos de luz mágica interativos ao longo do caminho (acendem quando a Helora passa!)
            this.lanternNodes = [];
            for (let lx = 500; lx < DATA.finaleX - 250; lx += 560) {
                const glow = this.add.image(lx, GROUND_Y - 120, "soft_glow")
                    .setTint(0xffe484)
                    .setScale(0.4)
                    .setAlpha(0.18)
                    .setDepth(4);
                this.lanternNodes.push({ x: lx, glow, lit: false });
            }
        }

        buildCollectibleStars() {
            this.collectibleStars = [];
            const segments = [
                [420, 1180],
                [1620, 2620],
                [3060, 4080],
                [4520, 5520],
                [5960, 6960],
                [7420, 7880]
            ];
            segments.forEach(([startX, endX]) => {
                const count = 4;
                const step = (endX - startX) / (count + 1);
                for (let i = 1; i <= count; i++) {
                    const sx = Math.round(startX + step * i);
                    const sy = GROUND_Y - 92 - (i % 2) * 26;
                    const star = this.add.image(sx, sy, "decor_star").setScale(0.84).setDepth(6);
                    this.tweens.add({
                        targets: star,
                        y: sy - 12,
                        scale: 0.94,
                        duration: 900 + i * 110,
                        yoyo: true,
                        repeat: -1,
                        ease: "Sine.easeInOut"
                    });
                    this.collectibleStars.push({ sprite: star, collected: false, baseX: sx, baseY: sy });
                }
            });
        }

        addHousePoints(amount, x, y) {
            this.housePoints += amount;
            UI.updatePoints(this.housePoints);
            const pop = this.add.text(x, y - 20, `+${amount} pts 🐍`, {
                fontFamily: "Cinzel, serif",
                fontSize: "18px",
                fontStyle: "bold",
                color: "#7affb2",
                stroke: "#092617",
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(18);
            this.tweens.add({
                targets: pop,
                y: pop.y - 54,
                alpha: 0,
                duration: 850,
                ease: "Cubic.easeOut",
                onComplete: () => pop.destroy()
            });
        }

        getZoneName(x) {
            if (x < 1650) return "Plataforma 9¾";
            if (x < 3100) return "Floresta Proibida";
            if (x < 4550) return "Campo de Quadribol";
            if (x < 6000) return "Corredores de Hogwarts";
            return "Salão Principal";
        }

        startJourney() {
            this.state = "WALKING";
            UI.hud.classList.remove("hidden");
            UI.controlsBar.classList.remove("hidden");
            UI.updateProgress(0, "Plataforma 9¾");
            UI.updatePoints(0);
        }

        resetJourney() {
            this.solvedIds.clear();
            this.housePoints = 0;
            this.walkPhase = 0;
            this.playerVel = 0;
            this.lastZoneName = "";

            this.player.setPosition(210, GROUND_Y);
            this.player.setTexture("helora_idle");
            this.player.setFlipX(false);
            this.player.setAngle(0);
            this.player.setScale(0.92);
            this.playerShadow.setPosition(210, GROUND_Y - 4);

            this.kitten.anims.stop();
            this.kitten.setPosition(95, GROUND_Y - 2).setTexture("kitten_idle").setFlipX(false).setAngle(0).setScale(0.74);
            this.kittenShadow.setPosition(95, GROUND_Y - 2);

            if (this.isacHero) {
                this.isacHero.destroy();
                this.isacHero = null;
            }
            UI.isacBubble.classList.add("hidden");
            this.finaleMarker.setVisible(true);
            this.finaleGlow.setVisible(true);

            // Esconde o bolo novamente até a próxima magia do Isac
            this.cakeSprite.setAlpha(0).setScale(0.1);

            this.isacBg.setVisible(true).setFlipX(false);
            this.isacBgRelX = -120;
            this.isacBgDir = 1;

            this.checkpointSprites.forEach(({ quiz, marker }) => {
                marker.setText(`✦ Quiz ${quiz.id} ✦`);
                marker.setColor("#fff3c4");
            });

            this.collectibleStars.forEach((item) => {
                item.collected = false;
                item.sprite.setVisible(true).setAlpha(1);
            });

            this.lanternNodes.forEach((node) => {
                node.lit = false;
                node.glow.setScale(0.4).setAlpha(0.18);
            });

            this.state = "WALKING";
            UI.updateProgress(0, "Plataforma 9¾");
            UI.updatePoints(0);
            UI.controlsBar.classList.remove("hidden");
        }

        burstMagic(x, y, count = 26) {
            const colors = [0x44e38e, 0xffe484, 0xffffff, 0x2ea367];
            for (let i = 0; i < count; i++) {
                const p = this.add.image(x, y, "sparkle_dot");
                p.setTint(colors[i % colors.length]);
                p.setScale(Phaser.Math.FloatBetween(0.45, 1.05));
                p.setDepth(15);
                const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                const dist = Phaser.Math.FloatBetween(55, 175);
                this.tweens.add({
                    targets: p,
                    x: x + Math.cos(angle) * dist,
                    y: y + Math.sin(angle) * dist - 30,
                    alpha: 0,
                    scale: 0.1,
                    duration: Phaser.Math.Between(550, 950),
                    ease: "Cubic.easeOut",
                    onComplete: () => p.destroy()
                });
            }
        }

        celebrateJump(onDone) {
            this.state = "CELEBRATE";
            this.player.anims.stop();
            this.player.setTexture("helora_celebrate");
            this.player.setAngle(0);
            this.burstMagic(this.player.x, this.player.y - 110, 32);

            // Gatinho pula feliz e solta coraçãozinho 💛
            this.kitten.anims.stop();
            this.kitten.setTexture("kitten_idle");
            const heart = this.add.text(this.kitten.x, this.kitten.y - 68, "💛", { fontSize: "24px" })
                .setOrigin(0.5)
                .setDepth(16);
            this.tweens.add({
                targets: heart,
                y: heart.y - 48,
                alpha: 0,
                duration: 900,
                ease: "Cubic.easeOut",
                onComplete: () => heart.destroy()
            });
            this.tweens.add({
                targets: this.kitten,
                y: GROUND_Y - 28,
                duration: 210,
                yoyo: true,
                repeat: 1,
                ease: "Sine.easeOut",
                onComplete: () => { this.kitten.y = GROUND_Y - 2; }
            });

            this.tweens.add({
                targets: this.player,
                y: GROUND_Y - 36,
                duration: 240,
                yoyo: true,
                repeat: 1,
                ease: "Sine.easeOut",
                onComplete: () => {
                    this.player.y = GROUND_Y;
                    this.player.setTexture("helora_idle");
                    if (onDone) onDone();
                }
            });
        }

        triggerQuiz(cp) {
            this.state = "QUIZ";
            InputState.touchWalk = false;
            InputState.canvasHoldRight = false;
            UI.btnWalk.classList.remove("walking");
            this.resetLegsToIdle();

            UI.updateProgress(this.solvedIds.size, cp.quiz.location);
            if (window.MagicMusic) window.MagicMusic.setDucked(true);

            UI.showQuiz(cp.quiz, () => {
                if (window.MagicMusic) window.MagicMusic.setDucked(false);
                this.solvedIds.add(cp.quiz.id);
                cp.marker.setText(`✓ ${cp.quiz.location}`);
                cp.marker.setColor("#7affb2");
                UI.updateProgress(this.solvedIds.size, cp.quiz.location);
                this.addHousePoints(50, this.player.x, this.player.y - 170);

                this.celebrateJump(() => {
                    this.state = "WALKING";
                });
            });
        }

        castSpellBeam(fromX, fromY, toX, toY) {
            SoundFX.playSpellCast();
            const colors = [0x44e38e, 0xffe484, 0xffffff, 0x2ea367];
            for (let i = 0; i < 28; i++) {
                this.time.delayedCall(i * 20, () => {
                    const orb = this.add.image(fromX, fromY, "sparkle_dot");
                    orb.setTint(colors[i % colors.length]);
                    orb.setScale(Phaser.Math.FloatBetween(0.55, 1.2));
                    orb.setDepth(16);
                    this.tweens.add({
                        targets: orb,
                        x: toX + Phaser.Math.Between(-24, 24),
                        y: toY + Phaser.Math.Between(-24, 24),
                        scale: 0.2,
                        alpha: 0.15,
                        duration: 420,
                        ease: "Quad.easeOut",
                        onComplete: () => orb.destroy()
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
            this.finaleMarker.setVisible(false);

            const wv = this.cameras.main.worldView;
            const startX = wv.right + 160;
            const hoverX = Math.min(DATA.finaleX + 70, wv.right - 130);
            const hoverY = GROUND_Y - 245;

            this.isacHero = this.add.image(startX, 110, "isac_broom");
            this.isacHero.setScale(0.76);
            this.isacHero.setFlipX(true);
            this.isacHero.setDepth(12);

            const trailEvent = this.time.addEvent({
                delay: 75,
                repeat: 70,
                callback: () => {
                    if (!this.isacHero || !this.isacHero.active) return;
                    const tailOffsetX = this.isacHero.flipX ? 85 : -85;
                    const sp = this.add.image(
                        this.isacHero.x + tailOffsetX,
                        this.isacHero.y + Phaser.Math.Between(-12, 24),
                        "sparkle_dot"
                    );
                    sp.setTint(Math.random() > 0.45 ? 0x52f29b : 0xffe484);
                    sp.setScale(Phaser.Math.FloatBetween(0.35, 0.75));
                    sp.setDepth(11);
                    this.tweens.add({
                        targets: sp,
                        alpha: 0,
                        scale: 0.1,
                        duration: 480,
                        onComplete: () => sp.destroy()
                    });
                }
            });

            // 1. Isac desce voando na vassoura
            this.tweens.add({
                targets: this.isacHero,
                x: hoverX,
                y: hoverY,
                duration: 1250,
                ease: "Cubic.easeOut",
                onComplete: () => {
                    const hoverTween = this.tweens.add({
                        targets: this.isacHero,
                        y: hoverY - 12,
                        duration: 850,
                        yoyo: true,
                        repeat: -1,
                        ease: "Sine.easeInOut"
                    });

                    // 2. Balão de Feliz Aniversário do Isac
                    UI.isacText.textContent = DATA.brother.greeting;
                    UI.isacBubble.classList.remove("hidden");
                    SoundFX.playPopup();

                    // 3. Isac solta a magia e FAZ O BOLO APARECER!
                    this.time.delayedCall(2200, () => {
                        const wandX = this.isacHero.x - 95;
                        const wandY = this.isacHero.y - 25;
                        this.castSpellBeam(wandX, wandY, this.cakeSprite.x, GROUND_Y - 70);

                        this.time.delayedCall(400, () => {
                            // Bolo surge magicamente com explosão de brilhos!
                            SoundFX.playCakeAppear();
                            this.burstMagic(this.cakeSprite.x, GROUND_Y - 95, 56);
                            this.finaleGlow.setVisible(false);
                            this.tweens.add({
                                targets: this.cakeSprite,
                                alpha: 1,
                                scale: 1,
                                duration: 680,
                                ease: "Back.easeOut"
                            });

                            this.celebrateJump(() => {
                                this.player.setTexture("helora_celebrate");
                            });
                        });

                        // 4. Isac vai embora voando e invoca o envelope do cartão
                        this.time.delayedCall(1550, () => {
                            UI.isacBubble.classList.add("hidden");
                            hoverTween.stop();
                            this.tweens.add({
                                targets: this.isacHero,
                                x: wv.left - 240,
                                y: 65,
                                angle: -8,
                                duration: 1150,
                                ease: "Quad.easeIn",
                                onComplete: () => {
                                    trailEvent.remove(false);
                                    if (this.isacHero) {
                                        this.isacHero.destroy();
                                        this.isacHero = null;
                                    }
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
            this.player.anims.stop();
            this.player.setTexture("helora_idle");
            this.player.setAngle(0);
            this.player.y = GROUND_Y;
        }

        updateBiomeAtmosphere(dt) {
            const x = this.player.x;
            let color = 0x1a2844;
            let alpha = 0.05;
            if (x < 1650) { color = 0x3b2a1e; alpha = 0.07; }            // Plataforma 9¾ (quente)
            else if (x < 3100) { color = 0x0b3a28; alpha = 0.14; }       // Floresta Proibida (névoa esmeralda)
            else if (x < 4550) { color = 0x1c2f5c; alpha = 0.06; }       // Campo de Quadribol (céu aberto)
            else if (x < 6000) { color = 0x2d1c47; alpha = 0.11; }       // Corredores (violeta/velas)
            else { color = 0x164028; alpha = 0.10; }                     // Salão Principal (Sonserina festivo)

            this.biomeOverlay.setFillStyle(color, alpha);

            this.biomeFxTimer += dt;
            if (this.biomeFxTimer > 0.32) {
                this.biomeFxTimer = 0;
                const wv = this.cameras.main.worldView;
                const minX = Math.round(wv.left + 40);
                const maxX = Math.max(minX + 40, Math.round(wv.right - 40));
                if (x < 1650) {
                    // Vapor suave do Expresso de Hogwarts
                    const steam = this.add.image(Phaser.Math.Between(minX, maxX), GROUND_Y - 12, "soft_glow")
                        .setTint(0xf5e9d4).setScale(0.55).setAlpha(0.16).setDepth(3);
                    this.tweens.add({ targets: steam, y: steam.y - 75, scale: 1.2, alpha: 0, duration: 1500, onComplete: () => steam.destroy() });
                } else if (x >= 6000) {
                    // Chuva suave de faíscas douradas/esmeralda no Salão Principal
                    const sp = this.add.image(Phaser.Math.Between(minX, maxX), 40, "sparkle_dot")
                        .setTint(Math.random() > 0.45 ? 0xffe484 : 0x52f29b).setScale(0.45).setAlpha(0.85).setDepth(13);
                    this.tweens.add({ targets: sp, y: GROUND_Y - 20, x: sp.x + Phaser.Math.Between(-45, 45), alpha: 0, duration: 2400, onComplete: () => sp.destroy() });
                }
            }

            // Estrelas cadentes periódicas no céu noturno
            this.shootingStarTimer -= dt;
            if (this.shootingStarTimer <= 0) {
                this.shootingStarTimer = Phaser.Math.FloatBetween(3.8, 7.2);
                this.spawnShootingStar();
            }
        }

        update(time, delta) {
            const dt = delta / 1000;

            // Vagalumes flutuando, trem animado na Floresta Proibida e atmosfera do bioma atual
            for (const dot of this.ambientFireflies) {
                dot.y = dot.baseY + Math.sin(time * 0.0015 * dot.speed + dot.phase) * 14;
            }
            this.updateAnimatedTrain(time, dt);
            this.updateBiomeAtmosphere(dt);

            // Sincronizar céu (parallax suave), bioma e chão (1:1) com a câmera em qualquer resolução
            const cam = this.cameras.main;
            const wv = cam.worldView;
            const midX = wv.centerX;
            const skyShift = -((cam.scrollX * 0.03) % 240);
            this.bgSky.setPosition(midX + skyShift, GAME_H / 2);
            this.biomeOverlay.setPosition(midX, GAME_H / 2);
            this.pathTile.setPosition(midX, GAME_H - 130);
            this.pathTile.tilePositionX = midX;

            // Isac voando no fundo do cenário indo e voltando até o final (dentro da área visível)
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
                    const sp = this.add.image(this.isacBg.x - this.isacBgDir * 44, this.isacBg.y + 8, "sparkle_dot");
                    sp.setTint(Math.random() > 0.5 ? 0x52f29b : 0xffe484).setScale(0.26).setAlpha(0.75).setDepth(1);
                    this.tweens.add({ targets: sp, alpha: 0, scale: 0.08, duration: 550, onComplete: () => sp.destroy() });
                }
            }

            // Gatinho laranjinha: 4 quadros reais andando + pose sentado quando parado!
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

            // Sincronizar tile do chão já atualizado acima
            if (this.state !== "WALKING") {
                return;
            }

            const moveRight = this.cursors.right.isDown || this.keyD.isDown || InputState.touchWalk || InputState.canvasHoldRight;
            const moveLeft = this.cursors.left.isDown || this.keyA.isDown;

            // Física com inércia suave (aceleração e frenagem orgânicas como no simulador)
            const targetVel = moveRight ? WALK_SPEED : (moveLeft ? -WALK_SPEED * 0.82 : 0);
            const accelRate = targetVel !== 0 ? 9.5 : 8.5;
            this.playerVel += (targetVel - this.playerVel) * Math.min(1, accelRate * dt);
            if (Math.abs(this.playerVel) < 4 && targetVel === 0) {
                this.playerVel = 0;
            }

            const isMoving = Math.abs(this.playerVel) > 8;
            if (isMoving) {
                const dir = this.playerVel >= 0 ? 1 : -1;
                const speedRatio = Math.min(1, Math.abs(this.playerVel) / WALK_SPEED);
                this.player.x = Phaser.Math.Clamp(this.player.x + this.playerVel * dt, 130, DATA.finaleX - 115);
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

                // Poeirinha mágica suave nos pés
                this.stepDustTimer += dt * speedRatio;
                if (this.stepDustTimer > 0.22) {
                    this.stepDustTimer = 0;
                    const puff = this.add.image(this.player.x - dir * 10, GROUND_Y - 5, "sparkle_dot")
                        .setTint(0xffe9a8).setScale(0.32).setAlpha(0.55).setDepth(9);
                    this.tweens.add({ targets: puff, x: puff.x - dir * 24, y: puff.y - 12, alpha: 0, scale: 0.1, duration: 380, onComplete: () => puff.destroy() });
                }

                // Rastro sutil da varinha
                this.particleTimer += dt * speedRatio;
                if (this.particleTimer > 0.14) {
                    this.particleTimer = 0;
                    const sp = this.add.image(
                        this.player.x + dir * 24,
                        this.player.y - 68 + Phaser.Math.Between(-8, 8),
                        "sparkle_dot"
                    );
                    sp.setTint(Math.random() > 0.45 ? 0xffe484 : 0x52f29b).setScale(Phaser.Math.FloatBetween(0.24, 0.48)).setDepth(9);
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

            // Atualizar nome da zona no HUD conforme caminha
            const currentZone = this.getZoneName(this.player.x);
            if (currentZone !== this.lastZoneName) {
                this.lastZoneName = currentZone;
                UI.updateProgress(this.solvedIds.size, currentZone);
            }

            // Coletar estrelinhas da Sonserina automaticamente ao passar
            for (const item of this.collectibleStars) {
                if (!item.collected && Math.abs(this.player.x - item.baseX) < 58) {
                    item.collected = true;
                    item.sprite.setVisible(false);
                    SoundFX.playCollect();
                    this.burstMagic(item.baseX, item.baseY, 12);
                    this.addHousePoints(10, item.baseX, item.baseY);
                }
            }

            // Acender pontos de lanterna mágicos ao passar
            for (const node of this.lanternNodes) {
                if (!node.lit && Math.abs(this.player.x - node.x) < 95) {
                    node.lit = true;
                    SoundFX.playLantern();
                    this.tweens.add({
                        targets: node.glow,
                        scale: 1.35,
                        alpha: 0.72,
                        duration: 420,
                        ease: "Back.easeOut"
                    });
                    this.burstMagic(node.x, GROUND_Y - 120, 8);
                }
            }

            // Verificar checkpoints de quiz
            for (const cp of this.checkpointSprites) {
                if (!this.solvedIds.has(cp.quiz.id) && this.player.x >= cp.quiz.worldX - 115) {
                    this.triggerQuiz(cp);
                    return;
                }
            }

            // Verificar chegada final (após os 5 quizzes)
            if (this.solvedIds.size >= DATA.quizzes.length && this.player.x >= DATA.finaleX - 140) {
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

    // Garantir reajuste imediato ao virar o celular (retrato <-> paisagem)
    let resizeTimer = null;
    const syncViewportSize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const w = window.visualViewport ? Math.round(window.visualViewport.width) : window.innerWidth;
            const h = window.visualViewport ? Math.round(window.visualViewport.height) : window.innerHeight;
            if (w > 0 && h > 0) {
                game.scale.resize(w, h);
            }
        }, 120);
    };
    window.addEventListener("orientationchange", syncViewportSize);
    window.addEventListener("resize", syncViewportSize);
    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", syncViewportSize);
    }
})();
