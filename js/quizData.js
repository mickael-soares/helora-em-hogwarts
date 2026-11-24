// Dados editáveis das 5 Fases (1 background exclusivo por fase) e do Cartão da Helora
window.HELORA_QUIZ_DATA = {
    playerName: "Helora",
    house: "Sonserina",

    // 5 Fases sequenciais — cada uma com seu próprio cenário único, sem cortar nem duplicar
    quizzes: [
        {
            id: 1,
            bgKey: "bg_diagon_alley",
            indoor: false,
            propKey: "prop_platform",
            location: "Beco Diagonal",
            subtitle: "Onde toda jornada bruxa começa ✨",
            question: "Em qual famosa loja do Beco Diagonal os bruxos compram sua primeira varinha?",
            options: [
                "Olivaras",
                "Dedosdemel",
                "Floreios e Borrões"
            ],
            correctIndex: 0,
            wrongHint: "Quase! Lembre-se: 'A varinha escolhe o bruxo'...",
            successMsg: "Acertou! A varinha escolheu a Helora! +50 pts Sonserina! 🪄✨",
            hasPotion: false,
            miniGame: null
        },
        {
            id: 2,
            bgKey: "bg_forest_rail",
            indoor: false,
            hasTrain: true,
            propKey: "prop_owl",
            location: "Floresta Proibida",
            subtitle: "O Expresso de Hogwarts cruza o viaduto 🚂",
            question: "Qual é o nome da fiel coruja branca de Harry Potter?",
            options: [
                "Edwiges",
                "Bichento",
                "Fawkes"
            ],
            correctIndex: 0,
            wrongHint: "Hmm, esse não é o nome da coruja branca... Tente outro feitiço!",
            successMsg: "Isso mesmo! Edwiges entregou sua carta mágica! +50 pts! 🦉",
            hasPotion: true,
            miniGame: "lumos"
        },
        {
            id: 3,
            bgKey: "bg_quidditch_pitch",
            indoor: false,
            propKey: "prop_snitch",
            location: "Campo de Quadribol",
            subtitle: "A torcida da Sonserina está te esperando 🏆",
            question: "Quantos pontos vale capturar o Pomo de Ouro em uma partida de Quadribol?",
            options: [
                "50 pontos",
                "100 pontos",
                "150 pontos"
            ],
            correctIndex: 2,
            wrongHint: "Vale bem mais do que isso — e ainda encerra a partida!",
            successMsg: "Craque do Quadribol! +50 pts extras para a Sonserina! 🏆",
            hasPotion: false,
            miniGame: "snitch"
        },
        {
            id: 4,
            bgKey: "bg_slytherin_common",
            indoor: true,
            propKey: "prop_hat",
            location: "Sala Comunal da Sonserina",
            subtitle: "Sob as águas esmeralda do Lago Negro 🐍💚",
            question: "Qual é o animal símbolo da casa Sonserina (a casa da Helora)?",
            options: [
                "Corvo",
                "Serpente",
                "Texugo"
            ],
            correctIndex: 1,
            wrongHint: "Pense no emblema verde e prata da casa de Salazar Sonserina...",
            successMsg: "Orgulho da Sonserina! Astúcia, ambição e brilho próprio! 🐍💚",
            hasPotion: true,
            miniGame: null
        },
        {
            id: 5,
            bgKey: "bg_hogwarts_approach",
            indoor: false,
            isFinaleStage: true,
            perspectiveMode: true,
            propKey: "prop_gate",
            location: "Portão de Hogwarts",
            subtitle: "Caminhe rumo aos portões iluminados do Castelo ✨🎂",
            question: "Qual feitiço é usado para acender uma luz brilhante na ponta da varinha?",
            options: [
                "Lumos",
                "Expelliarmus",
                "Alohomora"
            ],
            correctIndex: 0,
            wrongHint: "Você usou esse feitiço na Floresta Proibida!",
            successMsg: "Lumos Maxima! Siga em frente para a grande surpresa! ✨",
            hasPotion: false,
            miniGame: null
        }
    ],

    // Irmão da Helora voando na vassoura (Sonserina)
    brother: {
        name: "Isac",
        greeting: "Feliz aniversário, Helora! Que seu dia seja cheio de magia! ✨💚"
    },

    // Cartão de Feliz Aniversário (edite livremente!)
    birthdayCard: {
        badge: "ESCOLA DE MAGIA E BRUXARIA DE HOGWARTS",
        title: "Feliz Aniversário, Helora!",
        subtitle: "Para a bruxinha mais especial da Sonserina 💚✨",
        message: [
            "Que o seu novo ciclo seja repleto de magia, conquistas incríveis, risadas sinceras e momentos inesquecíveis.",
            "Que nunca faltem feitiços de alegria, coragem para realizar todos os seus sonhos e muita luz em cada passo da sua jornada!",
            "Você merece toda a felicidade do mundo hoje e sempre!"
        ],
        signature: "Com todo carinho — Feliz Aniversário! 🎂🪄"
    }
};
