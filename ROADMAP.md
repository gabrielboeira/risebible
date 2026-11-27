# Rise Bible · próxima fase

Ideias anotadas em 27/11/2026 para a próxima fase. Ainda não estão priorizadas nem detalhadas.

## Funcionalidades

1. **Perfil personalizado**: foto, bio e música.
2. **Feed**: postar textos e fotos sobre os devocionais.
3. **Desafios**: hoje cada devocional tem um desafio do dia; a ideia é ir além disso.
4. **Planos de leitura**: hoje existe um só ("Marcos em 16 dias", em `src/lib/bible.js`); a ideia é ter vários.
5. **"Você é novo na fé?"**: uma trilha guiada para quem está começando.
6. **Pequenos estudos**: temas de teologia, como escatologia, entre outros.

## Em aberto

- **Devocionais repetindo**: os 31 textos de `public/data/devocionais.json` voltam a cada 31 dias, e um texto é pulado na virada para um ano não bissexto. Caminhos possíveis:
  - escrever 365 textos;
  - dar uma data fixa a cada texto;
  - levar os devocionais para o Supabase, com uma tela de edição.
