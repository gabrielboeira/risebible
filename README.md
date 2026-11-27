# Rise Bible

Rise Bible é uma Bíblia digital com devocional diário. Webapp em React + Vite, com login por e-mail e senha e progresso salvo no Supabase. Pode ser instalado na tela inicial do celular.

## O que tem

- **Login e cadastro** (nome, e-mail, senha), reenvio do link de confirmação e recuperação de senha por e-mail.
- **Início:** sequência atual com a chama e a semana (S T Q Q S S D), versículo do dia, botão de check-in e o devocional do dia (reflexão, “Pra pensar”, desafio e oração). A sequência muda de nível conforme os dias seguidos (Brasa, Faísca, Chama, Fogueira, Incêndio e Fogo que não apaga).
- **Check-in (+):** “Como foi seu devocional hoje?”, com texto de até 300 caracteres. Publicar marca o devocional como feito na sequência. O texto fica no Diário. Foto e publicação na comunidade virão com o feed (ver `ROADMAP.md`).
- **Bíblia** completa (Bíblia Livre, CC BY 3.0 BR): destaques em 3 cores, salvar, anotar e copiar. A lupa abre a **busca** em todos os versículos, sem depender de acento.
- **Comunidade:** em breve.
- **Perfil:** nível, sequência, recorde, total de devocionais, capítulos lidos, selos (Day N, Foco, Constância, Presença), calendário do mês e o atalho para **Salvos** (versículos, anotações e diário).

Identidade visual: a do app Flame (laranja `#FF5A1F`, preto `#111111`, creme `#FFF4E8`, verde-limão `#A7FF3D`, Poppins e Inter).

## Rodar no computador

```bash
npm install
npm run dev
```

Sem as chaves do Supabase, o app abre em **modo demonstração**: as contas e o progresso ficam só no navegador.

## Ligar o Supabase

1. Crie um projeto em supabase.com.
2. No **SQL Editor**, rode o arquivo `supabase/schema.sql`. Ele cria as tabelas, as regras de segurança (cada adolescente só vê os próprios dados) e o perfil automático no cadastro.
3. Em **Authentication → Providers → Email**, deixe o e-mail ligado. Escolha se quer exigir confirmação de e-mail (mais seguro, mas alguns adolescentes travam nessa etapa). O app trata os dois casos.
4. Em **Authentication → URL Configuration**, coloque a URL do app (ex.: `https://rise.vercel.app`) em *Site URL* e em *Redirect URLs*. Isso faz o link de recuperação de senha funcionar.
5. Copie `.env.example` para `.env.local` e preencha com a *Project URL* e a *anon public key* (Project Settings → API).

## Publicar na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Na Vercel: *Add New → Project*, escolha o repositório (o framework é detectado como Vite).
3. Em *Environment Variables*, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Faça o deploy.

## Estrutura

```
public/data/biblia.json        texto bíblico (66 livros, 31.104 versículos)
public/data/devocionais.json   31 devocionais (rodam em ciclo pela data)
public/icons/                  logos e ícones do app
src/lib/backend.js             Supabase ou modo demonstração (mesma API)
src/lib/bible.js               Bíblia, datas, sequência e seus níveis
src/screens/                   Login, Início, Check-in, Bíblia, Buscar, Comunidade, Salvos, Perfil
supabase/schema.sql            tabelas + RLS + trigger de perfil
```

## Editar os devocionais

Cada item de `public/data/devocionais.json` tem:
`t` título · `r` referência (ex.: `Jo 3:16` ou `Fp 4:6-7`, abreviações do `biblia.json`) · `x` reflexão · `p` pergunta · `d` desafio · `o` oração.
O devocional do dia é escolhido pela data, então todo mundo vê o mesmo no mesmo dia.

## Licença do texto bíblico

Bíblia Livre © Diego Santos, Mario Sérgio e Marco Teles, licença Creative Commons Atribuição 3.0 Brasil. O crédito aparece no leitor e no perfil.
