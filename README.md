# Galactic Duel

<p align="center">
  <strong>Um jogo de luta arcade em pixel art, ambientado em uma galáxia muito, muito distante.</strong>
</p>

<p align="center">
  <img src="public/sprites/galactic-duel-sprite-guide.svg" alt="Guia visual dos sprites de Galactic Duel" width="900" />
</p>

## Sobre

**Galactic Duel** é um fan game de luta 1 × 1 com personagens, arenas e golpes especiais inspirados no universo de Star Wars. Escolha seu combatente, configure a CPU e vença o duelo usando movimentação, defesa e o poder da Força.

O projeto foi construído sem engine externa: os lutadores e suas animações são desenhados em CSS e controlados por React.

## Destaques

- 10 lutadores, cada um com visual, arma e super próprios;
- 4 arenas: Mustafar, Hoth, Endor e Estação Imperial;
- 4 níveis de dificuldade para a CPU;
- combate com vida, barras de Força para jogador e CPU, defesa, salto, agachamento e combo;
- comandos clicáveis na arena para mouse e toque;
- interface e efeitos visuais em estilo pixel art.

## Como jogar

1. No menu, selecione **Iniciar batalha**.
2. Escolha o lutador do Player 1.
3. Clique em **Escolher CPU** no cartão de outro personagem para definir o oponente.
4. Selecione arena e dificuldade.
5. Pressione **Entrar na batalha**.

### Controles

| Ação | Tecla |
| --- | --- |
| Mover para a esquerda / direita | `A` / `D` ou `←` / `→` |
| Agachar | `S` ou `↓` |
| Pular | `W`, `Espaço` ou `↑` |
| Atacar | `J` |
| Defender | `K` |
| Usar super | `L` |
| Pausar / continuar | `Esc` ou botão **Pausar** |

Acertar golpes carrega a barra azul de **Força**. Ao chegar a 100%, pressione `L` para usar o golpe especial do personagem.

Os comandos mostrados abaixo da arena também são botões: segure as direções, **Agacha** ou **Defende** para manter a ação; toque em **Pula**, **Ataca** ou **Super** para acioná-los. Segure uma direção enquanto pula para saltar por cima do adversário; também é possível atravessá-lo caminhando. O botão **Super** só fica disponível com a barra cheia. **Reiniciar round** recomeça apenas o round atual, e **Trocar lutadores** volta à seleção. Use **Pausar** na barra acima da arena ou `Esc` para congelar a batalha, incluindo a CPU e as animações. A tela cheia pode ser ativada ou desativada na mesma barra.

Quando alguém perde toda a vida, o placar é atualizado e o próximo round começa automaticamente após quatro segundos. Você também pode usar **Próximo round** para avançar imediatamente. O número dos rounds, o placar e as barras de Força continuam entre rounds; iniciar outro combate ou reiniciar o round zera as barras. Agachar desvia de tiros comuns; pular desvia de ataques corpo a corpo comuns. Especiais ainda precisam ser defendidos.

Os comandos foram organizados para serem usados com as duas mãos: a esquerda controla movimento com `WASD`, enquanto a direita usa `J`, `K` e `L` para lutar.

### Player arcade

O player no canto inferior direito toca a transmissão oficial ao vivo da **ERICADE Radio**, com chiptune, demoscene e tracker music. Clique no ícone de nota para abrir o player e iniciar o áudio; use `▶` para tocar ou pausar e **VOL** para ajustar o volume. O nome da música, a duração e a barra de progresso são atualizados em tempo real quando a estação troca de faixa. A lista mostra faixas recentes da rádio. Se a transmissão não carregar, o player toca uma trilha arcade original incluída no jogo, mesmo sem internet. Use **Tentar rádio** para voltar à transmissão quando ela estiver disponível.

## Música e API

