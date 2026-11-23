# Helora em Hogwarts ✨🐍

Mini-jogo interativo 2D em estilo chibi inspirado no universo de Harry Potter (Casa Sonserina), feito especialmente para o aniversário da **Helora**.

## Recursos
- **Trajeto 2D com Parallax:** 5 trechos temáticos com atmosfera própria, estrelas coletáveis (Taça das Casas — Sonserina) e 5 quizzes em pergaminho.
- **Personagens:** Helora (Sonserina), gatinho laranjinha acompanhando o trajeto e Isac voando na vassoura ao fundo e invocando magicamente o bolo + cartão no final.
- **Trilha Sonora & Efeitos:** valsa mágica de celesta em 3/4 via Web Audio API (100% offline, com botão de mudo).
- **PC + Celular:** jogue com `→` / `D` ou segurando o botão **Andar ➜** na tela.

## Estrutura
- `index.html` — Entrada do jogo (compatível com GitHub Pages e `file://`)
- `css/style.css` — Interface em pergaminho, HUD da Sonserina e cartão de aniversário
- `js/quizData.js` — Perguntas do quiz, fala do Isac e texto editável do cartão
- `js/music.js` — Trilha sonora mágica (Web Audio API)
- `js/game.js` — Motor Phaser 3
- `js/assets_data.js` — Assets embutidos em base64 (zero CORS)
- `assets/` — Sprites originais organizados por categoria

## Jogar
- Localmente: abra `index.html` no navegador.
- Online (GitHub Pages): `https://mickael-soares.github.io/helora-em-hogwarts/`
