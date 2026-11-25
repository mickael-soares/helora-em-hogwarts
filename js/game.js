(function () {
    "use strict";

    const DATA = window.HELORA_QUIZ_DATA;
    const ASSETS = window.HELORA_ASSETS;

    const WORLD_W = DATA.worldWidth || 2560;
    const WORLD_H = DATA.worldHeight || 1440;
    const WALK_SPEED = 275;
    const HELORA_SCALE = 0.44;
    const KITTEN_SCALE = 0.38;

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
        hudNotes: document.getElementById("hud-notes"),
        hudBroom: document.getElementById("hud-broom"),
        hudFelix: document.getElementById("hud-felix"),
        hudCount: document.getElementById("hud-count"),
        orbs: Array.from(document.querySelectorAll("#hud .orb")),
        btnMap: document.getElementById("btn-map"),
        btnMute: document.getElementById("btn-mute"),
        btnFullscreen: document.getElementById("btn-fullscreen"),
        controlsBar: document.getElementById("controls-bar"),
        joystickZone: document.getElementById("joystick-zone"),
        joystickKnob: document.getElementById("joystick-knob"),
        btnExplore: document.getElementById("btn-explore"),
        btnLumos: document.getElementById("btn-lumos"),
        btnFly: document.getElementById("btn-fly"),
        btnSprint: document.getElementById("btn-sprint"),
        challengeBanner: document.getElementById("challenge-banner"),
        mapOverlay: document.getElementById("map-overlay"),
        mapRegions: document.getElementById("map-regions"),
        btnCloseMap: document.getElementById("btn-close-map"),
        noteOverlay: document.getElementById("note-overlay"),
        noteSeal: document.getElementById("note-seal"),
        noteTitle: document.getElementById("note-title"),
        noteBody: document.getElementById("note-body"),
        btnCloseNote: document.getElementById("btn-close-note"),
        btnFreeRoam: document.getElementById("btn-free-roam"),
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

        updateNotes(count) {
            if (this.hudNotes) this.hudNotes.textContent = `${count}/${DATA.quizzes.length}`;
        },

        showBanner(text, autoHideMs = 0) {
            if (!this.challengeBanner) return;
            clearTimeout(this._bannerTimer);
            this.challengeBanner.textContent = text;
            this.challengeBanner.classList.remove("hidden");
            if (autoHideMs > 0) {
                this._bannerTimer = setTimeout(() => {
                    this.challengeBanner.classList.add("hidden");
                }, autoHideMs);
            }
        },

        hideBanner() {
            clearTimeout(this._bannerTimer);
            if (this.challengeBanner) this.challengeBanner.classList.add("hidden");
        },

        showNoteModal(seal, title, body, onClose) {
            SoundFX.playPopup();
            this.noteSeal.textContent = seal || "💌";
            this.noteTitle.textContent = title;
            this.noteBody.textContent = body;
            this.noteOverlay.classList.remove("hidden");
            this.btnCloseNote.onclick = () => {
                this.noteOverlay.classList.add("hidden");
                if (onClose) onClose();
            };
        },

        showMarauderMap(scene) {
            SoundFX.playPopup();
            this.mapRegions.innerHTML = "";

            const sec1 = document.createElement("div");
            sec1.className = "map-section-title";
            sec1.textContent = "🌍 Vale de Hogwarts";
            this.mapRegions.appendChild(sec1);

            DATA.quizzes.forEach((region, idx) => {
                const isCurrent = scene.activeWorld === "valley" && idx === scene.currentRegionIdx;
                const quizDone = scene.solvedIds.has(region.id);
                const noteDone = scene.foundNotes.has(region.id);
                const row = document.createElement("button");
                row.type = "button";
                row.className = "map-row" + (isCurrent ? " current" : "");
                const quizTag = quizDone ? "✓ Quiz" : "✦ Quiz";
                const noteTag = noteDone ? "💌 Bilhete ✓" : "💌 Bilhete ?";
                const extraTag = region.id === 3 && !scene.hasBroom ? " • 🧹 Vassoura!" : "";
                row.innerHTML = `
                    <div>
                        <div class="map-row-name">${isCurrent ? "👣 " : ""}${region.id}. ${region.location}</div>
                        <div class="map-row-meta"><span>${quizTag}</span><span>${noteTag}${extraTag}</span></div>
                    </div>
                    <span>${isCurrent ? "Aqui" : "Viajar ➜"}</span>
                `;
                row.addEventListener("click", () => {
                    this.mapOverlay.classList.add("hidden");
                    scene.fastTravelTo(region, "valley");
                });
                this.mapRegions.appendChild(row);
            });

            const sec2 = document.createElement("div");
            sec2.className = "map-section-title";
            sec2.textContent = "🏰 Interior do Castelo de Hogwarts";
            this.mapRegions.appendChild(sec2);

            if (!scene.castleUnlocked) {
                const lockedRow = document.createElement("button");
                lockedRow.type = "button";
                lockedRow.className = "map-row";
                lockedRow.disabled = true;
                lockedRow.innerHTML = `
                    <div>
                        <div class="map-row-name">🔒 Torre do Castelo</div>
                        <div class="map-row-meta"><span>Encontre a 🧹 Vassoura no Quadribol e voe até a Torre!</span></div>
                    </div>
                    <span>🔒</span>
                `;
                this.mapRegions.appendChild(lockedRow);
            } else {
                DATA.castleWorld.wings.forEach((wing, idx) => {
                    const isCurrent = scene.activeWorld === "castle" && idx === scene.currentCastleWingIdx;
                    const row = document.createElement("button");
                    row.type = "button";
                    row.className = "map-row" + (isCurrent ? " current" : "");
                    const qTag = wing.quiz ? (scene.bonusSolvedIds.has(wing.quiz.id) ? "✓ Quiz Bônus" : "✦ Quiz Bônus") : "🔭 Mirante";
                    row.innerHTML = `
                        <div>
                            <div class="map-row-name">${isCurrent ? "👣 " : ""}${wing.location}</div>
                            <div class="map-row-meta"><span>${qTag}</span></div>
                        </div>
                        <span>${isCurrent ? "Aqui" : "Viajar ➜"}</span>
                    `;
                    row.addEventListener("click", () => {
                        this.mapOverlay.classList.add("hidden");
                        scene.fastTravelTo(wing, "castle");
                    });
                    this.mapRegions.appendChild(row);
                });
            }

            const sec3 = document.createElement("div");
            sec3.className = "map-section-title";
            sec3.textContent = "🏘️ Setor Sul • Hogsmeade & Cabana do Hagrid";
            this.mapRegions.appendChild(sec3);

            DATA.hogsmeadeWorld.zones.forEach((zone, idx) => {
                const isCurrent = scene.activeWorld === "hogsmeade" && idx === scene.currentHogsmeadeIdx;
                const row = document.createElement("button");
                row.type = "button";
                row.className = "map-row" + (isCurrent ? " current" : "");
                const qTag = zone.quiz ? (scene.bonusSolvedIds.has(zone.quiz.id) ? "✓ Quiz Bônus" : "✦ Quiz Bônus") : "🚂 Estação";
                row.innerHTML = `
                    <div>
                        <div class="map-row-name">${isCurrent ? "👣 " : ""}${zone.location}</div>
                        <div class="map-row-meta"><span>${qTag}</span></div>
                    </div>
                    <span>${isCurrent ? "Aqui" : "Viajar ➜"}</span>
                `;
                row.addEventListener("click", () => {
                    this.mapOverlay.classList.add("hidden");
                    scene.fastTravelTo(zone, "hogsmeade");
                });
                this.mapRegions.appendChild(row);
            });

            const sec4 = document.createElement("div");
            sec4.className = "map-section-title";
            sec4.textContent = "🚪 Interiores & Estufas de Herbologia";
            this.mapRegions.appendChild(sec4);

            Object.entries(DATA.rooms).forEach(([rKey, room]) => {
                const isCurrent = scene.activeWorld === rKey;
                const row = document.createElement("button");
                row.type = "button";
                row.className = "map-row" + (isCurrent ? " current" : "");
                row.innerHTML = `
                    <div>
                        <div class="map-row-name">${isCurrent ? "👣 " : ""}${room.title}</div>
                        <div class="map-row-meta"><span>${room.isOutdoor ? "🌿 Área Aberta" : "🏠 Interior Explorável"}</span></div>
                    </div>
                    <span>${isCurrent ? "Aqui" : "Entrar ➜"}</span>
                `;
                row.addEventListener("click", () => {
                    this.mapOverlay.classList.add("hidden");
                    scene.switchWorld(rKey, room.startPos, room.title);
                });
                this.mapRegions.appendChild(row);
            });

            this.mapOverlay.classList.remove("hidden");
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
                this.bdayStats.textContent = `🏆 ${DATA.quizzes.length}/${DATA.quizzes.length} quizzes completos • ${housePoints} pts para a Sonserina!`;
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
        joyX: 0,
        joyY: 0,
        joyActive: false,
        touchSprint: false,
        pointerWalk: false,
        pointerScreenX: 0,
        pointerScreenY: 0
    };

    class HogwartsOverworldScene extends Phaser.Scene {
        constructor() {
            super({ key: "HogwartsOverworldScene" });
        }

        preload() {
            // Mapa Contínuo Top-Down 3/4 + Camada Superior da Ponte + Interior do Castelo
            this.load.image("overworld_map", ASSETS.overworld_map);
            this.load.image("overworld_bridge_overlay", ASSETS.overworld_bridge_overlay);
            this.load.image("castle_interior_map", ASSETS.castle_interior_map);
            this.load.image("castle_high_table_overlay", ASSETS.castle_high_table_overlay);
            this.load.image("hogsmeade_map", ASSETS.hogsmeade_map);
            this.load.image("interior_three_broomsticks", ASSETS.interior_three_broomsticks);
            this.load.image("interior_honeydukes", ASSETS.interior_honeydukes);
            this.load.image("interior_hagrid_hut", ASSETS.interior_hagrid_hut);
            this.load.image("greenhouse_grounds_map", ASSETS.greenhouse_grounds_map);

            // Helora nas 4 direções + Corrida dedicada + Voo na Vassoura com o Gatinho!
            this.load.image("helora_idle", ASSETS.helora_idle);
            this.load.image("helora_celebrate", ASSETS.helora_celebrate);
            this.load.image("helora_broom", ASSETS.helora_broom);
            this.load.image("helora_broom_back", ASSETS.helora_broom_back);
            this.load.image("helora_broom_front", ASSETS.helora_broom_front);
            this.load.spritesheet("helora_walk", ASSETS.helora_walk, { frameWidth: 256, frameHeight: 256 });
            this.load.spritesheet("helora_back_walk", ASSETS.helora_back_walk, { frameWidth: 256, frameHeight: 256 });
            this.load.spritesheet("helora_front_walk", ASSETS.helora_front_walk, { frameWidth: 256, frameHeight: 256 });
            this.load.spritesheet("helora_run_side", ASSETS.helora_run_side, { frameWidth: 256, frameHeight: 256 });
            this.load.spritesheet("helora_run_front", ASSETS.helora_run_front, { frameWidth: 256, frameHeight: 256 });
            this.load.spritesheet("helora_run_back", ASSETS.helora_run_back, { frameWidth: 256, frameHeight: 256 });

            // Gatinho nas 4 direções (todos com 4 frames fluidos!)
            this.load.image("kitten_idle", ASSETS.kitten_idle);
            this.load.spritesheet("kitten_walk", ASSETS.kitten_walk, { frameWidth: 144, frameHeight: 128 });
            this.load.spritesheet("kitten_back_walk", ASSETS.kitten_back_walk, { frameWidth: 128, frameHeight: 128 });
            this.load.spritesheet("kitten_front_walk", ASSETS.kitten_front_walk, { frameWidth: 128, frameHeight: 128 });

            // Isac, Convidados Especiais & Props
            this.load.image("isac_broom", ASSETS.isac_broom);
            this.load.image("npc_lidiane", ASSETS.npc_lidiane);
            this.load.image("npc_denis", ASSETS.npc_denis);
            this.load.image("decor_star", ASSETS.decor_star);
            this.load.image("decor_potion", ASSETS.decor_potion);
            this.load.image("prop_platform", ASSETS.prop_platform);
            this.load.image("prop_owl", ASSETS.prop_owl);
            this.load.image("prop_snitch", ASSETS.prop_snitch);
            this.load.image("prop_hat", ASSETS.prop_hat);
            this.load.image("prop_gate", ASSETS.prop_gate);
            this.load.image("prop_cake", ASSETS.prop_cake);
        }

        create() {
            this.state = "INTRO"; // INTRO | WALKING | QUIZ | SNITCH_HUNT | MODAL | CELEBRATE | FINALE
            this.activeWorld = "valley"; // "valley" | "castle" | "hogsmeade"
            this.currentRegionIdx = 0;
            this.currentCastleWingIdx = 0;
            this.currentHogsmeadeIdx = 0;
            this.solvedIds = new Set();
            this.bonusSolvedIds = new Set();
            this.foundNotes = new Set();
            this.housePoints = 0;
            this.finaleDone = false;
            this.hasBroom = false;
            this.isFlying = false;
            this.flyAlt = 0;
            this.castleUnlocked = false;
            this.valleyObjects = [];
            this.castleObjects = [];
            this.hogsmeadeObjects = [];
            this.roomObjects = [];
            this.roomStars = [];
            this.roomInteractables = [];
            this.roomFlames = [];
            this.roomCauldrons = [];
            this.collectedRoomStars = new Set();
            this.lumosActive = false;
            this.lumosSolved = false;
            this.snitchSolved = false;
            this.snitchHits = 0;
            this.felixTimer = 0;
            this.lastPetTime = 0;
            this.velX = 0;
            this.velY = 0;
            this.facing = "right";
            this.walkPhase = 0;
            this.stepDustTimer = 0;
            this.particleTimer = 0;
            this.activeInteractable = null;

            this.createHelperTextures();
            this.createAnimations();

            // 1. Mapa Único Top-Down 3/4 (2560 x 1440)
            this.mapBg = this.add.image(WORLD_W / 2, WORLD_H / 2, "overworld_map")
                .setDisplaySize(WORLD_W, WORLD_H)
                .setDepth(0);

            // Camada superior do arco da ponte (fica ACIMA da Helora e do gatinho para passarem por BAIXO!)
            this.bridgeOverlay = this.add.image(1920, 906.67, "overworld_bridge_overlay")
                .setOrigin(0, 0)
                .setDisplaySize(640, 533.33)
                .setDepth(11.6);

            // Overlay escuro do mini-desafio Lumos (cobre o vale quando Helora entra na clareira)
            this.darknessOverlay = this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x040712, 0)
                .setDepth(14);

            // 2. Vagalumes mágicos espalhados por todo o vale
            this.ambientFireflies = [];
            for (let i = 0; i < 42; i++) {
                const fx = Phaser.Math.Between(120, WORLD_W - 120);
                const fy = Phaser.Math.Between(220, WORLD_H - 90);
                const dot = this.add.image(fx, fy, "sparkle_dot")
                    .setTint(i % 2 === 0 ? 0x52f29b : 0xffe484)
                    .setScale(Phaser.Math.FloatBetween(0.24, 0.52))
                    .setAlpha(Phaser.Math.FloatBetween(0.25, 0.72))
                    .setDepth(2.5);
                dot.baseY = fy;
                dot.phase = Math.random() * Math.PI * 2;
                dot.speed = Phaser.Math.FloatBetween(0.8, 1.8);
                this.ambientFireflies.push(dot);
            }

            // 3. Construir todos os elementos dos 2 Mundos Abertos (Vale + Interior do Castelo)
            const vStart = this.children.list.length;
            this.buildOpenWorldContent();
            this.valleyObjects = [this.bridgeOverlay, ...this.children.list.slice(vStart)];

            const cStart = this.children.list.length;
            this.buildCastleWorldContent();
            this.castleObjects = this.children.list.slice(cStart);

            const hStart = this.children.list.length;
            this.buildHogsmeadeWorldContent();
            this.hogsmeadeObjects = this.children.list.slice(hStart);

            this.setWorldVisibility("valley");

            // 4. Gatinho Laranjinha (interativo para carinho!)
            const sx = DATA.startPos.x;
            const sy = DATA.startPos.y;
            this.kittenShadow = this.add.ellipse(sx - 68, sy + 6, 36, 12, 0x080716, 0.4).setDepth(3.5);
            this.kitten = this.add.sprite(sx - 68, sy + 6, "kitten_idle")
                .setOrigin(0.5, 0.92)
                .setScale(KITTEN_SCALE)
                .setDepth(5 + (sy + 6) / 1000);
            this.kitten.setInteractive({ useHandCursor: true });
            this.kitten.on("pointerdown", () => this.petKitten());

            // Aura Felix Felicis + Aura de Voo na Vassoura
            this.felixAura = this.add.image(sx, sy - 42, "soft_glow")
                .setTint(0xffe066)
                .setScale(1.15)
                .setAlpha(0)
                .setDepth(4.5);
            this.flyAura = this.add.image(sx, sy - 20, "soft_glow")
                .setTint(0x52f29b)
                .setScale(1.25, 0.55)
                .setAlpha(0)
                .setDepth(4.4);

            // 5. Helora (Protagonista)
            this.playerShadow = this.add.ellipse(sx, sy, 52, 16, 0x080716, 0.46).setDepth(3.5);
            this.player = this.add.sprite(sx, sy, "helora_idle")
                .setOrigin(0.5, 0.92)
                .setScale(HELORA_SCALE)
                .setDepth(5 + sy / 1000);

            // 6. Isac voando no céu do vale
            this.isacBgDir = 1;
            this.isacBg = this.add.image(-120, 260, "isac_broom")
                .setScale(0.28)
                .setAlpha(0.92)
                .setDepth(13);
            this.isacBgTrailTimer = 0;

            // 7. Controles de Teclado + Toque direto no mapa
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
            this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
            this.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
            this.keyL = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
            this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

            this.input.on("pointerdown", (pointer, currentlyOver) => {
                if (currentlyOver && currentlyOver.length > 0) return;
                if (this.state === "WALKING" && !InputState.joyActive) {
                    SoundFX.unlock();
                    InputState.pointerWalk = true;
                    InputState.pointerScreenX = pointer.x;
                    InputState.pointerScreenY = pointer.y;
                }
            });
            this.input.on("pointermove", (pointer) => {
                if (InputState.pointerWalk) {
                    InputState.pointerScreenX = pointer.x;
                    InputState.pointerScreenY = pointer.y;
                }
            });
            this.input.on("pointerup", () => { InputState.pointerWalk = false; });
            this.input.on("pointerupoutside", () => { InputState.pointerWalk = false; });

            // 8. Câmera 360° seguindo Helora no mundo 2560x1440
            const cam = this.cameras.main;
            cam.setBounds(0, 0, WORLD_W, WORLD_H);
            cam.startFollow(this.player, true, 0.1, 0.1);
            this.applyResponsiveCamera(this.scale.width, this.scale.height);
            this.scale.on("resize", (gameSize) => {
                this.applyResponsiveCamera(gameSize.width, gameSize.height);
            });

            UI.updateProgress(0, DATA.quizzes[0].location);
            UI.updatePoints(0);
            UI.updateNotes(0);

            window.__heloraScene = this;
        }

        createHelperTextures() {
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
        }

        createAnimations() {
            if (!this.anims.exists("helora_walk_anim")) {
                this.anims.create({
                    key: "helora_walk_anim",
                    frames: this.anims.generateFrameNumbers("helora_walk", { start: 0, end: 3 }),
                    frameRate: 8,
                    repeat: -1
                });
            }
            if (!this.anims.exists("helora_back_anim")) {
                this.anims.create({
                    key: "helora_back_anim",
                    frames: this.anims.generateFrameNumbers("helora_back_walk", { start: 0, end: 3 }),
                    frameRate: 7.5,
                    repeat: -1
                });
            }
            if (!this.anims.exists("helora_front_anim")) {
                this.anims.create({
                    key: "helora_front_anim",
                    frames: this.anims.generateFrameNumbers("helora_front_walk", { start: 0, end: 3 }),
                    frameRate: 6.5,
                    repeat: -1
                });
            }
            if (!this.anims.exists("helora_run_side_anim")) {
                this.anims.create({
                    key: "helora_run_side_anim",
                    frames: this.anims.generateFrameNumbers("helora_run_side", { start: 0, end: 3 }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            if (!this.anims.exists("helora_run_front_anim")) {
                this.anims.create({
                    key: "helora_run_front_anim",
                    frames: this.anims.generateFrameNumbers("helora_run_front", { start: 0, end: 3 }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            if (!this.anims.exists("helora_run_back_anim")) {
                this.anims.create({
                    key: "helora_run_back_anim",
                    frames: this.anims.generateFrameNumbers("helora_run_back", { start: 0, end: 3 }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            if (!this.anims.exists("kitten_walk_anim")) {
                this.anims.create({
                    key: "kitten_walk_anim",
                    frames: this.anims.generateFrameNumbers("kitten_walk", { start: 0, end: 3 }),
                    frameRate: 9.5,
                    repeat: -1
                });
            }
            if (!this.anims.exists("kitten_back_anim")) {
                this.anims.create({
                    key: "kitten_back_anim",
                    frames: this.anims.generateFrameNumbers("kitten_back_walk", { start: 0, end: 3 }),
                    frameRate: 9,
                    repeat: -1
                });
            }
            if (!this.anims.exists("kitten_front_anim")) {
                this.anims.create({
                    key: "kitten_front_anim",
                    frames: this.anims.generateFrameNumbers("kitten_front_walk", { start: 0, end: 3 }),
                    frameRate: 9,
                    repeat: -1
                });
            }
        }

        buildOpenWorldContent() {
            this.collectibleStars = [];
            this.potions = [];
            this.checkpoints = [];
            this.interactables = [];

            // 1. Estrelas mágicas nas estradas de pedra
            DATA.stars.forEach((pt, i) => {
                const star = this.add.image(pt.x, pt.y, "decor_star")
                    .setScale(0.56)
                    .setDepth(5 + pt.y / 1000);
                this.tweens.add({
                    targets: star,
                    y: pt.y - 8,
                    scale: 0.64,
                    duration: 900 + (i % 5) * 110,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut"
                });
                this.collectibleStars.push({ sprite: star, x: pt.x, y: pt.y, collected: false, secret: false });
            });

            // 2. 3 Estrelas secretas do Lumos na Floresta Proibida
            DATA.lumosStars.forEach((pt, i) => {
                const star = this.add.image(pt.x, pt.y, "decor_star")
                    .setScale(0.64)
                    .setVisible(false)
                    .setAlpha(0)
                    .setDepth(5 + pt.y / 1000);
                star._worldHidden = true;
                this.tweens.add({
                    targets: star,
                    y: pt.y - 10,
                    duration: 850 + i * 95,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut"
                });
                this.collectibleStars.push({ sprite: star, x: pt.x, y: pt.y, collected: false, secret: true });
            });

            // 3. Poções Felix Felicis
            DATA.potions.forEach((p) => {
                const glow = this.add.image(p.x, p.y, "soft_glow")
                    .setTint(0xffe066)
                    .setScale(0.55)
                    .setAlpha(0.58)
                    .setDepth(4.8 + p.y / 1000);
                const vial = this.add.image(p.x, p.y, "decor_potion")
                    .setScale(0.58)
                    .setDepth(5 + p.y / 1000);
                this.tweens.add({
                    targets: [vial, glow],
                    y: p.y - 9,
                    duration: 950,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut"
                });
                this.potions.push({ sprite: vial, glow, x: p.x, y: p.y, collected: false });
            });

            // 4. 5 Checkpoints de Quiz, 5 Bilhetes Secretos e Pontos de Exploração
            DATA.quizzes.forEach((region) => {
                const qx = region.quizPos.x;
                const qy = region.quizPos.y;

                const glow = this.add.image(qx, qy, "soft_glow")
                    .setTint(0x52f29b)
                    .setScale(0.85, 0.45)
                    .setAlpha(0.55)
                    .setDepth(4.5 + qy / 1000);

                const propScale = region.propKey === "prop_snitch" ? 0.34 : 0.42;
                const prop = this.add.image(qx, qy - 8, region.propKey)
                    .setOrigin(0.5, 0.85)
                    .setScale(propScale)
                    .setDepth(5 + qy / 1000);
                this.tweens.add({
                    targets: prop,
                    y: qy - 16,
                    duration: 1100,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut"
                });

                const marker = this.add.text(qx, qy - 68, `✦ Quiz ${region.id} • ${region.location}`, {
                    fontFamily: "Cinzel, serif",
                    fontSize: "15px",
                    fontStyle: "bold",
                    color: "#fff3c4",
                    backgroundColor: "rgba(13, 43, 29, 0.88)",
                    padding: { x: 9, y: 4 }
                }).setOrigin(0.5).setDepth(12);
                this.tweens.add({
                    targets: marker,
                    y: qy - 74,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut"
                });

                this.checkpoints.push({ quiz: region, x: qx, y: qy, prop, glow, marker, solved: false });

                // Bilhete Secreto
                if (region.secretNote) {
                    const nx = region.secretNote.x;
                    const ny = region.secretNote.y;
                    const nglow = this.add.image(nx, ny, "soft_glow")
                        .setTint(0xffe680)
                        .setScale(0.5)
                        .setAlpha(0.6)
                        .setDepth(4.6 + ny / 1000);
                    const nicon = this.add.text(nx, ny, "💌", { fontSize: "24px" })
                        .setOrigin(0.5)
                        .setDepth(5.2 + ny / 1000);
                    this.tweens.add({
                        targets: [nicon, nglow],
                        y: ny - 9,
                        duration: 920,
                        yoyo: true,
                        repeat: -1,
                        ease: "Sine.easeInOut"
                    });
                    this.interactables.push({
                        type: "note",
                        regionId: region.id,
                        x: nx,
                        y: ny,
                        sprite: nicon,
                        glow: nglow,
                        label: "💌 Ler Bilhete Secreto",
                        data: region.secretNote,
                        done: false
                    });
                }

                // Pontos de Exploração
                if (region.exploreSpots) {
                    region.exploreSpots.forEach((spot) => {
                        const badge = this.add.text(spot.x, spot.y - 26, spot.label, {
                            fontFamily: "Nunito, sans-serif",
                            fontSize: "13px",
                            fontStyle: "bold",
                            color: "#fff5d6",
                            backgroundColor: "rgba(18, 36, 46, 0.82)",
                            padding: { x: 8, y: 4 }
                        }).setOrigin(0.5).setDepth(11.5);
                        this.tweens.add({
                            targets: badge,
                            y: spot.y - 32,
                            duration: 1100,
                            yoyo: true,
                            repeat: -1,
                            ease: "Sine.easeInOut"
                        });
                        this.interactables.push({
                            type: "spot",
                            regionId: region.id,
                            x: spot.x,
                            y: spot.y,
                            sprite: badge,
                            label: `✨ ${spot.label}`,
                            data: spot,
                            done: false
                        });
                    });
                }
            });

            // 5. Pátio da Grande Surpresa (Hogwarts Courtyard — Bolo INVISÍVEL até Isac conjurar!)
            const fx = DATA.finalePos.x;
            const fy = DATA.finalePos.y;
            this.finaleGlow = this.add.image(fx, fy, "soft_glow")
                .setTint(0x52f29b)
                .setScale(1.3, 0.55)
                .setAlpha(0.25)
                .setDepth(4.2);
            this.tweens.add({
                targets: this.finaleGlow,
                scaleX: 1.55,
                duration: 1100,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });

            this.finaleLabel = this.add.text(fx, fy - 42, "🎂 Pátio da Surpresa (0/5 quizzes)", {
                fontFamily: "Cinzel, serif",
                fontSize: "14px",
                fontStyle: "bold",
                color: "#d9e8dc",
                backgroundColor: "rgba(13, 43, 29, 0.82)",
                padding: { x: 10, y: 4 }
            }).setOrigin(0.5).setDepth(12);

            this.cakeSprite = this.add.image(fx, fy - 12, "prop_cake")
                .setOrigin(0.5, 0.9)
                .setScale(0.08)
                .setAlpha(0)
                .setDepth(5.1 + fy / 1000);

            // 6. Vassoura Mágica escondida no Campo de Quadribol (libera Modo Voo!)
            const bx = DATA.broomPos.x;
            const by = DATA.broomPos.y;
            this.broomGlow = this.add.image(bx, by, "soft_glow")
                .setTint(0xffe066)
                .setScale(0.85)
                .setAlpha(0.75)
                .setDepth(4.7 + by / 1000);
            this.broomIcon = this.add.text(bx, by - 4, "🧹", { fontSize: "30px" })
                .setOrigin(0.5)
                .setDepth(5.2 + by / 1000);
            this.broomLabel = this.add.text(bx, by - 36, "🧹 Vassoura Mágica", {
                fontFamily: "Cinzel, serif",
                fontSize: "13px",
                fontStyle: "bold",
                color: "#fff5b8",
                backgroundColor: "rgba(13, 43, 29, 0.88)",
                padding: { x: 8, y: 3 }
            }).setOrigin(0.5).setDepth(12);
            this.tweens.add({
                targets: [this.broomIcon, this.broomGlow, this.broomLabel],
                y: "-=10",
                duration: 950,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });

            // 7. Portal Aéreo na Torre do Castelo de Hogwarts (só alcançável voando!)
            const tx = DATA.towerPortalPos.x;
            const ty = DATA.towerPortalPos.y;
            this.towerGlow = this.add.image(tx, ty, "soft_glow")
                .setTint(0x52f29b)
                .setScale(1.25)
                .setAlpha(0.72)
                .setDepth(12.2);
            this.towerLabel = this.add.text(tx, ty - 34, "🏰 Torre do Castelo • Voe aqui!", {
                fontFamily: "Cinzel, serif",
                fontSize: "14px",
                fontStyle: "bold",
                color: "#9effca",
                backgroundColor: "rgba(13, 43, 29, 0.9)",
                padding: { x: 10, y: 4 }
            }).setOrigin(0.5).setDepth(12.5);
            this.tweens.add({
                targets: [this.towerGlow, this.towerLabel],
                y: "-=8",
                duration: 1050,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });
            this.interactables.push({
                type: "enter_castle",
                world: "valley",
                requiresFlight: true,
                x: tx,
                y: ty,
                label: "🏰 Entrar na Torre do Castelo",
                done: false
            });

            // 8. Saída Sul da Avenida Central -> Vila de Hogsmeade & Expresso!
            const spx = DATA.southPortalPos.x;
            const spy = DATA.southPortalPos.y;
            const spGlow = this.add.image(spx, spy, "soft_glow")
                .setTint(0xffe484).setScale(1.15, 0.5).setAlpha(0.65).setDepth(4.3);
            const spLabel = this.add.text(spx, spy - 26, "⬇ Vila de Hogsmeade & Expresso", {
                fontFamily: "Cinzel, serif", fontSize: "14px", fontStyle: "bold",
                color: "#fff3c4", backgroundColor: "rgba(13, 43, 29, 0.9)", padding: { x: 10, y: 4 }
            }).setOrigin(0.5).setDepth(12);
            this.tweens.add({ targets: [spGlow, spLabel], y: "+=6", duration: 1000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
            this.interactables.push({
                type: "enter_hogsmeade",
                world: "valley",
                x: spx,
                y: spy,
                label: "⬇ Ir para Vila de Hogsmeade",
                done: false
            });
        }

        buildCastleWorldContent() {
            const cw = DATA.castleWorld;
            this.castleStars = [];
            this.castlePotions = [];
            this.castleCheckpoints = [];
            this.castleInteractables = [];

            // Estrelas internas do Castelo
            cw.stars.forEach((pt, i) => {
                const star = this.add.image(pt.x, pt.y, "decor_star")
                    .setScale(0.58)
                    .setDepth(5 + pt.y / 1000);
                this.tweens.add({
                    targets: star,
                    y: pt.y - 8,
                    scale: 0.66,
                    duration: 900 + (i % 5) * 110,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut"
                });
                this.castleStars.push({ sprite: star, x: pt.x, y: pt.y, collected: false });
            });

            // Poções internas
            cw.potions.forEach((p) => {
                const glow = this.add.image(p.x, p.y, "soft_glow")
                    .setTint(0xffe066).setScale(0.55).setAlpha(0.58).setDepth(4.8 + p.y / 1000);
                const vial = this.add.image(p.x, p.y, "decor_potion")
                    .setScale(0.58).setDepth(5 + p.y / 1000);
                this.tweens.add({ targets: [vial, glow], y: p.y - 9, duration: 950, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
                this.castlePotions.push({ sprite: vial, glow, x: p.x, y: p.y, collected: false });
            });

            // 4 Alas do Castelo (Quizzes Bônus, Pergaminhos Secretos e Pontos de Exploração)
            cw.wings.forEach((wing) => {
                if (wing.quiz) {
                    const q = wing.quiz;
                    const glow = this.add.image(q.x, q.y, "soft_glow")
                        .setTint(0xffe066).setScale(0.85, 0.45).setAlpha(0.58).setDepth(4.5 + q.y / 1000);
                    const prop = this.add.image(q.x, q.y - 8, q.propKey)
                        .setOrigin(0.5, 0.85).setScale(0.42).setDepth(5 + q.y / 1000);
                    const marker = this.add.text(q.x, q.y - 68, `★ Quiz Bônus • ${q.location}`, {
                        fontFamily: "Cinzel, serif", fontSize: "15px", fontStyle: "bold",
                        color: "#ffe680", backgroundColor: "rgba(13, 43, 29, 0.9)", padding: { x: 9, y: 4 }
                    }).setOrigin(0.5).setDepth(12);
                    this.tweens.add({ targets: [prop, marker], y: "-=7", duration: 1050, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
                    this.castleCheckpoints.push({ quiz: q, isBonus: true, x: q.x, y: q.y, prop, glow, marker, solved: false });
                }

                if (wing.secretNote) {
                    const n = wing.secretNote;
                    const nglow = this.add.image(n.x, n.y, "soft_glow")
                        .setTint(0xffe680).setScale(0.55).setAlpha(0.65).setDepth(4.6 + n.y / 1000);
                    const nicon = this.add.text(n.x, n.y, "💌", { fontSize: "26px" })
                        .setOrigin(0.5).setDepth(5.2 + n.y / 1000);
                    this.tweens.add({ targets: [nicon, nglow], y: "-=9", duration: 920, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
                    this.castleInteractables.push({
                        type: "castle_note",
                        noteId: n.id,
                        x: n.x,
                        y: n.y,
                        sprite: nicon,
                        glow: nglow,
                        label: "💌 Ler Pergaminho Secreto",
                        data: n,
                        done: false
                    });
                }

                if (wing.exploreSpot) {
                    const s = wing.exploreSpot;
                    const badge = this.add.text(s.x, s.y - 26, s.label, {
                        fontFamily: "Nunito, sans-serif", fontSize: "13px", fontStyle: "bold",
                        color: "#fff5d6", backgroundColor: "rgba(18, 36, 46, 0.86)", padding: { x: 8, y: 4 }
                    }).setOrigin(0.5).setDepth(11.5);
                    this.tweens.add({ targets: badge, y: s.y - 32, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
                    this.castleInteractables.push({
                        type: "spot",
                        x: s.x,
                        y: s.y,
                        sprite: badge,
                        label: `✨ ${s.label}`,
                        data: s,
                        done: false
                    });
                }
            });

            // Portal de Saída (volta para o Vale de Hogwarts!)
            const ex = cw.exitPortalPos.x;
            const ey = cw.exitPortalPos.y;
            const eglow = this.add.image(ex, ey, "soft_glow")
                .setTint(0x52f29b).setScale(1.2, 0.55).setAlpha(0.75).setDepth(4.4);
            const elabel = this.add.text(ex, ey - 36, "🌍 Voltar ao Vale de Hogwarts", {
                fontFamily: "Cinzel, serif", fontSize: "14px", fontStyle: "bold",
                color: "#9effca", backgroundColor: "rgba(13, 43, 29, 0.9)", padding: { x: 10, y: 4 }
            }).setOrigin(0.5).setDepth(12);
            this.tweens.add({ targets: [eglow, elabel], y: "-=6", duration: 1000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
            this.castleInteractables.push({
                type: "exit_castle",
                x: ex,
                y: ey,
                label: "🌍 Voltar ao Vale de Hogwarts",
                done: false
            });

            // Efeitos de fogo animado nas velas e arandelas do Castelo
            this.castleFlames = [];
            const flameSpots = [
                // Mesas de banquete + mesa principal do Salão Principal
                { x: 1068, y: 292, s: 0.44 }, { x: 1044, y: 405, s: 0.46 },
                { x: 1492, y: 292, s: 0.44 }, { x: 1516, y: 405, s: 0.46 },
                { x: 1188, y: 152, s: 0.40 }, { x: 1372, y: 152, s: 0.40 },
                // Arandelas laterais do Salão Principal e Corredores
                { x: 966, y: 220, s: 0.38 }, { x: 924, y: 392, s: 0.38 },
                { x: 1594, y: 220, s: 0.38 }, { x: 1636, y: 392, s: 0.38 },
                { x: 1200, y: 615, s: 0.45 }, { x: 1360, y: 615, s: 0.45 },
                { x: 1200, y: 765, s: 0.45 }, { x: 1360, y: 765, s: 0.45 },
                // Lanternas da Biblioteca e Corredores
                { x: 775, y: 775, s: 0.44 }, { x: 1785, y: 775, s: 0.44 },
                { x: 338, y: 315, s: 0.40 }, { x: 520, y: 375, s: 0.40 },
                { x: 248, y: 600, s: 0.40 }, { x: 505, y: 820, s: 0.40 },
                // Torre de Astronomia
                { x: 1185, y: 995, s: 0.40 }, { x: 1375, y: 995, s: 0.40 },
                { x: 1175, y: 1355, s: 0.42 }, { x: 1385, y: 1355, s: 0.42 }
            ];
            flameSpots.forEach((f, idx) => {
                const glow = this.add.image(f.x, f.y, "soft_glow")
                    .setTint(0xffb84d)
                    .setScale(f.s * 1.1)
                    .setAlpha(0.55)
                    .setDepth(11.7);
                const core = this.add.image(f.x, f.y - 3, "sparkle_dot")
                    .setTint(0xfff1a8)
                    .setScale(f.s * 0.85)
                    .setAlpha(0.92)
                    .setDepth(11.8);
                this.castleFlames.push({ glow, core, x: f.x, y: f.y, s: f.s, phase: idx * 1.37 });
            });

            // Caldeirões borbulhando nas Masmorras de Poções
            this.castleCauldrons = [
                { x: 2052, y: 425, r: 30 },
                { x: 2248, y: 425, r: 30 },
                { x: 2048, y: 855, r: 18 }
            ];
            this.cauldronBubbleTimer = 0;
            this.castleCauldrons.forEach((c, idx) => {
                const cglow = this.add.image(c.x, c.y + 4, "soft_glow")
                    .setTint(0x38ff8c)
                    .setScale(c.r > 20 ? 0.95 : 0.55)
                    .setAlpha(0.62)
                    .setDepth(11.6);
                c.glow = cglow;
                c.phase = idx * 2.1;
            });

            // Convidados especiais sentados nas cadeiras verdes da mesa principal do Salão Principal (com a mesa por CIMA!)
            if (cw.seatedGuests) {
                cw.seatedGuests.forEach((g, idx) => {
                    const npc = this.add.image(g.x, g.y, g.spriteKey)
                        .setOrigin(0.5, 1)
                        .setScale(0.36)
                        .setDepth(4.85);
                    this.tweens.add({
                        targets: npc,
                        scaleY: 0.372,
                        y: g.y - 1.5,
                        duration: 1200 + idx * 220,
                        yoyo: true,
                        repeat: -1,
                        ease: "Sine.easeInOut"
                    });
                    const tag = this.add.text(g.x, g.y - 74, `💚 ${g.name}`, {
                        fontFamily: "Cinzel, serif",
                        fontSize: "12px",
                        fontStyle: "bold",
                        color: "#fff5d6",
                        backgroundColor: "rgba(13, 43, 29, 0.88)",
                        padding: { x: 7, y: 3 }
                    }).setOrigin(0.5).setDepth(12);
                    this.tweens.add({
                        targets: tag,
                        y: g.y - 77,
                        duration: 1200 + idx * 220,
                        yoyo: true,
                        repeat: -1,
                        ease: "Sine.easeInOut"
                    });
                    this.castleInteractables.push({
                        type: "spot",
                        x: g.interactX,
                        y: g.interactY,
                        sprite: npc,
                        label: g.label,
                        data: { title: g.title, text: g.text },
                        done: false
                    });
                });

                // Mesa principal de madeira renderizada POR CIMA da cintura/pernas dos convidados!
                this.add.image(1152, 140, "castle_high_table_overlay")
                    .setOrigin(0, 0)
                    .setDisplaySize(256, 64)
                    .setDepth(5.0);
            }
        }

        buildHogsmeadeWorldContent() {
            const hw = DATA.hogsmeadeWorld;
            this.hogsmeadeStars = [];
            this.hogsmeadePotions = [];
            this.hogsmeadeCheckpoints = [];
            this.hogsmeadeInteractables = [];
            this.trainSteamTimer = 0;

            // Estrelas em Hogsmeade
            hw.stars.forEach((pt, i) => {
                const star = this.add.image(pt.x, pt.y, "decor_star")
                    .setScale(0.58)
                    .setDepth(5 + pt.y / 1000);
                this.tweens.add({
                    targets: star, y: pt.y - 8, scale: 0.66,
                    duration: 900 + (i % 5) * 110, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
                });
                this.hogsmeadeStars.push({ sprite: star, x: pt.x, y: pt.y, collected: false });
            });

            // Poção extra
            hw.potions.forEach((p) => {
                const glow = this.add.image(p.x, p.y, "soft_glow")
                    .setTint(0xffe066).setScale(0.55).setAlpha(0.58).setDepth(4.8 + p.y / 1000);
                const vial = this.add.image(p.x, p.y, "decor_potion")
                    .setScale(0.58).setDepth(5 + p.y / 1000);
                this.tweens.add({ targets: [vial, glow], y: p.y - 9, duration: 950, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
                this.hogsmeadePotions.push({ sprite: vial, glow, x: p.x, y: p.y, collected: false });
            });

            // 3 Zonas de Hogsmeade
            hw.zones.forEach((zone) => {
                if (zone.quiz) {
                    const q = zone.quiz;
                    const glow = this.add.image(q.x, q.y, "soft_glow")
                        .setTint(0xffe066).setScale(0.85, 0.45).setAlpha(0.58).setDepth(4.5 + q.y / 1000);
                    const prop = this.add.image(q.x, q.y - 8, q.propKey)
                        .setOrigin(0.5, 0.85).setScale(0.42).setDepth(5 + q.y / 1000);
                    const marker = this.add.text(q.x, q.y - 68, `★ Quiz Bônus • ${q.location}`, {
                        fontFamily: "Cinzel, serif", fontSize: "15px", fontStyle: "bold",
                        color: "#ffe680", backgroundColor: "rgba(13, 43, 29, 0.9)", padding: { x: 9, y: 4 }
                    }).setOrigin(0.5).setDepth(12);
                    this.tweens.add({ targets: [prop, marker], y: "-=7", duration: 1050, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
                    this.hogsmeadeCheckpoints.push({ quiz: q, isBonus: true, x: q.x, y: q.y, prop, glow, marker, solved: false });
                }

                if (zone.secretNote) {
                    const n = zone.secretNote;
                    const nglow = this.add.image(n.x, n.y, "soft_glow")
                        .setTint(0xffe680).setScale(0.55).setAlpha(0.65).setDepth(4.6 + n.y / 1000);
                    const nicon = this.add.text(n.x, n.y, "💌", { fontSize: "26px" })
                        .setOrigin(0.5).setDepth(5.2 + n.y / 1000);
                    this.tweens.add({ targets: [nicon, nglow], y: "-=9", duration: 920, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
                    this.hogsmeadeInteractables.push({
                        type: "castle_note", noteId: n.id, x: n.x, y: n.y,
                        sprite: nicon, glow: nglow, label: "💌 Ler Bilhete Secreto", data: n, done: false
                    });
                }

                if (zone.exploreSpot) {
                    const s = zone.exploreSpot;
                    const badge = this.add.text(s.x, s.y - 26, s.label, {
                        fontFamily: "Nunito, sans-serif", fontSize: "13px", fontStyle: "bold",
                        color: "#fff5d6", backgroundColor: "rgba(18, 36, 46, 0.86)", padding: { x: 8, y: 4 }
                    }).setOrigin(0.5).setDepth(11.5);
                    this.tweens.add({ targets: badge, y: s.y - 32, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
                    this.hogsmeadeInteractables.push({
                        type: "spot", x: s.x, y: s.y, sprite: badge, label: `✨ ${s.label}`, data: s, done: false
                    });
                }
            });

            // Portal Norte de Volta ao Vale de Hogwarts!
            const nx = hw.northPortalPos.x;
            const ny = hw.northPortalPos.y;
            const nglow = this.add.image(nx, ny, "soft_glow")
                .setTint(0x52f29b).setScale(1.2, 0.5).setAlpha(0.7).setDepth(4.4);
            const nlabel = this.add.text(nx, ny - 26, "⬆ Voltar ao Vale de Hogwarts", {
                fontFamily: "Cinzel, serif", fontSize: "14px", fontStyle: "bold",
                color: "#9effca", backgroundColor: "rgba(13, 43, 29, 0.9)", padding: { x: 10, y: 4 }
            }).setOrigin(0.5).setDepth(12);
            this.tweens.add({ targets: [nglow, nlabel], y: "-=6", duration: 1000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
            this.hogsmeadeInteractables.push({
                type: "exit_hogsmeade", x: nx, y: ny, label: "⬆ Voltar ao Vale de Hogwarts", done: false
            });

            // Portas para Interiores (Dedosdemel, Três Vassouras, Cabana do Hagrid) e Estufas de Herbologia!
            if (hw.doors) {
                hw.doors.forEach((d) => {
                    const dglow = this.add.image(d.x, d.y, "soft_glow")
                        .setTint(0xffe484).setScale(0.75, 0.4).setAlpha(0.65).setDepth(4.5);
                    const dlabel = this.add.text(d.x, d.y - 26, d.label, {
                        fontFamily: "Cinzel, serif", fontSize: "13px", fontStyle: "bold",
                        color: "#fff5d6", backgroundColor: "rgba(13, 43, 29, 0.9)", padding: { x: 8, y: 3 }
                    }).setOrigin(0.5).setDepth(12);
                    this.tweens.add({ targets: [dglow, dlabel], y: "-=5", duration: 1000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
                    this.hogsmeadeInteractables.push({
                        type: "enter_room", targetRoom: d.targetRoom, x: d.x, y: d.y, label: d.label, done: false
                    });
                });
            }
        }

        clearRoomObjects() {
            this.roomObjects.forEach((o) => o && o.destroy && o.destroy());
            this.roomObjects = [];
            this.roomStars = [];
            this.roomInteractables = [];
            this.roomFlames = [];
            this.roomCauldrons = [];
        }

        buildRoomContent(roomKey) {
            this.clearRoomObjects();
            const room = DATA.rooms[roomKey];
            if (!room) return;
            const track = (obj) => { this.roomObjects.push(obj); return obj; };

            // Estrelas da sala
            (room.stars || []).forEach((pt, i) => {
                const sid = `${roomKey}_${i}`;
                if (this.collectedRoomStars.has(sid)) return;
                const star = track(this.add.image(pt.x, pt.y, "decor_star").setScale(0.58).setDepth(5 + pt.y / 1000));
                this.tweens.add({ targets: star, y: pt.y - 8, scale: 0.66, duration: 900 + i * 90, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
                this.roomStars.push({ id: sid, sprite: star, x: pt.x, y: pt.y, collected: false });
            });

            // Pontos de exploração
            (room.exploreSpots || []).forEach((s) => {
                const badge = track(this.add.text(s.x, s.y - 26, s.label, {
                    fontFamily: "Nunito, sans-serif", fontSize: "13px", fontStyle: "bold",
                    color: "#fff5d6", backgroundColor: "rgba(18, 36, 46, 0.88)", padding: { x: 8, y: 4 }
                }).setOrigin(0.5).setDepth(11.5));
                this.tweens.add({ targets: badge, y: s.y - 32, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
                this.roomInteractables.push({ type: "spot", x: s.x, y: s.y, label: `✨ ${s.label}`, data: s, done: false });
            });

            // Porta de saída
            if (room.exitPortal) {
                const ep = room.exitPortal;
                const eg = track(this.add.image(ep.x, ep.y, "soft_glow").setTint(0x52f29b).setScale(1.1, 0.48).setAlpha(0.7).setDepth(4.4));
                const el = track(this.add.text(ep.x, ep.y - 28, ep.label, {
                    fontFamily: "Cinzel, serif", fontSize: "14px", fontStyle: "bold",
                    color: "#9effca", backgroundColor: "rgba(13, 43, 29, 0.9)", padding: { x: 10, y: 4 }
                }).setOrigin(0.5).setDepth(12));
                this.tweens.add({ targets: [eg, el], y: "-=6", duration: 1000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
                this.roomInteractables.push({
                    type: "exit_room", x: ep.x, y: ep.y, label: ep.label,
                    returnWorld: ep.returnWorld, returnPos: ep.returnPos, done: false
                });
            }

            // Chamas vivas (lareiras, velas, braseiros)
            (room.flames || []).forEach((f, idx) => {
                const glow = track(this.add.image(f.x, f.y, "soft_glow").setTint(0xffb84d).setScale(f.s * 1.15).setAlpha(0.58).setDepth(11.7));
                const core = track(this.add.image(f.x, f.y - 3, "sparkle_dot").setTint(0xfff1a8).setScale(f.s * 0.85).setAlpha(0.92).setDepth(11.8));
                this.roomFlames.push({ glow, core, x: f.x, y: f.y, s: f.s, phase: idx * 1.41 });
            });

            // Caldeirão borbulhando (ex.: Cabana do Hagrid)
            (room.cauldrons || []).forEach((c, idx) => {
                const cglow = track(this.add.image(c.x, c.y + 4, "soft_glow").setTint(0x38ff8c).setScale(0.9).setAlpha(0.6).setDepth(11.6));
                this.roomCauldrons.push({ x: c.x, y: c.y, r: c.r, glow: cglow, phase: idx * 1.9 });
            });
        }

        setWorldVisibility(world) {
            const isValley = world === "valley";
            const isCastle = world === "castle";
            const isHogsmeade = world === "hogsmeade";
            this.valleyObjects.forEach((o) => {
                if (o && o.setVisible) o.setVisible(isValley && !o._worldHidden);
            });
            this.castleObjects.forEach((o) => {
                if (o && o.setVisible) o.setVisible(isCastle && !o._worldHidden);
            });
            this.hogsmeadeObjects.forEach((o) => {
                if (o && o.setVisible) o.setVisible(isHogsmeade && !o._worldHidden);
            });
            const isRoomOutdoor = DATA.rooms[world] && DATA.rooms[world].isOutdoor;
            if (this.isacBg) this.isacBg.setVisible((isValley || isHogsmeade || isRoomOutdoor) && !this.finaleDone);
            if (!isValley) {
                this.darknessOverlay.setAlpha(0);
                UI.btnLumos.classList.add("hidden");
            }
        }

        switchWorld(targetWorld, spawnPos, bannerMsg) {
            SoundFX.playSpellCast();
            this.velX = 0;
            this.velY = 0;
            InputState.pointerWalk = false;
            this.isFlying = false;
            this.flyAlt = 0;
            const roomCfg = DATA.rooms[targetWorld];
            const canFlyHere = targetWorld === "valley" || targetWorld === "hogsmeade" || (roomCfg && roomCfg.isOutdoor);
            if (UI.btnFly) {
                UI.btnFly.classList.remove("flying");
                UI.btnFly.textContent = "🧹 Voar";
                UI.btnFly.classList.toggle("hidden", !this.hasBroom || !canFlyHere);
            }
            this.flyAura.setAlpha(0);

            this.cameras.main.fadeOut(280, 7, 10, 20);
            this.cameras.main.once("camerafadeoutcomplete", () => {
                this.activeWorld = targetWorld;
                const musicZone = roomCfg ? roomCfg.musicWorld : (targetWorld === "castle" ? "castle" : "valley");
                if (window.MagicMusic) window.MagicMusic.setWorld(musicZone);
                this.clearRoomObjects();
                if (roomCfg) {
                    this.mapBg.setTexture(roomCfg.bgKey).setDisplaySize(WORLD_W, WORLD_H);
                    this.buildRoomContent(targetWorld);
                } else if (targetWorld === "castle") {
                    this.castleUnlocked = true;
                    this.mapBg.setTexture(DATA.castleWorld.bgKey).setDisplaySize(WORLD_W, WORLD_H);
                } else if (targetWorld === "hogsmeade") {
                    this.mapBg.setTexture(DATA.hogsmeadeWorld.bgKey).setDisplaySize(WORLD_W, WORLD_H);
                } else {
                    this.mapBg.setTexture("overworld_map").setDisplaySize(WORLD_W, WORLD_H);
                }
                this.setWorldVisibility(targetWorld);
                this.player.setPosition(spawnPos.x, spawnPos.y);
                this.kitten.setPosition(spawnPos.x - 62, spawnPos.y + 8);
                this.updateCurrentRegion(true);
                this.cameras.main.fadeIn(320, 7, 10, 20);
                this.burstMagic(spawnPos.x, spawnPos.y - 26, 26);
                if (bannerMsg) UI.showBanner(bannerMsg, 3400);
                this.state = "WALKING";
            });
        }

        toggleFly() {
            if (!this.hasBroom || this.state !== "WALKING") return;
            const roomCfg = DATA.rooms[this.activeWorld];
            if (this.activeWorld === "castle" || (roomCfg && !roomCfg.isOutdoor)) {
                UI.showBanner("🏠 Não é permitido voar em ambientes fechados!", 2200);
                return;
            }
            if (!this.isFlying) {
                this.isFlying = true;
                SoundFX.playSpellCast();
                this.burstMagic(this.player.x, this.player.y - 20, 22);
                if (UI.btnFly) {
                    UI.btnFly.classList.add("flying");
                    UI.btnFly.textContent = "⬇️ Pousar";
                }
                UI.showBanner("🧹 Voando! Suba até a 🏰 Torre do Castelo de Hogwarts!", 3000);
            } else {
                if (this.isBlockedOnGround(this.player.x, this.player.y)) {
                    SoundFX.playWrong();
                    UI.showBanner("🌿 Voe para uma estrada ou espaço aberto para pousar!", 2200);
                    return;
                }
                this.isFlying = false;
                SoundFX.playCollect();
                this.burstMagic(this.player.x, this.player.y, 14);
                if (UI.btnFly) {
                    UI.btnFly.classList.remove("flying");
                    UI.btnFly.textContent = "🧹 Voar";
                }
            }
        }

        applyResponsiveCamera(screenW, screenH) {
            const cam = this.cameras.main;
            const zoom = Phaser.Math.Clamp(Math.min(screenW / 980, screenH / 580), 0.58, 1.32);
            cam.setZoom(zoom);
        }

        startJourney() {
            this.state = "WALKING";
            UI.hud.classList.remove("hidden");
            UI.controlsBar.classList.remove("hidden");
            UI.showBanner("✨ Mundo Aberto! Explore o vale em todas as direções!", 3600);
            this.burstMagic(this.player.x, this.player.y - 36, 18);
        }

        resetJourney() {
            this.scene.restart();
            setTimeout(() => {
                if (window.__heloraScene) {
                    window.__heloraScene.startJourney();
                }
            }, 120);
        }

        addHousePoints(amount, x, y) {
            const mult = this.felixTimer > 0 ? 2 : 1;
            const total = amount * mult;
            this.housePoints += total;
            UI.updatePoints(this.housePoints);

            const txt = this.add.text(x, y - 34, mult > 1 ? `+${total} pts (2x!)` : `+${total} pts`, {
                fontFamily: "Cinzel, serif",
                fontSize: "16px",
                fontStyle: "bold",
                color: mult > 1 ? "#fff2a6" : "#7affb2",
                stroke: "#091f14",
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(15);

            this.tweens.add({
                targets: txt,
                y: y - 78,
                alpha: 0,
                duration: 950,
                ease: "Cubic.easeOut",
                onComplete: () => txt.destroy()
            });
        }

        burstMagic(x, y, count = 16) {
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + Math.random() * 0.35;
                const dist = Phaser.Math.Between(22, 68);
                const sp = this.add.image(x, y, "sparkle_dot")
                    .setTint(i % 2 === 0 ? 0xffe484 : 0x52f29b)
                    .setScale(Phaser.Math.FloatBetween(0.28, 0.62))
                    .setDepth(14.5);
                this.tweens.add({
                    targets: sp,
                    x: x + Math.cos(angle) * dist,
                    y: y + Math.sin(angle) * dist,
                    alpha: 0,
                    scale: 0.08,
                    duration: Phaser.Math.Between(360, 680),
                    ease: "Cubic.easeOut",
                    onComplete: () => sp.destroy()
                });
            }
        }

        petKitten() {
            if (this.state !== "WALKING") return;
            const now = this.time.now;
            if (now - this.lastPetTime < 900) return;
            this.lastPetTime = now;
            SoundFX.unlock();
            SoundFX.playMeow();
            this.burstMagic(this.kitten.x, this.kitten.y - 24, 10);
            this.addHousePoints(5, this.kitten.x, this.kitten.y - 16);

            const heart = this.add.text(this.kitten.x, this.kitten.y - 44, "💛", { fontSize: "20px" })
                .setOrigin(0.5).setDepth(15);
            this.tweens.add({
                targets: heart,
                y: heart.y - 36,
                alpha: 0,
                scale: 1.35,
                duration: 850,
                ease: "Cubic.easeOut",
                onComplete: () => heart.destroy()
            });
            this.tweens.add({
                targets: this.kitten,
                y: this.kitten.y - 14,
                duration: 150,
                yoyo: true,
                ease: "Quad.easeOut"
            });
        }

        openMarauderMap() {
            if (this.state !== "WALKING") return;
            this.state = "MODAL";
            this.velX = 0;
            this.velY = 0;
            InputState.pointerWalk = false;
            UI.showMarauderMap(this);
        }

        fastTravelTo(region, targetWorld = "valley") {
            if (targetWorld !== this.activeWorld) {
                this.switchWorld(targetWorld, region.travelPos, `🗺️ Chegou em ${region.location}!`);
                return;
            }
            SoundFX.playSpellCast();
            this.burstMagic(this.player.x, this.player.y - 30, 18);
            this.player.setPosition(region.travelPos.x, region.travelPos.y);
            this.kitten.setPosition(region.travelPos.x - 60, region.travelPos.y + 10);
            this.velX = 0;
            this.velY = 0;
            this.state = "WALKING";
            this.burstMagic(this.player.x, this.player.y - 30, 22);
            this.updateCurrentRegion(true);
            UI.showBanner(`🗺️ Chegou em ${region.location}!`, 2200);
        }

        interactWithNearby() {
            if (this.state !== "WALKING" || !this.activeInteractable) return;
            const item = this.activeInteractable;
            UI.btnExplore.classList.add("hidden");

            if (item.type === "enter_castle") {
                this.state = "MODAL";
                this.switchWorld("castle", DATA.castleWorld.startPos, "🏰 Bem-vinda ao Interior do Castelo de Hogwarts!");
                return;
            }
            if (item.type === "exit_castle") {
                this.state = "MODAL";
                this.switchWorld("valley", { x: 1280, y: 690 }, "🌍 De volta ao Vale de Hogwarts!");
                return;
            }
            if (item.type === "enter_hogsmeade") {
                this.state = "MODAL";
                this.switchWorld("hogsmeade", DATA.hogsmeadeWorld.startPos, "🏘️ Bem-vinda à Vila de Hogsmeade & Expresso!");
                return;
            }
            if (item.type === "exit_hogsmeade") {
                this.state = "MODAL";
                this.switchWorld("valley", { x: 1280, y: 1275 }, "🌍 De volta ao Vale de Hogwarts!");
                return;
            }
            if (item.type === "enter_room") {
                const rm = DATA.rooms[item.targetRoom];
                if (rm) {
                    this.state = "MODAL";
                    this.switchWorld(item.targetRoom, rm.startPos, rm.title);
                }
                return;
            }
            if (item.type === "exit_room") {
                this.state = "MODAL";
                this.switchWorld(item.returnWorld, item.returnPos, "🏘️ De volta à Vila de Hogsmeade!");
                return;
            }

            this.state = "MODAL";
            this.velX = 0;
            this.velY = 0;
            InputState.pointerWalk = false;

            if (item.type === "note" || item.type === "castle_note") {
                if (!item.done) {
                    item.done = true;
                    if (item.type === "note") {
                        this.foundNotes.add(item.regionId);
                        UI.updateNotes(this.foundNotes.size);
                    }
                    item.sprite._worldHidden = true;
                    item.sprite.setVisible(false);
                    if (item.glow) {
                        item.glow._worldHidden = true;
                        item.glow.setVisible(false);
                    }
                    this.burstMagic(item.x, item.y, 20);
                    this.addHousePoints(30, item.x, item.y);
                }
                UI.showNoteModal("💌", item.data.title, item.data.text, () => {
                    this.state = "WALKING";
                });
            } else {
                UI.showNoteModal("✨", item.data.title, item.data.text, () => {
                    this.state = "WALKING";
                });
            }
        }

        castLumos() {
            if (!this.lumosActive || this.lumosSolved) return;
            this.lumosSolved = true;
            this.lumosActive = false;
            SoundFX.playLumos();
            UI.btnLumos.classList.add("hidden");

            const flash = this.add.image(this.player.x, this.player.y - 42, "soft_glow")
                .setTint(0xfff6c2)
                .setScale(0.6)
                .setAlpha(0.95)
                .setDepth(15);
            this.tweens.add({
                targets: flash,
                scale: 9,
                alpha: 0,
                duration: 750,
                ease: "Cubic.easeOut",
                onComplete: () => flash.destroy()
            });

            this.tweens.add({ targets: this.darknessOverlay, alpha: 0, duration: 600 });

            // Revelar 3 estrelas secretas da Floresta Proibida
            this.collectibleStars.forEach((st) => {
                if (st.secret && !st.collected) {
                    st.sprite._worldHidden = false;
                    st.sprite.setVisible(true);
                    this.tweens.add({ targets: st.sprite, alpha: 1, duration: 450 });
                }
            });

            this.burstMagic(this.player.x, this.player.y - 36, 26);
            this.addHousePoints(40, this.player.x, this.player.y - 30);
            UI.showBanner("✨ Lumos Maxima! Estrelas secretas reveladas! +40 pts!", 2800);
        }

        startSnitchHunt(zone) {
            this.state = "SNITCH_HUNT";
            this.snitchHits = 0;
            this.velX = 0;
            this.velY = 0;
            InputState.pointerWalk = false;
            this.player.anims.stop();
            this.player.setTexture("helora_idle");

            UI.showBanner("🏆 Caça ao Pomo de Ouro! Toque no Pomo 3 vezes! (0/3)");

            this.huntSnitch = this.add.image(zone.x + 80, zone.y - 70, "prop_snitch")
                .setScale(0.36)
                .setDepth(15)
                .setInteractive({ useHandCursor: true });

            const hopSnitch = () => {
                if (!this.huntSnitch || !this.huntSnitch.active) return;
                const nx = Phaser.Math.Clamp(zone.x + Phaser.Math.Between(-150, 150), 1820, 2400);
                const ny = Phaser.Math.Clamp(zone.y + Phaser.Math.Between(-120, 90), 250, 560);
                this.tweens.add({
                    targets: this.huntSnitch,
                    x: nx,
                    y: ny,
                    duration: 760,
                    ease: "Sine.easeInOut",
                    onComplete: () => {
                        if (this.state === "SNITCH_HUNT") hopSnitch();
                    }
                });
            };
            hopSnitch();

            this.huntSnitch.on("pointerdown", () => {
                if (this.state !== "SNITCH_HUNT") return;
                SoundFX.unlock();
                SoundFX.playCollect();
                this.snitchHits += 1;
                this.burstMagic(this.huntSnitch.x, this.huntSnitch.y, 16);
                if (this.snitchHits < 3) {
                    UI.showBanner(`🏆 Muito bem! Pegue o Pomo de Ouro! (${this.snitchHits}/3)`);
                } else {
                    this.snitchSolved = true;
                    const sx = this.huntSnitch.x;
                    const sy = this.huntSnitch.y;
                    this.huntSnitch.destroy();
                    this.huntSnitch = null;
                    SoundFX.playChime();
                    this.burstMagic(sx, sy, 32);
                    this.addHousePoints(75, sx, sy);
                    UI.showBanner("🏆 Pomo de Ouro capturado! +75 pts Sonserina!", 2800);
                    this.state = "WALKING";
                }
            });
        }

        triggerQuiz(cp) {
            this.state = "QUIZ";
            this.velX = 0;
            this.velY = 0;
            InputState.pointerWalk = false;
            this.player.anims.stop();
            this.player.setTexture("helora_idle");

            UI.showQuiz(cp.quiz, () => {
                cp.solved = true;
                if (cp.isBonus) {
                    this.bonusSolvedIds.add(cp.quiz.id);
                    cp.marker.setText(`✓ ${cp.quiz.location}`);
                    cp.marker.setColor("#7affb2");
                    cp.glow.setTint(0xffe484).setAlpha(0.32);
                    this.addHousePoints(75, this.player.x, this.player.y - 36);
                    this.burstMagic(this.player.x, this.player.y - 36, 28);
                } else {
                    this.solvedIds.add(cp.quiz.id);
                    cp.marker.setText(`✓ ${cp.quiz.location}`);
                    cp.marker.setColor("#7affb2");
                    cp.glow.setTint(0xffe484).setAlpha(0.32);

                    this.addHousePoints(50, this.player.x, this.player.y - 36);
                    this.burstMagic(this.player.x, this.player.y - 36, 26);

                    const solvedCount = this.solvedIds.size;
                    UI.updateProgress(solvedCount, DATA.quizzes[this.currentRegionIdx].location);

                    if (solvedCount >= DATA.quizzes.length) {
                        this.finaleLabel.setText("🎂 Pátio da Surpresa • ENTRE AQUI! ✨");
                        this.finaleLabel.setColor("#fff2a6");
                        this.finaleGlow.setAlpha(0.85);
                        UI.showBanner("✨ Todos os 5 quizzes resolvidos! Vá ao Pátio de Hogwarts! 🎂", 5000);
                    } else {
                        this.finaleLabel.setText(`🎂 Pátio da Surpresa (${solvedCount}/5 quizzes)`);
                    }
                }

                this.state = "CELEBRATE";
                this.player.setTexture("helora_celebrate");
                this.tweens.add({
                    targets: this.player,
                    y: this.player.y - 16,
                    duration: 180,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        this.player.setTexture("helora_idle");
                        this.state = "WALKING";
                    }
                });
            });
        }

        triggerFinale() {
            this.state = "FINALE";
            this.finaleDone = true;
            this.velX = 0;
            this.velY = 0;
            InputState.pointerWalk = false;
            UI.controlsBar.classList.add("hidden");
            UI.hideBanner();
            this.finaleLabel.setVisible(false);

            if (window.MagicMusic) window.MagicMusic.setDucked(true);
            this.isacBg.setVisible(false);

            const fx = DATA.finalePos.x;
            const fy = DATA.finalePos.y;
            const cakeX = fx;
            const cakeY = fy - 12;

            // Posicionar Helora e Gatinho no pátio olhando para o centro
            this.player.anims.stop();
            this.player.setTexture("helora_celebrate").setFlipX(false);
            this.tweens.add({ targets: [this.player, this.playerShadow], x: fx - 72, y: fy + 10, duration: 550, ease: "Sine.easeOut" });
            this.kitten.anims.stop();
            this.kitten.setTexture("kitten_idle").setFlipX(false);
            this.tweens.add({ targets: [this.kitten, this.kittenShadow], x: fx - 126, y: fy + 16, duration: 550, ease: "Sine.easeOut" });

            this.cameras.main.stopFollow();
            this.cameras.main.pan(fx, fy - 24, 900, "Sine.easeInOut");

            // Isac desce voando de vassoura no Pátio de Hogwarts!
            this.isacHero = this.add.image(fx + 380, fy - 240, "isac_broom")
                .setScale(0.42)
                .setFlipX(true)
                .setDepth(14);

            this.tweens.add({
                targets: this.isacHero,
                x: fx + 95,
                y: fy - 95,
                duration: 1500,
                ease: "Cubic.easeOut",
                onComplete: () => {
                    this.tweens.add({
                        targets: this.isacHero,
                        y: this.isacHero.y - 10,
                        duration: 900,
                        yoyo: true,
                        repeat: -1,
                        ease: "Sine.easeInOut"
                    });

                    // Fala do Isac
                    UI.isacText.textContent = DATA.brother.greeting;
                    UI.isacBubble.classList.remove("hidden");
                    SoundFX.playPopup();

                    // Feitiço mágico do Isac materializa o Bolo Invisível!
                    this.time.delayedCall(1500, () => {
                        SoundFX.playSpellCast();
                        const orb = this.add.image(this.isacHero.x - 24, this.isacHero.y + 8, "sparkle_dot")
                            .setTint(0x52f29b).setScale(1.1).setDepth(15);
                        this.tweens.add({
                            targets: orb,
                            x: cakeX,
                            y: cakeY - 20,
                            duration: 550,
                            ease: "Quad.easeIn",
                            onComplete: () => {
                                orb.destroy();
                                SoundFX.playCakeAppear();
                                this.burstMagic(cakeX, cakeY - 18, 38);
                                this.tweens.add({
                                    targets: this.cakeSprite,
                                    alpha: 1,
                                    scale: 0.44,
                                    duration: 750,
                                    ease: "Back.easeOut"
                                });

                                // Isac sobe voando e abre o Envelope de Aniversário
                                this.time.delayedCall(2100, () => {
                                    UI.isacBubble.classList.add("hidden");
                                    this.tweens.add({
                                        targets: this.isacHero,
                                        x: fx - 440,
                                        y: fy - 280,
                                        alpha: 0,
                                        duration: 1500,
                                        ease: "Cubic.easeIn",
                                        onComplete: () => {
                                            if (this.isacHero) this.isacHero.destroy();
                                            this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
                                            UI.showEnvelope(this.housePoints, () => {
                                                if (window.MagicMusic) window.MagicMusic.setDucked(false);
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    });
                }
            });
        }

        updateCurrentRegion(force = false) {
            if (DATA.rooms[this.activeWorld]) {
                if (force) UI.updateProgress(this.solvedIds.size, DATA.rooms[this.activeWorld].title);
                return;
            }
            if (this.activeWorld === "castle") {
                let bestIdx = 0;
                let bestDist = Infinity;
                DATA.castleWorld.wings.forEach((w, idx) => {
                    const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, w.regionCenter.x, w.regionCenter.y);
                    if (d < bestDist) {
                        bestDist = d;
                        bestIdx = idx;
                    }
                });
                if (force || bestIdx !== this.currentCastleWingIdx) {
                    this.currentCastleWingIdx = bestIdx;
                    UI.updateProgress(this.solvedIds.size, `🏰 ${DATA.castleWorld.wings[bestIdx].location}`);
                }
                return;
            }

            if (this.activeWorld === "hogsmeade") {
                let bestIdx = 0;
                let bestDist = Infinity;
                DATA.hogsmeadeWorld.zones.forEach((z, idx) => {
                    const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, z.regionCenter.x, z.regionCenter.y);
                    if (d < bestDist) {
                        bestDist = d;
                        bestIdx = idx;
                    }
                });
                if (force || bestIdx !== this.currentHogsmeadeIdx) {
                    this.currentHogsmeadeIdx = bestIdx;
                    UI.updateProgress(this.solvedIds.size, `🏘️ ${DATA.hogsmeadeWorld.zones[bestIdx].location}`);
                }
                return;
            }

            let bestIdx = 0;
            let bestDist = Infinity;
            DATA.quizzes.forEach((r, idx) => {
                const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, r.regionCenter.x, r.regionCenter.y);
                if (d < bestDist) {
                    bestDist = d;
                    bestIdx = idx;
                }
            });
            if (force || bestIdx !== this.currentRegionIdx) {
                this.currentRegionIdx = bestIdx;
                UI.updateProgress(this.solvedIds.size, DATA.quizzes[bestIdx].location);
            }
        }

        getValleySolids() {
            return [
                { x1: 0, y1: 0, x2: 530, y2: 430 },
                { x1: 530, y1: 0, x2: 715, y2: 290 },
                { x1: 715, y1: 0, x2: 880, y2: 265 },
                { x1: 860, y1: 0, x2: 1730, y2: 345 },
                { x1: 1730, y1: 0, x2: 2560, y2: 190 },
                { x1: 890, y1: 480, x2: 1218, y2: 605 },
                { x1: 1342, y1: 480, x2: 1670, y2: 605 },
                { x1: 0, y1: 560, x2: 280, y2: 830 },
                { x1: 0, y1: 790, x2: 470, y2: 1095 },
                { x1: 520, y1: 790, x2: 940, y2: 1125 },
                { x1: 0, y1: 1295, x2: 440, y2: 1440 },
                { x1: 530, y1: 1300, x2: 860, y2: 1440 },
                { x1: 1545, y1: 785, x2: 1885, y2: 1030 },
                { x1: 1885, y1: 685, x2: 2430, y2: 915 },
                { x1: 2385, y1: 480, x2: 2560, y2: 960 },
                { x1: 1580, y1: 1185, x2: 2040, y2: 1440 },
                { x1: 1900, y1: 1280, x2: 2150, y2: 1440 },
                { x1: 2385, y1: 920, x2: 2560, y2: 1130 },
                { x1: 2145, y1: 1255, x2: 2228, y2: 1385 },
                { x1: 2385, y1: 1110, x2: 2475, y2: 1275 }
            ];
        }

        getCastleSolids() {
            return [
                // Paredes externas & vazios fora do castelo
                { x1: 0, y1: 0, x2: 165, y2: 1440 },
                { x1: 2405, y1: 0, x2: 2560, y2: 1440 },
                { x1: 0, y1: 0, x2: 720, y2: 245 },
                { x1: 880, y1: 0, x2: 1680, y2: 215 },
                { x1: 1840, y1: 0, x2: 2560, y2: 250 },
                { x1: 700, y1: 0, x2: 880, y2: 330 },
                { x1: 1680, y1: 0, x2: 1860, y2: 330 },
                { x1: 790, y1: 790, x2: 960, y2: 1440 },
                { x1: 1600, y1: 790, x2: 1770, y2: 1440 },
                { x1: 0, y1: 1125, x2: 810, y2: 1440 },
                { x1: 1750, y1: 1125, x2: 2560, y2: 1440 },
                // Parede sul da Torre de Astronomia (porta dourada x:1190..1370 ABERTA!)
                { x1: 940, y1: 1275, x2: 1190, y2: 1440 },
                { x1: 1370, y1: 1275, x2: 1620, y2: 1440 },
                // Parede norte da Torre de Astronomia (arco central x:1205..1355 ABERTO!)
                { x1: 930, y1: 815, x2: 1205, y2: 1015 },
                { x1: 1355, y1: 815, x2: 1630, y2: 1015 },
                // Paredes do Salão Principal (porta central x:1155..1405 ABERTA!)
                { x1: 835, y1: 180, x2: 930, y2: 675 },
                { x1: 1630, y1: 180, x2: 1725, y2: 675 },
                { x1: 835, y1: 525, x2: 1155, y2: 675 },
                { x1: 1405, y1: 525, x2: 1725, y2: 675 },
                // Mesas do Salão Principal (mesa principal + 2 mesas de banquete)
                { x1: 1120, y1: 145, x2: 1440, y2: 260 },
                { x1: 955, y1: 255, x2: 1145, y2: 525 },
                { x1: 1415, y1: 255, x2: 1605, y2: 525 },
                // Parede da Biblioteca (arco da porta y:585..725 ABERTO!) + estantes sólidas
                { x1: 585, y1: 180, x2: 695, y2: 585 },
                { x1: 545, y1: 725, x2: 650, y2: 1135 },
                { x1: 205, y1: 430, x2: 400, y2: 605 },
                { x1: 465, y1: 430, x2: 600, y2: 605 },
                { x1: 170, y1: 840, x2: 405, y2: 1035 },
                // Parede das Masmorras de Poções (arco da porta y:585..725 ABERTO!) + caldeirões e mesas sólidas
                { x1: 1865, y1: 180, x2: 1975, y2: 585 },
                { x1: 1910, y1: 725, x2: 2015, y2: 1135 },
                { x1: 1990, y1: 355, x2: 2330, y2: 485 },
                { x1: 2180, y1: 775, x2: 2325, y2: 955 },
                { x1: 2150, y1: 1020, x2: 2365, y2: 1125 },
                { x1: 1965, y1: 770, x2: 2065, y2: 985 },
                // Objetos da Torre de Astronomia (globo celeste e telescópio)
                { x1: 1020, y1: 1005, x2: 1170, y2: 1160 },
                { x1: 1395, y1: 1015, x2: 1560, y2: 1160 }
            ];
        }

        getHogsmeadeSolids() {
            return [
                // Céu estrelado no topo (avenida central x:1150..1410 aberta!)
                { x1: 0, y1: 0, x2: 1145, y2: 265 },
                { x1: 1415, y1: 0, x2: 2560, y2: 265 },
                // Lojas da Vila de Hogsmeade (Dedosdemel, Três Vassouras, casinha esquerda)
                { x1: 0, y1: 180, x2: 495, y2: 655 },
                { x1: 545, y1: 180, x2: 1110, y2: 695 },
                { x1: 0, y1: 710, x2: 335, y2: 1175 },
                // Pinheiros + Cabana do Hagrid + cercado das abóboras (entrada da trilha x:1870..2020 aberta!)
                { x1: 1525, y1: 180, x2: 1845, y2: 445 },
                { x1: 1845, y1: 180, x2: 2425, y2: 590 },
                { x1: 2410, y1: 180, x2: 2560, y2: 960 },
                { x1: 1525, y1: 445, x2: 1860, y2: 790 },
                { x1: 2045, y1: 590, x2: 2450, y2: 810 },
                // Expresso de Hogwarts e trilhos na parte inferior (plataforma superior livre!)
                { x1: 1640, y1: 1135, x2: 2560, y2: 1440 },
                { x1: 890, y1: 1245, x2: 1640, y2: 1440 }
            ];
        }

        isBlockedOnGround(x, y) {
            if (y < 210) return true;
            const rm = DATA.rooms[this.activeWorld];
            const solids = rm ? (rm.solids || []) : (this.activeWorld === "hogsmeade" ? this.getHogsmeadeSolids() : this.getValleySolids());
            for (const r of solids) {
                if (x > r.x1 && x < r.x2 && y > r.y1 && y < r.y2) return true;
            }
            return false;
        }

        applyWalkableBounds(nx, ny, ignoreSolids = false) {
            // No modo voo, Helora pode sobrevoar todo o vale e alcançar o topo da Torre do Castelo!
            if (ignoreSolids) {
                return {
                    x: Phaser.Math.Clamp(nx, 70, WORLD_W - 70),
                    y: Phaser.Math.Clamp(ny, 130, WORLD_H - 42)
                };
            }

            let x = Phaser.Math.Clamp(nx, 70, WORLD_W - 70);
            let y = Phaser.Math.Clamp(ny, 210, WORLD_H - 42);
            const rm = DATA.rooms[this.activeWorld];
            const solids = rm
                ? (rm.solids || [])
                : (this.activeWorld === "castle"
                    ? this.getCastleSolids()
                    : (this.activeWorld === "hogsmeade" ? this.getHogsmeadeSolids() : this.getValleySolids()));

            for (let pass = 0; pass < 2; pass++) {
                for (const r of solids) {
                    if (x > r.x1 && x < r.x2 && y > r.y1 && y < r.y2) {
                        const dl = x - r.x1;
                        const dr = r.x2 - x;
                        const dt = y - r.y1;
                        const db = r.y2 - y;
                        const m = Math.min(dl, dr, dt, db);
                        if (m === db) y = r.y2;
                        else if (m === dt) y = r.y1;
                        else if (m === dl) x = r.x1;
                        else x = r.x2;
                    }
                }
            }
            return { x, y };
        }

        update(time, delta) {
            const dt = Math.min(delta / 1000, 0.05);

            // Vagalumes flutuando
            for (const f of this.ambientFireflies) {
                f.y = f.baseY + Math.sin(time * 0.0018 * f.speed + f.phase) * 9;
            }

            // Fumaça animada subindo da chaminé do Expresso de Hogwarts em Hogsmeade!
            if (this.activeWorld === "hogsmeade") {
                this.trainSteamTimer += dt;
                if (this.trainSteamTimer > 0.24) {
                    this.trainSteamTimer = 0;
                    const puff = this.add.image(1785 + Phaser.Math.Between(-8, 8), 1105, "soft_glow")
                        .setTint(0xeef5ff)
                        .setScale(Phaser.Math.FloatBetween(0.32, 0.55))
                        .setAlpha(0.65)
                        .setDepth(11.9);
                    this.tweens.add({
                        targets: puff,
                        x: puff.x + Phaser.Math.Between(35, 85),
                        y: puff.y - Phaser.Math.Between(55, 95),
                        scale: 1.15,
                        alpha: 0,
                        duration: 1400,
                        ease: "Sine.easeOut",
                        onComplete: () => puff.destroy()
                    });
                }
            }

            // Chamas vivas e caldeirão borbulhando nas salas/interiores e Estufas!
            if (DATA.rooms[this.activeWorld]) {
                for (const fl of this.roomFlames) {
                    const flicker = Math.sin(time * 0.017 + fl.phase) * 0.14 + Math.cos(time * 0.029 + fl.phase * 1.7) * 0.08;
                    fl.glow.setScale(fl.s * (1.05 + flicker), fl.s * (1.15 + flicker * 1.3));
                    fl.glow.setAlpha(0.5 + flicker * 0.65);
                    fl.core.setPosition(fl.x + Math.sin(time * 0.022 + fl.phase) * 1.4, fl.y - 3 - Math.abs(flicker) * 6);
                    fl.core.setScale(fl.s * (0.78 + flicker * 0.9), fl.s * (1.05 + flicker * 1.6));
                }
                if (this.roomCauldrons.length > 0) {
                    for (const c of this.roomCauldrons) {
                        c.glow.setAlpha(0.55 + Math.sin(time * 0.006 + c.phase) * 0.22);
                    }
                    this.cauldronBubbleTimer += dt;
                    if (this.cauldronBubbleTimer > 0.16) {
                        this.cauldronBubbleTimer = 0;
                        for (const c of this.roomCauldrons) {
                            const bx = c.x + Phaser.Math.Between(-c.r, c.r);
                            const by = c.y + Phaser.Math.Between(-6, 6);
                            const bub = this.add.image(bx, by, "sparkle_dot")
                                .setTint(Math.random() > 0.35 ? 0x6dff9e : 0xffe680)
                                .setScale(Phaser.Math.FloatBetween(0.24, 0.5))
                                .setAlpha(0.85).setDepth(11.9);
                            this.tweens.add({ targets: bub, x: bx + Phaser.Math.Between(-10, 10), y: by - Phaser.Math.Between(28, 54), alpha: 0, duration: 680, onComplete: () => bub.destroy() });
                        }
                    }
                }
            }

            // Chamas vivas nas velas + caldeirões borbulhando dentro do Castelo!
            if (this.activeWorld === "castle") {
                if (this.castleFlames) {
                    for (const fl of this.castleFlames) {
                        const flicker = Math.sin(time * 0.017 + fl.phase) * 0.14 + Math.cos(time * 0.029 + fl.phase * 1.7) * 0.08;
                        fl.glow.setScale(fl.s * (1.05 + flicker), fl.s * (1.15 + flicker * 1.3));
                        fl.glow.setAlpha(0.48 + flicker * 0.65);
                        fl.core.setPosition(fl.x + Math.sin(time * 0.022 + fl.phase) * 1.4, fl.y - 3 - Math.abs(flicker) * 6);
                        fl.core.setScale(fl.s * (0.78 + flicker * 0.9), fl.s * (1.05 + flicker * 1.6));
                    }
                }
                if (this.castleCauldrons) {
                    for (const c of this.castleCauldrons) {
                        const pulse = 0.55 + Math.sin(time * 0.006 + c.phase) * 0.22;
                        c.glow.setAlpha(pulse);
                    }
                    this.cauldronBubbleTimer += dt;
                    if (this.cauldronBubbleTimer > 0.14) {
                        this.cauldronBubbleTimer = 0;
                        for (const c of this.castleCauldrons) {
                            const bx = c.x + Phaser.Math.Between(-c.r, c.r);
                            const by = c.y + Phaser.Math.Between(-6, 6);
                            const bub = this.add.image(bx, by, "sparkle_dot")
                                .setTint(Math.random() > 0.3 ? 0x4dff9e : 0xd4ff70)
                                .setScale(Phaser.Math.FloatBetween(0.24, 0.52))
                                .setAlpha(0.88)
                                .setDepth(11.9);
                            this.tweens.add({
                                targets: bub,
                                x: bx + Phaser.Math.Between(-12, 12),
                                y: by - Phaser.Math.Between(28, 56),
                                scale: 0.72,
                                alpha: 0,
                                duration: Phaser.Math.Between(520, 880),
                                ease: "Sine.easeOut",
                                onComplete: () => bub.destroy()
                            });
                        }
                    }
                }
            }

            // Isac voando no céu do vale
            if (this.isacBg && this.isacBg.visible) {
                this.isacBg.x += this.isacBgDir * 115 * dt;
                this.isacBg.y = 250 + Math.sin(time * 0.0022) * 24;
                if (this.isacBg.x > WORLD_W + 180) {
                    this.isacBgDir = -1;
                    this.isacBg.setFlipX(true);
                } else if (this.isacBg.x < -180) {
                    this.isacBgDir = 1;
                    this.isacBg.setFlipX(false);
                }
                this.isacBgTrailTimer += dt;
                if (this.isacBgTrailTimer > 0.16) {
                    this.isacBgTrailTimer = 0;
                    const tr = this.add.image(this.isacBg.x - this.isacBgDir * 24, this.isacBg.y + 8, "sparkle_dot")
                        .setTint(0x52f29b).setScale(0.28).setAlpha(0.75).setDepth(12.8);
                    this.tweens.add({ targets: tr, alpha: 0, scale: 0.06, duration: 480, onComplete: () => tr.destroy() });
                }
            }

            // Timer Felix Felicis
            if (this.felixTimer > 0) {
                this.felixTimer -= dt;
                this.felixAura.setPosition(this.player.x, this.player.y - 36);
                this.felixAura.setAlpha(0.5 + Math.sin(time * 0.012) * 0.18);
                if (this.felixTimer <= 0) {
                    this.felixAura.setAlpha(0);
                    UI.hudFelix.classList.add("hidden");
                }
            }

            // Atalhos de teclado (M = Mapa, E = Explorar, L = Lumos, F = Voar na Vassoura)
            if (Phaser.Input.Keyboard.JustDown(this.keyM) && this.state === "WALKING") {
                this.openMarauderMap();
                return;
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyF) && this.state === "WALKING" && this.hasBroom) {
                this.toggleFly();
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyE) && this.state === "WALKING" && this.activeInteractable) {
                this.interactWithNearby();
                return;
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyL) && this.lumosActive) {
                this.castLumos();
            }

            // Altitude suave do Modo Voo
            const targetAlt = this.isFlying ? (38 + Math.sin(time * 0.005) * 6) : 0;
            this.flyAlt += (targetAlt - this.flyAlt) * Math.min(1, 9 * dt);
            if (this.flyAlt > 2) {
                this.flyAura.setPosition(this.player.x, this.player.y - this.flyAlt * 0.55);
                this.flyAura.setAlpha(0.45 + Math.sin(time * 0.008) * 0.12);
                this.flyAura.setDepth(this.isFlying ? 12.7 : 4.4);
            } else {
                this.flyAura.setAlpha(0);
            }

            if (this.state !== "WALKING") {
                this.updateKittenFollow(dt, time, false);
                return;
            }

            // Input 360°: Teclado + Joystick Virtual + Toque no Mapa
            let inX = 0;
            let inY = 0;

            if (this.cursors.left.isDown || this.keyA.isDown) inX -= 1;
            if (this.cursors.right.isDown || this.keyD.isDown) inX += 1;
            if (this.cursors.up.isDown || this.keyW.isDown) inY -= 1;
            if (this.cursors.down.isDown || this.keyS.isDown) inY += 1;

            if (inX === 0 && inY === 0 && InputState.joyActive) {
                inX = InputState.joyX;
                inY = InputState.joyY;
            } else if (inX === 0 && inY === 0 && InputState.pointerWalk) {
                const wp = this.cameras.main.getWorldPoint(InputState.pointerScreenX, InputState.pointerScreenY);
                const dx = wp.x - this.player.x;
                const dy = wp.y - this.player.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 18) {
                    inX = dx / dist;
                    inY = dy / dist;
                }
            }

            const mag = Math.hypot(inX, inY);
            const joyOuterSprint = InputState.joyActive && mag > 0.88;
            const isSprinting = (this.keyShift && this.keyShift.isDown) || InputState.touchSprint || joyOuterSprint;
            if (UI.btnSprint) UI.btnSprint.classList.toggle("active", isSprinting && mag > 0.05);

            if (mag > 1) {
                inX /= mag;
                inY /= mag;
            }

            let activeSpeed = WALK_SPEED * (this.isFlying ? 1.82 : (isSprinting ? 1.55 : 1.0));
            if (this.felixTimer > 0) activeSpeed *= 1.25;
            const targetVX = inX * activeSpeed;
            const targetVY = inY * activeSpeed;
            const smooth = Math.min(1, (this.isFlying ? 7.5 : (isSprinting ? 13 : 10)) * dt);
            this.velX += (targetVX - this.velX) * smooth;
            this.velY += (targetVY - this.velY) * smooth;

            const speed = Math.hypot(this.velX, this.velY);
            const isMoving = speed > 10;
            this.playerSprinting = isMoving && (isSprinting || this.isFlying);

            if (this.isFlying) {
                // Helora voando na vassoura: costas (↑) com helora_broom_back e demais direções com helora_broom original!
                if (this.player.anims.isPlaying) this.player.anims.stop();
                if (this.velY < -18 && Math.abs(this.velY) > Math.abs(this.velX) * 1.1) {
                    this.player.setTexture("helora_broom_back");
                    this.player.setFlipX(this.velX > 25);
                    this.player.setAngle(Math.sin(time * 0.006) * 2.2);
                } else {
                    if (Math.abs(this.velX) > 15 || this.velY > 18 || this.player.texture.key !== "helora_broom_back") {
                        this.player.setTexture("helora_broom");
                        if (this.velX < -15) this.player.setFlipX(true);
                        else if (this.velX > 15) this.player.setFlipX(false);
                    }
                    const dirSign = this.player.flipX ? -1 : 1;
                    const pitchAngle = Phaser.Math.Clamp((this.velY / 450) * 14 * dirSign, -14, 14);
                    this.player.setAngle(pitchAngle + Math.sin(time * 0.006) * 2.2);
                }
                this.player.setScale(0.48);
                this.kitten.setVisible(false);
                this.kittenShadow.setVisible(false);

                this.particleTimer += dt;
                if (this.particleTimer > 0.08) {
                    this.particleTimer = 0;
                    const tailDir = this.player.flipX ? 1 : -1;
                    const sp = this.add.image(this.player.x + tailDir * 36, this.player.y - this.flyAlt - 12, "sparkle_dot")
                        .setTint(Math.random() > 0.45 ? 0xffe484 : 0x52f29b).setScale(Phaser.Math.FloatBetween(0.22, 0.45)).setDepth(12.8);
                    this.tweens.add({ targets: sp, x: sp.x + tailDir * 22, alpha: 0, scale: 0.06, duration: 420, onComplete: () => sp.destroy() });
                }
            } else if (isMoving) {
                this.kitten.setVisible(true);
                this.kittenShadow.setVisible(true);
                const nextPos = this.applyWalkableBounds(
                    this.player.x + this.velX * dt,
                    this.player.y + this.velY * dt,
                    false
                );
                this.player.x = nextPos.x;
                this.player.y = nextPos.y;

                const speedRatio = Math.min(1.55, speed / WALK_SPEED);
                this.walkPhase += dt * (isSprinting ? 14.5 : (7.5 + speedRatio * 4.5));

                // Escolher sprite dedicado de CORRIDA ou CAMINHADA nas 4 direções!
                if (Math.abs(this.velX) >= Math.abs(this.velY) * 0.85) {
                    this.facing = this.velX >= 0 ? "right" : "left";
                    this.player.setFlipX(this.velX < 0);
                    const animKey = isSprinting ? "helora_run_side_anim" : "helora_walk_anim";
                    if (this.player.anims.currentAnim?.key !== animKey || !this.player.anims.isPlaying) {
                        this.player.play(animKey, true);
                    }
                } else if (this.velY < 0) {
                    this.facing = "up";
                    this.player.setFlipX(false);
                    const animKey = isSprinting ? "helora_run_back_anim" : "helora_back_anim";
                    if (this.player.anims.currentAnim?.key !== animKey || !this.player.anims.isPlaying) {
                        this.player.play(animKey, true);
                    }
                } else {
                    this.facing = "down";
                    this.player.setFlipX(false);
                    const animKey = isSprinting ? "helora_run_front_anim" : "helora_front_anim";
                    if (this.player.anims.currentAnim?.key !== animKey || !this.player.anims.isPlaying) {
                        this.player.play(animKey, true);
                    }
                }

                this.player.anims.timeScale = isSprinting ? 1.18 : (0.75 + Math.min(1, speedRatio) * 0.35);
                this.player.setScale(HELORA_SCALE);
                this.player.setAngle(0);
                this.playerVisualOffsetY = isSprinting ? 0 : -Math.abs(Math.sin(this.walkPhase)) * 1.4;

                // Poeira mágica dos passos (mais intensa na corridinha!)
                this.stepDustTimer += dt * speedRatio;
                const dustInterval = isSprinting ? 0.11 : 0.22;
                if (this.stepDustTimer > dustInterval) {
                    this.stepDustTimer = 0;
                    const puff = this.add.image(this.player.x + Phaser.Math.Between(-6, 6), this.player.y - 2, "sparkle_dot")
                        .setTint(isSprinting ? 0xfff2a6 : 0xffe9a8)
                        .setScale(isSprinting ? 0.30 : 0.22)
                        .setAlpha(isSprinting ? 0.72 : 0.52)
                        .setDepth(4.9);
                    this.tweens.add({ targets: puff, y: puff.y - 12, alpha: 0, scale: 0.08, duration: 360, onComplete: () => puff.destroy() });
                }

                this.particleTimer += dt * speedRatio;
                const sparkInterval = isSprinting ? 0.09 : 0.17;
                if (this.particleTimer > sparkInterval) {
                    this.particleTimer = 0;
                    const sp = this.add.image(this.player.x + Phaser.Math.Between(-12, 12), this.player.y - 34, "sparkle_dot")
                        .setTint(Math.random() > 0.45 ? 0xffe484 : 0x52f29b).setScale(Phaser.Math.FloatBetween(0.18, 0.38)).setDepth(this.player.depth);
                    this.tweens.add({ targets: sp, y: sp.y - 16, alpha: 0, duration: 400, onComplete: () => sp.destroy() });
                }
            } else {
                this.kitten.setVisible(true);
                this.kittenShadow.setVisible(true);
                this.velX = 0;
                this.velY = 0;
                this.playerSprinting = false;
                if (this.player.anims.isPlaying) this.player.anims.stop();
                if (this.facing === "up") {
                    this.player.setTexture("helora_back_walk", 1).setFlipX(false);
                } else if (this.facing === "down") {
                    this.player.setTexture("helora_front_walk", 0).setFlipX(false);
                } else {
                    this.player.setTexture("helora_idle").setFlipX(this.facing === "left");
                }
                const breath = HELORA_SCALE * (1 + Math.sin(time * 0.0035) * 0.015);
                this.player.setScale(HELORA_SCALE, breath);
                this.player.setAngle(0);
            }

            if (this.isFlying && isMoving) {
                const nextFly = this.applyWalkableBounds(
                    this.player.x + this.velX * dt,
                    this.player.y + this.velY * dt,
                    true
                );
                this.player.x = nextFly.x;
                this.player.y = nextFly.y;
                this.kitten.setPosition(this.player.x - 55, this.player.y + 8);
            }

            this.player.setDepth(this.isFlying ? 12.9 : (5 + this.player.y / 1000));
            this.playerShadow.setPosition(this.player.x, this.player.y + 4);
            this.playerShadow.setScale(this.isFlying ? 0.68 : 1);
            this.playerShadow.setAlpha(this.isFlying ? 0.28 : 0.46);
            const totalLift = this.flyAlt + (isMoving && !this.isFlying && this.playerVisualOffsetY ? -this.playerVisualOffsetY : 0);
            this.player.setOrigin(0.5, 0.92 + totalLift / (256 * HELORA_SCALE));

            this.updateKittenFollow(dt, time, isMoving);
            this.updateCurrentRegion(false);
            this.checkWorldInteractions();
        }

        updateKittenFollow(dt, time, playerMoving) {
            const dx = this.player.x - this.kitten.x;
            const dy = this.player.y - this.kitten.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 62) {
                const kittenSprinting = this.playerSprinting || dist > 115;
                const kSpeed = kittenSprinting ? 415 : 275;
                const moveDist = Math.min(dist - 54, kSpeed * dt);
                const vx = (dx / dist) * moveDist;
                const vy = (dy / dist) * moveDist;

                // Gatinho acompanha no ar durante o voo ou respeita colisões no chão!
                const kNext = this.applyWalkableBounds(this.kitten.x + vx, this.kitten.y + vy, this.isFlying);
                this.kitten.x = kNext.x;
                this.kitten.y = kNext.y;

                // Animações completas de 4 frames nas 4 direções!
                if (Math.abs(vx) >= Math.abs(vy) * 0.85) {
                    this.kitten.setFlipX(vx < 0);
                    if (this.kitten.anims.currentAnim?.key !== "kitten_walk_anim" || !this.kitten.anims.isPlaying) {
                        this.kitten.play("kitten_walk_anim", true);
                    }
                } else if (vy < 0) {
                    this.kitten.setFlipX(false);
                    if (this.kitten.anims.currentAnim?.key !== "kitten_back_anim" || !this.kitten.anims.isPlaying) {
                        this.kitten.play("kitten_back_anim", true);
                    }
                } else {
                    this.kitten.setFlipX(false);
                    if (this.kitten.anims.currentAnim?.key !== "kitten_front_anim" || !this.kitten.anims.isPlaying) {
                        this.kitten.play("kitten_front_anim", true);
                    }
                }

                this.kitten.anims.timeScale = kittenSprinting ? 1.65 : 1.05;
                const hop = kittenSprinting ? (1 + Math.abs(Math.sin(time * 0.022)) * 0.07) : 1;
                this.kitten.setScale(KITTEN_SCALE, KITTEN_SCALE * hop);
                this.kitten.setAngle(Math.sin(time * (kittenSprinting ? 0.024 : 0.014)) * (kittenSprinting ? 4.5 : 2.2));
            } else if (!playerMoving) {
                if (this.kitten.anims.isPlaying) this.kitten.anims.stop();
                this.kitten.setTexture("kitten_idle").setFlipX(this.player.x < this.kitten.x);
                const kBreath = KITTEN_SCALE * (1 + Math.sin(time * 0.0042) * 0.02);
                this.kitten.setScale(KITTEN_SCALE, kBreath);
                this.kitten.setAngle(0);
            }

            this.kitten.setDepth(this.isFlying ? 12.85 : (5 + this.kitten.y / 1000));
            this.kitten.setOrigin(0.5, 0.92 + (this.flyAlt * 0.9) / (128 * KITTEN_SCALE));
            this.kittenShadow.setPosition(this.kitten.x, this.kitten.y + 3);
            this.kittenShadow.setScale(this.isFlying ? 0.65 : 1);
            this.kittenShadow.setAlpha(this.isFlying ? 0.25 : 0.4);
        }

        checkWorldInteractions() {
            const px = this.player.x;
            const py = this.player.y;

            if (this.activeWorld === "castle") {
                for (const st of this.castleStars) {
                    if (!st.collected && Phaser.Math.Distance.Between(px, py, st.x, st.y) < 48) {
                        st.collected = true;
                        st.sprite._worldHidden = true;
                        st.sprite.setVisible(false);
                        SoundFX.playCollect();
                        this.burstMagic(st.x, st.y, 12);
                        this.addHousePoints(15, st.x, st.y);
                    }
                }
                for (const p of this.castlePotions) {
                    if (!p.collected && Phaser.Math.Distance.Between(px, py, p.x, p.y) < 52) {
                        p.collected = true;
                        p.sprite._worldHidden = true;
                        p.glow._worldHidden = true;
                        p.sprite.setVisible(false);
                        p.glow.setVisible(false);
                        this.felixTimer = 6.0;
                        UI.hudFelix.classList.remove("hidden");
                        SoundFX.playPotion();
                        this.burstMagic(p.x, p.y, 24);
                        this.addHousePoints(25, p.x, p.y);
                    }
                }
                let nearItem = null;
                for (const it of this.castleInteractables) {
                    if (it.type === "castle_note" && it.done) continue;
                    if (Phaser.Math.Distance.Between(px, py, it.x, it.y) < 88) {
                        nearItem = it;
                        break;
                    }
                }
                this.activeInteractable = nearItem;
                if (nearItem) {
                    UI.btnExplore.textContent = nearItem.label;
                    UI.btnExplore.classList.remove("hidden");
                } else {
                    UI.btnExplore.classList.add("hidden");
                }
                for (const cp of this.castleCheckpoints) {
                    if (!cp.solved && Phaser.Math.Distance.Between(px, py, cp.x, cp.y) < 66) {
                        this.triggerQuiz(cp);
                        return;
                    }
                }
                return;
            }

            if (DATA.rooms[this.activeWorld]) {
                for (const st of this.roomStars) {
                    if (!st.collected && Phaser.Math.Distance.Between(px, py, st.x, st.y) < 48) {
                        st.collected = true;
                        this.collectedRoomStars.add(st.id);
                        st.sprite.setVisible(false);
                        SoundFX.playCollect();
                        this.burstMagic(st.x, st.y, 12);
                        this.addHousePoints(15, st.x, st.y);
                    }
                }
                let nearItem = null;
                for (const it of this.roomInteractables) {
                    if (Phaser.Math.Distance.Between(px, py, it.x, it.y) < 95) {
                        nearItem = it;
                        break;
                    }
                }
                this.activeInteractable = nearItem;
                if (nearItem) {
                    UI.btnExplore.textContent = nearItem.label;
                    UI.btnExplore.classList.remove("hidden");
                } else {
                    UI.btnExplore.classList.add("hidden");
                }
                return;
            }

            if (this.activeWorld === "hogsmeade") {
                // Transição contínua ao subir pela estrada norte de Hogsmeade -> Vale!
                if (py <= 238 && px > 1165 && px < 1395) {
                    this.state = "MODAL";
                    this.switchWorld("valley", { x: 1280, y: 1275 }, "🌍 De volta ao Vale de Hogwarts!");
                    return;
                }
                for (const st of this.hogsmeadeStars) {
                    if (!st.collected && Phaser.Math.Distance.Between(px, py, st.x, st.y) < 48) {
                        st.collected = true;
                        st.sprite._worldHidden = true;
                        st.sprite.setVisible(false);
                        SoundFX.playCollect();
                        this.burstMagic(st.x, st.y, 12);
                        this.addHousePoints(15, st.x, st.y);
                    }
                }
                for (const p of this.hogsmeadePotions) {
                    if (!p.collected && Phaser.Math.Distance.Between(px, py, p.x, p.y) < 52) {
                        p.collected = true;
                        p.sprite._worldHidden = true;
                        p.glow._worldHidden = true;
                        p.sprite.setVisible(false);
                        p.glow.setVisible(false);
                        this.felixTimer = 6.0;
                        UI.hudFelix.classList.remove("hidden");
                        SoundFX.playPotion();
                        this.burstMagic(p.x, p.y, 24);
                        this.addHousePoints(25, p.x, p.y);
                    }
                }
                let nearItem = null;
                for (const it of this.hogsmeadeInteractables) {
                    if (it.type === "castle_note" && it.done) continue;
                    if (Phaser.Math.Distance.Between(px, py, it.x, it.y) < 88) {
                        nearItem = it;
                        break;
                    }
                }
                this.activeInteractable = nearItem;
                if (nearItem) {
                    UI.btnExplore.textContent = nearItem.label;
                    UI.btnExplore.classList.remove("hidden");
                } else {
                    UI.btnExplore.classList.add("hidden");
                }
                if (!this.isFlying) {
                    for (const cp of this.hogsmeadeCheckpoints) {
                        if (!cp.solved && Phaser.Math.Distance.Between(px, py, cp.x, cp.y) < 66) {
                            this.triggerQuiz(cp);
                            return;
                        }
                    }
                }
                return;
            }

            // === MUNDO EXTERNO: VALE DE HOGWARTS ===
            // Transição contínua ao descer pela estrada sul do Vale -> Vila de Hogsmeade!
            if (py >= 1388 && px > 1170 && px < 1390) {
                this.state = "MODAL";
                this.switchWorld("hogsmeade", DATA.hogsmeadeWorld.startPos, "🏘️ Bem-vinda à Vila de Hogsmeade & Expresso!");
                return;
            }
            // 0. Coletar Vassoura Mágica no Campo de Quadribol!
            if (!this.hasBroom && Phaser.Math.Distance.Between(px, py, DATA.broomPos.x, DATA.broomPos.y) < 58) {
                this.hasBroom = true;
                [this.broomIcon, this.broomGlow, this.broomLabel].forEach((o) => {
                    o._worldHidden = true;
                    o.setVisible(false);
                });
                if (UI.hudBroom) UI.hudBroom.classList.remove("hidden");
                if (UI.btnFly) UI.btnFly.classList.remove("hidden");
                SoundFX.playFanfare();
                this.burstMagic(DATA.broomPos.x, DATA.broomPos.y, 32);
                this.addHousePoints(50, DATA.broomPos.x, DATA.broomPos.y);
                UI.showBanner("🧹 Vassoura encontrada! Aperte F (ou 🧹 Voar) e voe até a 🏰 Torre do Castelo!", 5200);
            }

            // 1. Coletar estrelas
            for (const st of this.collectibleStars) {
                if (!st.collected && st.sprite.visible && Phaser.Math.Distance.Between(px, py, st.x, st.y) < 46) {
                    st.collected = true;
                    st.sprite._worldHidden = true;
                    st.sprite.setVisible(false);
                    SoundFX.playCollect();
                    this.burstMagic(st.x, st.y, 12);
                    this.addHousePoints(10, st.x, st.y);
                }
            }

            // 2. Coletar Poções Felix Felicis
            for (const p of this.potions) {
                if (!p.collected && Phaser.Math.Distance.Between(px, py, p.x, p.y) < 50) {
                    p.collected = true;
                    p.sprite._worldHidden = true;
                    p.glow._worldHidden = true;
                    p.sprite.setVisible(false);
                    p.glow.setVisible(false);
                    this.felixTimer = 6.0;
                    UI.hudFelix.classList.remove("hidden");
                    SoundFX.playPotion();
                    this.burstMagic(p.x, p.y, 24);
                    this.addHousePoints(25, p.x, p.y);
                }
            }

            // 3. Bilhetes Secretos, Pontos de Exploração e Portal Aéreo da Torre
            let nearItem = null;
            for (const it of this.interactables) {
                if (it.type === "note" && it.done) continue;
                if (it.requiresFlight && !this.isFlying) continue;
                const radius = it.requiresFlight ? 105 : 78;
                if (Phaser.Math.Distance.Between(px, py, it.x, it.y) < radius) {
                    nearItem = it;
                    break;
                }
            }
            this.activeInteractable = nearItem;
            if (nearItem) {
                UI.btnExplore.textContent = nearItem.label;
                UI.btnExplore.classList.remove("hidden");
            } else {
                UI.btnExplore.classList.add("hidden");
            }

            if (this.isFlying) return; // Quizzes e mini-desafios de chão ativam pousada

            // 4. Mini-Desafio Lumos na Floresta Proibida (SE)
            const forestRegion = DATA.quizzes[1];
            if (forestRegion.lumosZone && !this.lumosSolved && !this.lumosActive) {
                const lz = forestRegion.lumosZone;
                if (Phaser.Math.Distance.Between(px, py, lz.x, lz.y) < lz.radius) {
                    this.lumosActive = true;
                    this.tweens.add({ targets: this.darknessOverlay, alpha: 0.56, duration: 550 });
                    UI.btnLumos.classList.remove("hidden");
                    UI.showBanner("🌑 Floresta escura! Toque em ✨ Lumos (ou L) para iluminar!");
                }
            }

            // 5. Mini-Desafio Caça ao Pomo no Campo de Quadribol (NE)
            const quidditchRegion = DATA.quizzes[2];
            if (quidditchRegion.snitchZone && !this.snitchSolved) {
                const sz = quidditchRegion.snitchZone;
                if (Phaser.Math.Distance.Between(px, py, sz.x, sz.y) < sz.radius) {
                    this.startSnitchHunt(sz);
                    return;
                }
            }

            // 6. Checkpoints de Quiz (em qualquer ordem!)
            for (const cp of this.checkpoints) {
                if (!cp.solved && Phaser.Math.Distance.Between(px, py, cp.x, cp.y) < 64) {
                    this.triggerQuiz(cp);
                    return;
                }
            }

            // 7. Pátio da Grande Surpresa (quando os 5 quizzes estiverem resolvidos!)
            if (!this.finaleDone && this.solvedIds.size >= DATA.quizzes.length) {
                if (Phaser.Math.Distance.Between(px, py, DATA.finalePos.x, DATA.finalePos.y) < 88) {
                    this.triggerFinale();
                }
            }
        }
    }

    // === Controles DOM & Joystick Virtual 360° ===
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

    if (UI.btnExplore) {
        UI.btnExplore.addEventListener("click", () => {
            SoundFX.unlock();
            if (window.__heloraScene) window.__heloraScene.interactWithNearby();
        });
    }

    if (UI.btnFly) {
        UI.btnFly.addEventListener("click", () => {
            SoundFX.unlock();
            if (window.__heloraScene) window.__heloraScene.toggleFly();
        });
    }

    if (UI.btnSprint) {
        const startSprint = (e) => { e.preventDefault(); SoundFX.unlock(); InputState.touchSprint = true; UI.btnSprint.classList.add("active"); };
        const stopSprint = (e) => { if (e) e.preventDefault(); InputState.touchSprint = false; UI.btnSprint.classList.remove("active"); };
        UI.btnSprint.addEventListener("pointerdown", startSprint);
        UI.btnSprint.addEventListener("pointerup", stopSprint);
        UI.btnSprint.addEventListener("pointerleave", stopSprint);
        UI.btnSprint.addEventListener("pointercancel", stopSprint);
    }

    if (UI.btnMap) {
        UI.btnMap.addEventListener("click", () => {
            SoundFX.unlock();
            if (window.__heloraScene) window.__heloraScene.openMarauderMap();
        });
    }

    if (UI.btnCloseMap) {
        UI.btnCloseMap.addEventListener("click", () => {
            UI.mapOverlay.classList.add("hidden");
            if (window.__heloraScene && window.__heloraScene.state === "MODAL") {
                window.__heloraScene.state = "WALKING";
            }
        });
    }

    if (UI.btnFreeRoam) {
        UI.btnFreeRoam.addEventListener("click", () => {
            UI.cardOverlay.classList.add("hidden");
            UI.controlsBar.classList.remove("hidden");
            if (window.__heloraScene) {
                window.__heloraScene.state = "WALKING";
            }
        });
    }

    // Joystick Analógico Virtual 360° (touch + mouse)
    if (UI.joystickZone && UI.joystickKnob) {
        let joyPointerId = null;
        const maxR = 34;

        const updateJoystick = (clientX, clientY) => {
            const rect = UI.joystickZone.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            let dx = clientX - cx;
            let dy = clientY - cy;
            const dist = Math.hypot(dx, dy);
            if (dist > maxR) {
                dx = (dx / dist) * maxR;
                dy = (dy / dist) * maxR;
            }
            UI.joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
            InputState.joyX = dx / maxR;
            InputState.joyY = dy / maxR;
        };

        const resetJoystick = () => {
            joyPointerId = null;
            InputState.joyActive = false;
            InputState.joyX = 0;
            InputState.joyY = 0;
            UI.joystickKnob.style.transform = "translate(0px, 0px)";
        };

        UI.joystickZone.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            e.stopPropagation();
            SoundFX.unlock();
            joyPointerId = e.pointerId;
            InputState.joyActive = true;
            InputState.pointerWalk = false;
            UI.joystickZone.setPointerCapture(e.pointerId);
            updateJoystick(e.clientX, e.clientY);
        });

        UI.joystickZone.addEventListener("pointermove", (e) => {
            if (!InputState.joyActive || e.pointerId !== joyPointerId) return;
            e.preventDefault();
            updateJoystick(e.clientX, e.clientY);
        });

        UI.joystickZone.addEventListener("pointerup", (e) => {
            if (e.pointerId !== joyPointerId) return;
            resetJoystick();
        });
        UI.joystickZone.addEventListener("pointercancel", resetJoystick);
    }

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
        scene: [HogwartsOverworldScene]
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
