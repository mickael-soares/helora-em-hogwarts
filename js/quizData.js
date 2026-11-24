// Dados editáveis do Mundo Aberto Top-Down 3/4 (2560x1440) e Cartão da Helora
window.HELORA_QUIZ_DATA = {
    playerName: "Helora",
    house: "Sonserina",
    worldWidth: 2560,
    worldHeight: 1440,
    startPos: { x: 640, y: 1230 },
    finalePos: { x: 1280, y: 425 },
    broomPos: { x: 2285, y: 425 },
    towerPortalPos: { x: 1280, y: 210 },

    // 5 Regiões no mesmo mapa contínuo — 100% abertas desde o início!
    quizzes: [
        {
            id: 1,
            propKey: "prop_platform",
            location: "Beco Diagonal",
            subtitle: "Praça mágica onde a jornada começa ✨",
            regionCenter: { x: 520, y: 1210 },
            travelPos: { x: 640, y: 1230 },
            quizPos: { x: 455, y: 1175 },
            question: "Em qual famosa loja do Beco Diagonal os bruxos compram sua primeira varinha?",
            options: [
                "Olivaras",
                "Dedosdemel",
                "Floreios e Borrões"
            ],
            correctIndex: 0,
            wrongHint: "Quase! Lembre-se: 'A varinha escolhe o bruxo'...",
            successMsg: "Acertou! A varinha escolheu a Helora! +50 pts Sonserina! 🪄✨",
            miniGame: null,
            secretNote: {
                x: 260,
                y: 1255,
                title: "💌 Bilhete Secreto #1 — Beco Diagonal",
                text: "Assim como a varinha certa escolhe o bruxo, você ilumina qualquer lugar onde chega, Helora! ✨"
            },
            exploreSpots: [
                {
                    x: 720,
                    y: 1130,
                    label: "🪄 Vitrine de Varinhas",
                    title: "Loja de Varinhas Olivaras",
                    text: "Na vitrine brilha uma caixa verde-esmeralda com uma nota: 'Feita sob medida para uma bruxinha brilhante da Sonserina!'"
                }
            ]
        },
        {
            id: 2,
            propKey: "prop_owl",
            location: "Floresta Proibida",
            subtitle: "Cogumelos luminosos e o viaduto do Expresso 🚂",
            regionCenter: { x: 2020, y: 1080 },
            travelPos: { x: 1740, y: 1140 },
            quizPos: { x: 2040, y: 1025 },
            question: "Qual é o nome da fiel coruja branca de Harry Potter?",
            options: [
                "Edwiges",
                "Bichento",
                "Fawkes"
            ],
            correctIndex: 0,
            wrongHint: "Hmm, esse não é o nome da coruja branca... Tente outro feitiço!",
            successMsg: "Isso mesmo! Edwiges entregou sua carta mágica! +50 pts! 🦉",
            miniGame: "lumos",
            lumosZone: { x: 1875, y: 1085, radius: 175 },
            secretNote: {
                x: 2155,
                y: 1115,
                title: "💌 Bilhete Secreto #2 — Floresta Proibida",
                text: "Mesmo nos caminhos misteriosos, sua luz própria (e seu gatinho laranjinha!) sempre mostram a direção certa! 🐱💚"
            },
            exploreSpots: [
                {
                    x: 2215,
                    y: 1030,
                    label: "🚂 Mirante do Viaduto",
                    title: "Viaduto do Expresso de Hogwarts",
                    text: "Você escuta o apito distante do Expresso passando pelos trilhos de pedra rumo ao castelo!"
                }
            ]
        },
        {
            id: 3,
            propKey: "prop_snitch",
            location: "Campo de Quadribol",
            subtitle: "A torcida da Sonserina está te esperando 🏆",
            regionCenter: { x: 2160, y: 390 },
            travelPos: { x: 1920, y: 565 },
            quizPos: { x: 2205, y: 365 },
            question: "Quantos pontos vale capturar o Pomo de Ouro em uma partida de Quadribol?",
            options: [
                "50 pontos",
                "100 pontos",
                "150 pontos"
            ],
            correctIndex: 2,
            wrongHint: "Vale bem mais do que isso — e ainda encerra a partida!",
            successMsg: "Craque do Quadribol! +50 pts extras para a Sonserina! 🏆",
            miniGame: "snitch",
            snitchZone: { x: 2040, y: 475, radius: 165 },
            secretNote: {
                x: 2350,
                y: 295,
                title: "💌 Bilhete Secreto #3 — Campo de Quadribol",
                text: "Que nesse novo ano você voe alto e conquiste todos os seus 'Pomos de Ouro' — sem medo de sonhar grande! 🏆✨"
            },
            exploreSpots: [
                {
                    x: 1990,
                    y: 335,
                    label: "🐍 Torcida Sonserina",
                    title: "Torres da Sonserina",
                    text: "Os estandartes verdes e prateados balançam ao vento celebrando a melhor apanhadora do dia: Helora!"
                }
            ]
        },
        {
            id: 4,
            propKey: "prop_hat",
            location: "Lago Negro • Sonserina",
            subtitle: "Arco mágico às margens esmeralda do Lago Negro 🐍💚",
            regionCenter: { x: 480, y: 515 },
            travelPos: { x: 760, y: 650 },
            quizPos: { x: 430, y: 505 },
            question: "Qual é o animal símbolo da casa Sonserina (a casa da Helora)?",
            options: [
                "Corvo",
                "Serpente",
                "Texugo"
            ],
            correctIndex: 1,
            wrongHint: "Pense no emblema verde e prata da casa de Salazar Sonserina...",
            successMsg: "Orgulho da Sonserina! Astúcia, ambição e brilho próprio! 🐍💚",
            miniGame: null,
            secretNote: {
                x: 645,
                y: 575,
                title: "💌 Bilhete Secreto #4 — Lago Negro",
                text: "Às margens esmeralda do Lago Negro, tem gente que te admira muito e torce sempre pela sua felicidade! 💚🌊"
            },
            exploreSpots: [
                {
                    x: 505,
                    y: 445,
                    label: "🌊 Margem Esmeralda",
                    title: "Águas do Lago Negro",
                    text: "As águas brilham em verde-esmeralda refletindo o céu estrelado. O gatinho ronrona feliz olhando os reflexos!"
                }
            ]
        },
        {
            id: 5,
            propKey: "prop_gate",
            location: "Castelo de Hogwarts",
            subtitle: "Portão principal e o Pátio da grande surpresa ✨🎂",
            regionCenter: { x: 1280, y: 510 },
            travelPos: { x: 1280, y: 720 },
            quizPos: { x: 1280, y: 615 },
            question: "Qual feitiço é usado para acender uma luz brilhante na ponta da varinha?",
            options: [
                "Lumos",
                "Expelliarmus",
                "Alohomora"
            ],
            correctIndex: 0,
            wrongHint: "Você usou esse feitiço na Floresta Proibida!",
            successMsg: "Lumos Maxima! Complete os 5 quizzes e entre no Pátio do Castelo! ✨",
            miniGame: null,
            secretNote: {
                x: 1120,
                y: 440,
                title: "💌 Bilhete Secreto #5 — Pátio de Hogwarts",
                text: "Última pista antes da surpresa: olhe para o céu de Hogwarts — tem alguém numa vassoura esperando por você! 🧹🎂"
            },
            exploreSpots: []
        }
    ],

    // Poções Felix Felicis espalhadas pelo vale
    potions: [
        { id: 0, x: 1775, y: 1170 },
        { id: 1, x: 945, y: 720 }
    ],

    // Estrelas mágicas espalhadas pelas estradas de pedra (guiam a exploração!)
    stars: [
        // Beco Diagonal -> Avenida Central
        { x: 540, y: 1245 },
        { x: 830, y: 1235 },
        { x: 1080, y: 1235 },
        // Avenida Central (Sul -> Norte)
        { x: 1280, y: 1110 },
        { x: 1280, y: 940 },
        { x: 1280, y: 785 },
        // Rumo à Floresta Proibida (SE)
        { x: 1520, y: 1220 },
        { x: 1850, y: 1095 },
        { x: 2095, y: 1065 },
        // Rumo ao Campo de Quadribol (NE)
        { x: 1560, y: 725 },
        { x: 1845, y: 635 },
        { x: 2110, y: 425 },
        { x: 2295, y: 345 },
        // Rumo ao Lago Negro (NW)
        { x: 1020, y: 725 },
        { x: 750, y: 630 },
        { x: 540, y: 545 },
        // Pátio de Hogwarts
        { x: 1200, y: 465 },
        { x: 1365, y: 465 }
    ],

    // 3 estrelas secretas reveladas pelo Lumos na Floresta Proibida
    lumosStars: [
        { x: 1930, y: 1010 },
        { x: 2010, y: 1125 },
        { x: 2115, y: 985 }
    ],

    // 2º Mundo Aberto: Interior do Castelo de Hogwarts (acesso voando até a Torre!)
    castleWorld: {
        bgKey: "castle_interior_map",
        startPos: { x: 1280, y: 1125 },
        exitPortalPos: { x: 1280, y: 1320 },
        wings: [
            {
                id: "astronomy",
                location: "Torre de Astronomia",
                regionCenter: { x: 1280, y: 1120 },
                travelPos: { x: 1280, y: 1125 },
                exploreSpot: {
                    x: 1475,
                    y: 1090,
                    label: "🔭 Telescópio Mágico",
                    title: "Torre de Astronomia",
                    text: "Pelo telescópio encantado, as estrelas desenham o nome 'HELORA' brilhando sobre todo o vale de Hogwarts! ✨"
                }
            },
            {
                id: "library",
                location: "Biblioteca • Seção Reservada",
                regionCenter: { x: 400, y: 740 },
                travelPos: { x: 455, y: 760 },
                quiz: {
                    id: 6,
                    propKey: "prop_owl",
                    location: "Biblioteca de Hogwarts",
                    x: 390,
                    y: 725,
                    question: "Qual livro mágico mostra onde cada pessoa está dentro do Castelo de Hogwarts?",
                    options: [
                        "O Mapa do Maroto",
                        "O Livro Monstruoso dos Monstros",
                        "Hogwarts: Uma História"
                    ],
                    correctIndex: 0,
                    wrongHint: "Dica: você usa ele aqui no jogo apertando M! 🗺️",
                    successMsg: "Malfeito Feito! +75 pts bônus para a Sonserina! 🗺️✨"
                },
                secretNote: {
                    id: 6,
                    x: 425,
                    y: 410,
                    title: "💌 Pergaminho Secreto — Biblioteca",
                    text: "Você descobriu a Seção Reservada! Que a curiosidade e a sabedoria abram todas as portas incríveis da sua vida, Helora! 📚💚"
                }
            },
            {
                id: "potions",
                location: "Masmorras de Poções",
                regionCenter: { x: 2140, y: 740 },
                travelPos: { x: 2050, y: 760 },
                quiz: {
                    id: 7,
                    propKey: "decor_potion",
                    location: "Masmorras de Poções",
                    x: 2145,
                    y: 440,
                    question: "Qual poção dourada concede sorte extraordinária a quem a bebe?",
                    options: [
                        "Poção Polissuco",
                        "Felix Felicis",
                        "Veritaserum"
                    ],
                    correctIndex: 1,
                    wrongHint: "Também conhecida como 'Sorte Líquida'...",
                    successMsg: "Perfeito! Felix Felicis — sorte pura no seu novo ano! +75 pts! 🧪✨"
                },
                exploreSpot: {
                    x: 2240,
                    y: 855,
                    label: "🧪 Caldeirão Borbulhante",
                    title: "Aula de Poções da Sonserina",
                    text: "Um caldeirão borbulha em verde-esmeralda liberando cheiro de bolo de aniversário recém-assado! 🎂💚"
                }
            },
            {
                id: "great_hall",
                location: "Salão Principal • Sonserina",
                regionCenter: { x: 1280, y: 380 },
                travelPos: { x: 1280, y: 540 },
                quiz: {
                    id: 8,
                    propKey: "prop_hat",
                    location: "Salão Principal",
                    x: 1280,
                    y: 350,
                    question: "Qual objeto mágico escolhe a casa de cada estudante no Salão Principal?",
                    options: [
                        "O Cálice de Fogo",
                        "O Chapéu Seletor",
                        "O Espelho de Ojesed"
                    ],
                    correctIndex: 1,
                    wrongHint: "Ele fica na cabeça do aluno e grita: SONSERINA!",
                    successMsg: "SONSERINA! O Chapéu Seletor aplaude a Helora! +75 pts! 🎩💚"
                },
                secretNote: {
                    id: 7,
                    x: 1280,
                    y: 235,
                    title: "💌 Carta Real — Salão Principal",
                    text: "Você voou até a Torre e explorou o coração de Hogwarts! Feliz Aniversário, bruxinha incrível — o mundo mágico inteiro comemora com você! 🏰🎂✨"
                }
            }
        ],
        stars: [
            { x: 1280, y: 940 }, { x: 1280, y: 740 }, { x: 1280, y: 560 },
            { x: 960, y: 740 }, { x: 710, y: 740 }, { x: 560, y: 740 },
            { x: 1600, y: 740 }, { x: 1850, y: 740 }, { x: 2010, y: 740 },
            { x: 1280, y: 440 }, { x: 2145, y: 600 }, { x: 425, y: 560 }
        ],
        potions: [
            { x: 2080, y: 950 }
        ]
    },

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