O player usa a [ERICADE Radio](https://ericade.radio/), uma estação focada em chiptune, demoscene e tracker music. Ao abrir o site, o jogo consulta a API pública da estação para obter as faixas tocadas recentemente, enquanto a reprodução usa o stream oficial ao vivo. Nenhuma chave privada é armazenada no projeto.

- **Transmissão:** stream oficial ao vivo da ERICADE Radio;
- **Lista:** até 8 faixas recentes da estação para descobrir o que está na programação;
- **Documentação:** [API ERICADE Radio](https://api.ericade.net/);
- **Sem conexão:** a trilha original em `public/audio/galactic-duel-theme.wav` é usada quando a transmissão falha. Ela pode ser regenerada com `node scripts/generate_theme.mjs`.

## Lutadores

| Lutador | Super |
| --- | --- |
| Luke Skywalker | Nova Esperança |
| Darth Vader | Asfixia da Força |
| Anakin Skywalker | Fúria do Escolhido |
| Obi-Wan Kenobi | Terreno Elevado |
| Yoda | Turbilhão Ataru |
| Darth Maul | Dança de Dathomir |
| Ahsoka Tano | Caminho de Fulcrum |
| Kylo Ren | Ruptura Instável |
| Rey | Todos os Jedi |
| Boba Fett | Chuva de Beskar |

## Dificuldades da CPU

| Nível | Comportamento |
| --- | --- |
| **Easy** | Faz pausas e escolhas ruins com frequência, se move mais devagar, causa menos dano e raramente defende. |
| **Normal** | Aproxima, recua, ataca, pula e se defende em ritmo equilibrado. |
| **Hard** | Controla melhor a distância, reage aos ataques com defesa e usa especiais com frequência. |
| **Hardcore** | Reage mais cedo, pressiona quase sem pausas, defende mais e usa a barra assim que encontra abertura. |

A CPU procura uma distância adequada à sua arma, alterna aproximação e recuo e só acerta golpes quando o jogador está ao alcance. O alcance dos ataques também depende do tipo de arma e dos atributos de força e agilidade; o golpe só causa dano se o adversário estiver dentro desse alcance no momento do impacto. Ela também acumula Força para usar seu especial; a dificuldade altera o tempo de reação, a velocidade, a agressividade, a defesa e o dano.

## Tecnologias

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- CSS puro para sprites, cenários e animações

## Desenvolvimento local

Instale o Node.js e abra um terminal na pasta `StarWars-Galactic-Duel` (no VS Code: **Terminal → Novo Terminal**). Na primeira vez, instale as dependências:

```bash
pnpm install
```

Depois, inicie o servidor de desenvolvimento do Vite:

```bash
pnpm dev
```

Abra no navegador o endereço mostrado em **Local** no terminal — normalmente `http://localhost:5173/`. Deixe o terminal aberto enquanto joga; alterações no código aparecem automaticamente na página. Para encerrar o servidor, pressione `Ctrl+C` no terminal.

Se não tiver `pnpm`, use `npm install` e `npm run dev` no lugar dos dois comandos acima.

Para criar a versão de produção:

```bash
pnpm build
```

Com `npm`, o comando de produção é `npm run build`.

## Organização do projeto

| Caminho | Responsabilidade |
| --- | --- |
| `src/App.tsx` | Telas, regras do combate, IA e componente dos lutadores. |
| `src/index.css` | Direção visual, sprites em CSS e animações. |
| `public/sprites/` | Guia visual e recursos de referência dos sprites. |
| `public/favicon.svg` | Ícone pixelado da aplicação. |

## Créditos

- [Enzo Toniato](https://github.com/EnzoToniato567)
- [Murilo](https://github.com/Murilo1602)
- [Henrique](https://github.com/HenriqueAlth09)
- [Davi](https://github.com/davi-lm7)

## Aviso legal

Este é um projeto de fã não oficial e sem fins comerciais. Star Wars e seus personagens pertencem aos seus respectivos detentores de direitos. O código, a interface e os sprites deste repositório foram produzidos exclusivamente para fins educacionais e de portfólio.
