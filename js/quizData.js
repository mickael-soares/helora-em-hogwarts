// Dados editáveis do Quiz e do Cartão de Aniversário da Helora
window.HELORA_QUIZ_DATA = {
    playerName: "Helora",
    house: "Sonserina",

    // Os 5 checkpoints ao longo da jornada mágica (mapa estendido ~8600px)
    quizzes: [
        {
            id: 1,
            propKey: "prop_platform",
            location: "Plataforma 9¾",
            worldX: 1350,
            question: "De qual plataforma parte o Expresso de Hogwarts na estação King's Cross?",
            options: [
                "Plataforma 7½",
                "Plataforma 9¾",
                "Plataforma 10¼"
            ],
            correctIndex: 1,
            wrongHint: "Quase! Tente atravessar a parede entre as plataformas 9 e 10...",
            successMsg: "Perfeito! +50 pts para a Sonserina! Embarque rumo a Hogwarts! ✨"
        },
        {
            id: 2,
            propKey: "prop_owl",
            location: "Floresta Proibida",
            worldX: 2800,
            question: "Qual é o nome da fiel coruja branca de Harry Potter?",
            options: [
                "Edwiges",
                "Bichento",
                "Fawkes"
            ],
            correctIndex: 0,
            wrongHint: "Hmm, esse não é o nome da coruja branca... Tente outro feitiço!",
            successMsg: "Isso mesmo! +50 pts para a Sonserina! Edwiges entregou sua carta! 🦉"
        },
        {
            id: 3,
            propKey: "prop_snitch",
            location: "Campo de Quadribol",
            worldX: 4250,
            question: "Quantos pontos vale capturar o Pomo de Ouro em uma partida de Quadribol?",
            options: [
                "50 pontos",
                "100 pontos",
                "150 pontos"
            ],
            correctIndex: 2,
            wrongHint: "Vale bem mais do que isso — e ainda encerra a partida!",
            successMsg: "Pegou o Pomo de Ouro! +50 pts extras para a Sonserina! 🏆"
        },
        {
            id: 4,
            propKey: "prop_hat",
            location: "Corredores de Hogwarts",
            worldX: 5700,
            question: "Qual é o animal símbolo da casa Sonserina (a casa da Helora)?",
            options: [
                "Corvo",
                "Serpente",
                "Texugo"
            ],
            correctIndex: 1,
            wrongHint: "Pense no emblema verde e prata da casa de Salazar Sonserina...",
            successMsg: "Orgulho da Sonserina! +50 pts! Astúcia, ambição e brilho próprio! 🐍💚"
        },
        {
            id: 5,
            propKey: "prop_gate",
            location: "Portão do Salão Principal",
            worldX: 7150,
            question: "Qual feitiço é usado para acender uma luz na ponta da varinha?",
            options: [
                "Lumos",
                "Expelliarmus",
                "Alohomora"
            ],
            correctIndex: 0,
            wrongHint: "Esse feitiço faz outra coisa! Pense em iluminar o caminho...",
            successMsg: "Lumos Maxima! +50 pts! Siga em frente para a grande surpresa! ✨"
        }
    ],

    // Posição da chegada mágica após o 5º quiz (onde Isac invoca o bolo!)
    finaleX: 8120,

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
