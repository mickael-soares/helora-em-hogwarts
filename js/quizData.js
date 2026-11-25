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
    southPortalPos: { x: 1280, y: 1380 },

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
                    y: 535,
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
                    x: 2145,
                    y: 865,
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
                    y: 290,
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
        ],
        // Convidados especiais sentados nas cadeiras verdes da mesa principal do Salão Principal!
        seatedGuests: [
            {
                id: "lidiane",
                spriteKey: "npc_lidiane",
                name: "Sra. Lidiane",
                x: 1226,
                y: 152,
                interactX: 1215,
                interactY: 278,
                label: "💬 Falar com Sra. Lidiane",
                title: "💚 Sra. Lidiane • Salão Principal",
                text: "Um brinde à nossa estrela da Sonserina! Feliz Aniversário, Helora! Que sua vida seja sempre repleta de amor, saúde e muita magia! 🥂✨💚"
            },
            {
                id: "denis",
                spriteKey: "npc_denis",
                name: "Denis",
                x: 1334,
                y: 152,
                interactX: 1345,
                interactY: 278,
                label: "💬 Falar com Denis",
                title: "💚 Denis • Salão Principal",
                text: "Feliz Aniversário, Helora! Que honra comemorar esse dia especial aqui no Salão Principal de Hogwarts! Aproveite cada segundo dessa aventura! 🎉💚✨"
            }
        ]
    },

    // 3º Mundo Aberto: Setor Sul — Vila de Hogsmeade, Cabana do Hagrid & Estação do Expresso!
    hogsmeadeWorld: {
        bgKey: "hogsmeade_map",
        startPos: { x: 1280, y: 345 },
        northPortalPos: { x: 1280, y: 255 },
        zones: [
            {
                id: "hogsmeade_village",
                location: "Vila de Hogsmeade • Dedosdemel",
                regionCenter: { x: 560, y: 820 },
                travelPos: { x: 640, y: 850 },
                quiz: {
                    id: 9,
                    propKey: "prop_platform",
                    location: "Vila de Hogsmeade",
                    x: 520,
                    y: 790,
                    question: "Qual famosa bebida quentinha os bruxos adoram pedir no Três Vassouras em Hogsmeade?",
                    options: [
                        "Cerveja Amanteigada",
                        "Suco de Uva Mágica",
                        "Chá de Mandrágora"
                    ],
                    correctIndex: 0,
                    wrongHint: "É docinha, cremosa e tem 'manteiga' no nome!",
                    successMsg: "Isso mesmo! Uma Cerveja Amanteigada para comemorar! +75 pts! 🍺✨"
                },
                exploreSpot: {
                    x: 420,
                    y: 660,
                    label: "🍬 Vitrine da Dedosdemel",
                    title: "Dedosdemel • Loja de Doces",
                    text: "Sapos de Chocolate, Feijõezinhos de Todos os Sabores e uma caixa dourada especial reservada para o aniversário da Helora! 🍬🍫✨"
                }
            },
            {
                id: "hagrid_hut",
                location: "Cabana do Hagrid",
                regionCenter: { x: 2020, y: 690 },
                travelPos: { x: 1860, y: 830 },
                quiz: {
                    id: 10,
                    propKey: "prop_owl",
                    location: "Cabana do Hagrid",
                    x: 1965,
                    y: 685,
                    question: "Qual criatura mágica gigante o Hagrid adotou e cuidou com todo carinho na Floresta?",
                    options: [
                        "Bicuço (Hipogrifo)",
                        "Basilisco",
                        "Dementador"
                    ],
                    correctIndex: 0,
                    wrongHint: "Você precisa fazer uma reverência educada antes de montar nele!",
                    successMsg: "Acertou! Bicuço faz uma reverência para a Helora! +75 pts! 🦅✨"
                },
                secretNote: {
                    id: 8,
                    x: 1810,
                    y: 620,
                    title: "💌 Bilhete do Hagrid — Horta de Abóboras",
                    text: "Você é uma bruxinha de ouro, Helora! Deixei um pedaço enorme de bolo esperando por você no Castelo! — Com carinho, Hagrid 🎃🎂"
                }
            },
            {
                id: "hogsmeade_station",
                location: "Estação do Expresso de Hogwarts",
                regionCenter: { x: 1740, y: 1120 },
                travelPos: { x: 1560, y: 1040 },
                exploreSpot: {
                    x: 1720,
                    y: 1065,
                    label: "🚂 Expresso de Hogwarts",
                    title: "Plataforma de Hogsmeade",
                    text: "A locomotiva vermelha solta fumaça branca perfumada sob as estrelas. Próxima parada: um novo ano cheio de conquistas para a Helora! 🚂✨"
                }
            }
        ],
        stars: [
            { x: 1280, y: 470 }, { x: 1280, y: 670 }, { x: 1280, y: 880 },
            { x: 1020, y: 880 }, { x: 780, y: 880 }, { x: 460, y: 1080 },
            { x: 260, y: 1260 }, { x: 1540, y: 920 }, { x: 1820, y: 950 },
            { x: 2120, y: 960 }, { x: 1950, y: 780 }, { x: 640, y: 720 }
        ],
        potions: [
            { x: 960, y: 1015 }
        ],
        doors: [
            { x: 345, y: 660, label: "🍬 Entrar na Dedosdemel", targetRoom: "honeydukes" },
            { x: 815, y: 710, label: "🍺 Entrar no Três Vassouras", targetRoom: "three_broomsticks" },
            { x: 2010, y: 615, label: "🏡 Entrar na Cabana do Hagrid", targetRoom: "hagrid_hut" },
            { x: 185, y: 1320, label: "🌿 Ir para Estufas de Herbologia", targetRoom: "greenhouses" }
        ]
    },

    // 4 Novos Cenários Conectados (3 Interiores + Estufas de Herbologia & Cais do Lago!)
    rooms: {
        three_broomsticks: {
            bgKey: "interior_three_broomsticks",
            title: "🍺 Taverna Três Vassouras",
            isOutdoor: false,
            musicWorld: "castle",
            startPos: { x: 1280, y: 1180 },
            exitPortal: { x: 1280, y: 1345, label: "🚪 Sair para Hogsmeade", returnWorld: "hogsmeade", returnPos: { x: 815, y: 765 } },
            solids: [
                { x1: 0, y1: 0, x2: 2560, y2: 595 },       // Parede do fundo + janelas + lareira
                { x1: 0, y1: 500, x2: 830, y2: 1265 },     // Balcão de madeira e banquetas esquerda
                { x1: 1840, y1: 0, x2: 2560, y2: 650 },    // Escada de madeira à direita
                { x1: 1525, y1: 600, x2: 1920, y2: 910 },  // Mesa superior direita
                { x1: 1620, y1: 910, x2: 2070, y2: 1275 }, // Mesa inferior direita
                { x1: 2080, y1: 635, x2: 2560, y2: 1265 }, // Mesas da parede direita
                { x1: 0, y1: 1320, x2: 1120, y2: 1440 },   // Parede inferior esquerda da porta
                { x1: 1440, y1: 1320, x2: 2560, y2: 1440 } // Parede inferior direita da porta
            ],
            flames: [
                { x: 1280, y: 500, s: 1.15 }, // Lareira central acesa!
                { x: 1715, y: 650, s: 0.42 }, // Vela mesa superior
                { x: 1860, y: 985, s: 0.42 }, // Vela mesa inferior
                { x: 2345, y: 650, s: 0.42 }, // Vela mesa direita
                { x: 2525, y: 980, s: 0.40 }  // Vela canto inferior direito
            ],
            stars: [
                { x: 1180, y: 760 }, { x: 1420, y: 760 }, { x: 1280, y: 980 }, { x: 1020, y: 1140 }
            ],
            exploreSpots: [
                {
                    x: 920, y: 860, label: "🍺 Balcão da Cerveja Amanteigada",
                    title: "Três Vassouras • Madame Rosmerta",
                    text: "Canecas quentinhas de Cerveja Amanteigada espumando no balcão! 'Por conta da casa hoje, feliz aniversário Helora!' 🍺✨"
                },
                {
                    x: 1280, y: 640, label: "🔥 Lareira Aconchegante",
                    title: "Lareira do Três Vassouras",
                    text: "O fogo crepita suavemente aquecendo toda a taverna. O gatinho laranjinha se espreguiça pertinho do tapete! 🐱🔥"
                }
            ]
        },

        honeydukes: {
            bgKey: "interior_honeydukes",
            title: "🍬 Dedosdemel • Loja de Doces",
            isOutdoor: false,
            musicWorld: "castle",
            startPos: { x: 1280, y: 1180 },
            exitPortal: { x: 1280, y: 1345, label: "🚪 Sair para Hogsmeade", returnWorld: "hogsmeade", returnPos: { x: 345, y: 720 } },
            solids: [
                { x1: 0, y1: 0, x2: 2560, y2: 755 },        // Balcão central de doces e vitrines
                { x1: 0, y1: 600, x2: 860, y2: 1275 },      // Prateleiras de doces esquerda
                { x1: 1960, y1: 520, x2: 2560, y2: 1440 },  // Barris e caixotes de doces direita
                { x1: 1680, y1: 1190, x2: 2560, y2: 1440 }, // Caixotes inferiores direita
                { x1: 0, y1: 1320, x2: 1110, y2: 1440 },    // Parede inferior esquerda da porta
                { x1: 1450, y1: 1320, x2: 2560, y2: 1440 }  // Parede inferior direita da porta
            ],
            flames: [
                { x: 675, y: 270, s: 0.50 },
                { x: 1280, y: 215, s: 0.55 },
                { x: 1925, y: 215, s: 0.50 }
            ],
            stars: [
                { x: 1050, y: 860 }, { x: 1280, y: 860 }, { x: 1520, y: 860 }, { x: 1740, y: 980 }
            ],
            exploreSpots: [
                {
                    x: 1280, y: 790, label: "🍫 Vitrine de Tortas e Sapos de Chocolate",
                    title: "Dedosdemel • Especial de Aniversário",
                    text: "Você abre um Sapo de Chocolate e vem a figurinha rara mais valiosa de Hogwarts: 'Helora da Sonserina — A Bruxinha Mais Especial!' 🍫🐸✨"
                },
                {
                    x: 1860, y: 820, label: "🍬 Barris de Feijõezinhos",
                    title: "Feijõezinhos de Todos os Sabores",
                    text: "Você experimenta um feijãozinho verde-esmeralda: tem gosto de brigadeiro com brilho mágico! 🍬💚"
                }
            ]
        },

        hagrid_hut: {
            bgKey: "interior_hagrid_hut",
            title: "🏡 Interior da Cabana do Hagrid",
            isOutdoor: false,
            musicWorld: "castle",
            startPos: { x: 1280, y: 1180 },
            exitPortal: { x: 1280, y: 1345, label: "🚪 Sair para Hogsmeade", returnWorld: "hogsmeade", returnPos: { x: 2010, y: 685 } },
            solids: [
                { x1: 0, y1: 0, x2: 2560, y2: 695 },        // Parede do fundo + lareira + cestinha
                { x1: 0, y1: 580, x2: 960, y2: 1265 },      // Cama de retalhos e baús à esquerda
                { x1: 1750, y1: 680, x2: 2560, y2: 1320 },  // Mesa de chá e cadeiras à direita
                { x1: 0, y1: 1320, x2: 1110, y2: 1440 },    // Parede inferior esquerda da porta
                { x1: 1450, y1: 1320, x2: 2560, y2: 1440 }  // Parede inferior direita da porta
            ],
            flames: [
                { x: 1280, y: 550, s: 1.05 }, // Fogo sob o caldeirão da lareira
                { x: 705, y: 245, s: 0.48 },
                { x: 2065, y: 390, s: 0.48 }
            ],
            cauldrons: [
                { x: 1280, y: 475, r: 34 }    // Caldeirão borbulhando na lareira do Hagrid!
            ],
            stars: [
                { x: 1120, y: 840 }, { x: 1440, y: 840 }, { x: 1280, y: 1020 }, { x: 1580, y: 1120 }
            ],
            exploreSpots: [
                {
                    x: 1680, y: 920, label: "🍪 Mesa de Chá do Hagrid",
                    title: "Biscoitos do Hagrid",
                    text: "Bule fumegante e biscoitos caseiros quentinhos na mesa! Um bilhetinho diz: 'Para a Helora e seu gatinho recuperarem as energias!' ☕🍪"
                },
                {
                    x: 1280, y: 740, label: "🍲 Caldeirão na Lareira",
                    title: "Cozinha Mágica do Hagrid",
                    text: "O caldeirão borbulha alegremente sobre o fogo com aroma de canela e abóbora doce! 🎃🔥"
                }
            ]
        },

        greenhouses: {
            bgKey: "greenhouse_grounds_map",
            title: "🌿 Estufas de Herbologia & Cais do Lago",
            isOutdoor: true,
            musicWorld: "valley",
            startPos: { x: 340, y: 1280 },
            exitPortal: { x: 195, y: 1350, label: "🏘️ Voltar para Hogsmeade", returnWorld: "hogsmeade", returnPos: { x: 295, y: 1235 } },
            solids: [
                { x1: 0, y1: 0, x2: 2560, y2: 430 },        // Muralhas do Castelo e horizonte norte
                { x1: 0, y1: 280, x2: 775, y2: 720 },       // Estufas de Herbologia (vidro)
                { x1: 0, y1: 720, x2: 330, y2: 1180 },      // Estufa inferior esquerda
                { x1: 1840, y1: 690, x2: 2560, y2: 1440 },  // Águas do Lago Negro (deixa o cais x:1780..2030 acessível na borda!)
                { x1: 2040, y1: 350, x2: 2560, y2: 690 }    // Muralha do arco do Quadribol
            ],
            flames: [
                { x: 1158, y: 495, s: 0.62 }, // Braseiro superior esquerdo
                { x: 1482, y: 495, s: 0.62 }, // Braseiro superior direito
                { x: 1138, y: 650, s: 0.65 }, // Braseiro inferior esquerdo
                { x: 1502, y: 650, s: 0.65 }, // Braseiro inferior direito
                { x: 1110, y: 1135, s: 0.50 },
                { x: 1530, y: 1135, s: 0.50 }
            ],
            stars: [
                { x: 560, y: 1120 }, { x: 860, y: 940 }, { x: 1280, y: 1080 },
                { x: 1280, y: 820 }, { x: 1320, y: 560 }, { x: 1680, y: 560 },
                { x: 1960, y: 520 }, { x: 1720, y: 960 }
            ],
            exploreSpots: [
                {
                    x: 720, y: 740, label: "🌿 Estufa de Herbologia",
                    title: "Estufas da Professora Sprout",
                    text: "Através dos vidros iluminados, plantas mágicas bioluminescentes florescem em azul e esmeralda celebrando o dia da Helora! 🌱✨"
                },
                {
                    x: 1810, y: 1020, label: "🌊 Cais do Lago Negro",
                    title: "Píer Estrelado",
                    text: "As estrelas do céu refletem na água calma do lago. Um lugar perfeito para fazer um pedido de aniversário! 🌟🌊"
                }
            ]
        }
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
