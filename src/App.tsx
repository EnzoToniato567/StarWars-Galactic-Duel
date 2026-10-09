// @refresh reset
import { useCallback, useEffect, useRef, useState } from "react";

type Fighter = {
  id: string;
  name: string;
  title: string;
  side: "light" | "dark" | "neutral";
  color: string;
  accent: string;
  skin: string;
  saber: string;
  weapon: "saber" | "dual" | "staff" | "blaster";
  head: "hair" | "hood" | "helmet" | "horns" | "lekku" | "ears";
  superName: string;
  superDescription: string;
  power: number;
  speed: number;
};

const fighters: Fighter[] = [
  { id: "luke", name: "Luke Skywalker", title: "Último Jedi", side: "light", color: "#e5d6ad", accent: "#8c6b39", skin: "#e8b886", saber: "#42b9ff", weapon: "saber", head: "hair", superName: "Nova Esperança", superDescription: "Uma sequência veloz de golpes guiada pela Força.", power: 82, speed: 88 },
  { id: "vader", name: "Darth Vader", title: "Lorde Sith", side: "dark", color: "#171a20", accent: "#707783", skin: "#242830", saber: "#ff334e", weapon: "saber", head: "helmet", superName: "Asfixia da Força", superDescription: "Imobiliza o rival antes de um corte devastador.", power: 96, speed: 62 },
  { id: "anakin", name: "Anakin Skywalker", title: "O Escolhido", side: "light", color: "#332b2a", accent: "#8d5b35", skin: "#e1a878", saber: "#35aaff", weapon: "saber", head: "hair", superName: "Fúria do Escolhido", superDescription: "Converte conflito em uma investida imparável.", power: 90, speed: 82 },
  { id: "obiwan", name: "Obi-Wan Kenobi", title: "Mestre Jedi", side: "light", color: "#d7c5a2", accent: "#845631", skin: "#d99b68", saber: "#3caeff", weapon: "saber", head: "hood", superName: "Terreno Elevado", superDescription: "Defesa perfeita seguida de um contra-ataque preciso.", power: 80, speed: 78 },
  { id: "yoda", name: "Yoda", title: "Grande Mestre", side: "light", color: "#c9b993", accent: "#75964a", skin: "#7ea35b", saber: "#55ef78", weapon: "saber", head: "ears", superName: "Turbilhão Ataru", superDescription: "Um ciclone verde de saltos e cortes em todas as direções.", power: 76, speed: 100 },
  { id: "maul", name: "Darth Maul", title: "Sombra Sith", side: "dark", color: "#1c1b20", accent: "#b52e32", skin: "#bb3336", saber: "#ff3048", weapon: "staff", head: "horns", superName: "Dança de Dathomir", superDescription: "O sabre duplo gira em uma combinação brutal.", power: 92, speed: 90 },
  { id: "ahsoka", name: "Ahsoka Tano", title: "Fulcrum", side: "light", color: "#667a86", accent: "#f1f1df", skin: "#d9783e", saber: "#e7fbff", weapon: "dual", head: "lekku", superName: "Caminho de Fulcrum", superDescription: "Dois sabres brancos cruzam o campo em alta velocidade.", power: 84, speed: 96 },
  { id: "kylo", name: "Kylo Ren", title: "Mestre de Ren", side: "dark", color: "#17171c", accent: "#5d6068", skin: "#d6a17d", saber: "#ff2442", weapon: "saber", head: "hood", superName: "Ruptura Instável", superDescription: "A lâmina rachada explode em três ondas de energia.", power: 94, speed: 72 },
  { id: "rey", name: "Rey", title: "Ascensão Jedi", side: "light", color: "#d5c5a1", accent: "#746b55", skin: "#d7a278", saber: "#ffd83d", weapon: "saber", head: "hair", superName: "Todos os Jedi", superDescription: "A energia dos Jedi amplifica um golpe de luz dourada.", power: 86, speed: 88 },
  { id: "boba", name: "Boba Fett", title: "Caçador de Recompensas", side: "neutral", color: "#566c5c", accent: "#a73b34", skin: "#8e938c", saber: "#ffb136", weapon: "blaster", head: "helmet", superName: "Chuva de Beskar", superDescription: "Jetpack, foguete e rajadas cercam o alvo pelo alto.", power: 88, speed: 74 },
];

type Action = "idle" | "walk" | "attack" | "defend" | "crouch" | "jump" | "special" | "hit" | "ko";
type Screen = "menu" | "select" | "battle";
type Difficulty = "easy" | "normal" | "hard" | "hardcore";

const arenas = [
  { id: "mustafar", name: "Mustafar", subtitle: "Complexo de mineração", tone: "FOGO" },
  { id: "hoth", name: "Hoth", subtitle: "Base Echo", tone: "GELO" },
  { id: "endor", name: "Endor", subtitle: "Lua florestal", tone: "FLORESTA" },
  { id: "deathstar", name: "Estação Imperial", subtitle: "Hangar central", tone: "ESPAÇO" },
] as const;

const difficultyLevels: Record<Difficulty, { label: string; description: string; reaction: number; movement: number; damage: number; aggression: number; guard: number; special: number }> = {
  easy: { label: "Easy", description: "Reage devagar e causa menos dano.", reaction: 1200, movement: .65, damage: .7, aggression: .55, guard: .12, special: 0 },
  normal: { label: "Normal", description: "Combate equilibrado para começar.", reaction: 800, movement: 1, damage: 1, aggression: .74, guard: .24, special: .04 },
  hard: { label: "Hard", description: "Mais rápido, agressivo e defensivo.", reaction: 450, movement: 1.3, damage: 1.18, aggression: .86, guard: .36, special: .12 },
  hardcore: { label: "Hardcore", description: "Sem piedade. Reação contínua e punição severa.", reaction: 160, movement: 1.8, damage: 1.5, aggression: .96, guard: .60, special: .35 },
};

function PixelFighter({ fighter, action, facing = 1, cpu = false }: { fighter: Fighter; action: Action; facing?: number; cpu?: boolean }) {
  const vars = {
    "--outfit": fighter.color,
    "--accent": fighter.accent,
    "--skin": fighter.skin,
    "--saber": fighter.saber,
    "--facing": facing,
  } as React.CSSProperties;

  return (
    <div className={`pixel-fighter ${action} ${fighter.head} ${fighter.weapon} ${fighter.id} ${cpu ? "cpu" : ""}`} style={vars} aria-label={`${fighter.name}, estado ${action}`}>
      <div className="shadow" />
      <div className="sprite">
        {fighter.id === "boba" && <div className="jetpack" />}
        <div className="cape" />
        <div className="head">
          <i className="hair-shape" />
          <i className="brow" />
          <i className="eye" />
          <i className="face-line" />
          <i className="horn h1" /><i className="horn h2" /><i className="horn h3" />
          <i className="ear left" /><i className="ear right" />
          <i className="lekku-tail left" /><i className="lekku-tail right" />
        </div>
        <div className="torso"><i className="chest-detail" /><i className="belt"><b /></i></div>
        <div className="arm arm-back"><i className="glove" /><i className="hand" /></div>
        <div className="arm arm-front"><i className="glove" /><i className="hand" /></div>
        <div className="leg leg-back"><i className="boot" /></div>
        <div className="leg leg-front"><i className="boot" /></div>
        <div className="weapon">
          <i className="hilt" />
          <i className="blade blade-main" />
          {(fighter.weapon === "dual" || fighter.weapon === "staff") && <i className="blade blade-extra" />}
          {fighter.weapon === "blaster" && <i className="bolt" />}
        </div>
        {action === "special" && <div className="force-ring"><i /><i /><i /></div>}
      </div>
    </div>
  );
}

function Bar({ value, kind }: { value: number; kind: "health" | "force" }) {
  return (
    <div className={`bar ${kind}`}>
      <div className="bar-fill" style={{ width: `${Math.max(0, value)}%` }} />
      <div className="bar-grid" />
    </div>
  );
}

function FighterAttributes({ fighter, label, tone }: { fighter: Fighter; label: string; tone: "player" | "cpu" }) {
  const control = Math.round((fighter.power * 0.45) + (fighter.speed * 0.55));
  const weaponLabel = fighter.weapon === "dual" ? "SABRES DUPLOS" : fighter.weapon === "staff" ? "SABRE DUPLO" : fighter.weapon === "blaster" ? "BLASTER" : "SABRE DE LUZ";
  const stats = [
    { label: "FORÇA", value: fighter.power },
    { label: "AGILIDADE", value: fighter.speed },
    { label: "DOMÍNIO", value: control },
  ];

  return (
    <article className={`attribute-card ${tone}`}>
      <header><span>{label}</span><b>{fighter.name}</b></header>
      <div className="attribute-stats">
        {stats.map(stat => (
          <div className="attribute-stat" key={stat.label}>
            <div><span>{stat.label}</span><b>{stat.value}</b></div>
            <i><em style={{ width: `${stat.value}%` }} /></i>
          </div>
        ))}
      </div>
      <div className="attribute-footer"><span>ARMA</span><b>{weaponLabel}</b></div>
    </article>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [arenaId, setArenaId] = useState<(typeof arenas)[number]["id"]>("mustafar");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [hero, setHero] = useState(fighters[0]);
  const [rival, setRival] = useState(fighters[1]);
  const [heroHp, setHeroHp] = useState(100);
  const [rivalHp, setRivalHp] = useState(100);
  const [force, setForce] = useState(35);
  const [heroX, setHeroX] = useState(18);
  const [rivalX, setRivalX] = useState(76);
  const [heroAction, setHeroAction] = useState<Action>("idle");
  const [rivalAction, setRivalAction] = useState<Action>("idle");
  const [message, setMessage] = useState("ROUND 01");
  const [round, setRound] = useState(1);
  const [impact, setImpact] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const appRef = useRef<HTMLElement>(null);
  const keys = useRef(new Set<string>());
  const locked = useRef(false);
  const rivalActionRef = useRef<Action>("idle");
  const rivalIntent = useRef<number>(0);
  const difficultyRef = useRef(difficulty);
  difficultyRef.current = difficulty;

  useEffect(() => { rivalActionRef.current = rivalAction; }, [rivalAction]);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(document.fullscreenElement === appRef.current);
    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    if (screen !== "battle") return;
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }, [screen]);

  useEffect(() => {
    if (!combo) return;
    const timer = window.setTimeout(() => setCombo(0), 1400);
    return () => window.clearTimeout(timer);
  }, [combo]);

  const resetRound = useCallback((nextHero = hero, nextRival = rival) => {
    setHero(nextHero);
    setRival(nextRival);
    setHeroHp(100);
    setRivalHp(100);
    setForce(35);
    setCombo(0);
    setImpact(0);
    setHeroX(18);
    setRivalX(76);
    setHeroAction("idle");
    setRivalAction("idle");
    rivalIntent.current = 0;
    locked.current = false;
    setMessage(`ROUND ${String(round).padStart(2, "0")}`);
    window.setTimeout(() => setMessage("LUTE!"), 700);
    window.setTimeout(() => setMessage(""), 1400);
  }, [hero, rival, round]);

  const hurtRival = useCallback((damage: number, special = false) => {
    const guarded = rivalActionRef.current === "defend";
    const dealt = guarded ? Math.ceil(damage * 0.28) : damage;
    setRivalHp(hp => {
      const next = Math.max(0, hp - dealt);
      if (next === 0) {
        setRivalAction("ko");
        setMessage("VITÓRIA");
        locked.current = true;
      }
      return next;
    });
    if (!guarded) {
      setImpact(v => v + 1);
      setCombo(v => v + (special ? 3 : 1));
      setRivalAction("hit");
      window.setTimeout(() => setRivalAction("idle"), special ? 700 : 280);
    }
  }, []);

  const attack = useCallback(() => {
    if (locked.current || ["attack", "special", "hit", "ko"].includes(heroAction)) return;
    setHeroAction("attack");
    const inRange = Math.abs(rivalX - heroX) < (hero.weapon === "blaster" ? 64 : 30);
    if (inRange) {
      window.setTimeout(() => hurtRival(Math.round(hero.power / 8)), 130);
      setForce(v => Math.min(100, v + 14));
    }
    window.setTimeout(() => setHeroAction("idle"), 430);
  }, [hero, heroAction, heroX, rivalX, hurtRival]);

  const special = useCallback(() => {
    if (locked.current || force < 100 || ["special", "hit", "ko"].includes(heroAction)) return;
    setForce(0);
    setHeroAction("special");
    setMessage(hero.superName.toUpperCase());
    window.setTimeout(() => hurtRival(31, true), 480);
    window.setTimeout(() => setMessage(""), 950);
    window.setTimeout(() => setHeroAction("idle"), 1050);
  }, [force, hero, heroAction, hurtRival]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (screen !== "battle") return;
      const key = event.key.toLowerCase();
      if (["a", "d", "w", "s", " ", "arrowleft", "arrowright", "arrowup", "arrowdown", "j", "k", "l"].includes(key)) event.preventDefault();
      keys.current.add(key);
      if (event.repeat) return;
      if (key === "j") attack();
      if (key === "l") special();
      if ((key === "w" || key === " " || key === "arrowup") && !locked.current && !["attack", "special", "hit", "ko", "jump"].includes(heroAction)) {
        setHeroAction("jump");
        window.setTimeout(() => setHeroAction("idle"), 650);
      }
    };
    const up = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keys.current.delete(key);
    };
    const clearKeys = () => {
      keys.current.clear();
      if (!locked.current) setHeroAction("idle");
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clearKeys);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clearKeys);
    };
  }, [attack, special, heroAction, screen]);

  useEffect(() => {
    const movement = window.setInterval(() => {
      if (locked.current || screen !== "battle") return;
      const bot = difficultyLevels[difficultyRef.current];

      const left = keys.current.has("a") || keys.current.has("arrowleft");
      const right = keys.current.has("d") || keys.current.has("arrowright");
      const crouch = keys.current.has("s") || keys.current.has("arrowdown");

      if (left) setHeroX(x => Math.max(3, x - hero.speed / 480));
      if (right) setHeroX(x => Math.min(rivalX - 8, x + hero.speed / 480));

      const actionLocked = ["attack", "special", "hit", "ko", "jump"].includes(heroAction);
      if (!actionLocked) {
        if (keys.current.has("k")) setHeroAction("defend");
        else if (crouch) setHeroAction("crouch");
        else if (left || right) setHeroAction("walk");
        else setHeroAction("idle");
      }

      if (rivalIntent.current === -1) {
        setRivalX(x => Math.max(heroX + 12, x - (rival.speed / 480) * bot.movement));
      } else if (rivalIntent.current === 1) {
        setRivalX(x => Math.min(88, x + (rival.speed / 480) * bot.movement));
      }
    }, 16);
    return () => window.clearInterval(movement);
  }, [hero.speed, heroAction, rival.speed, rivalX, screen]);

  useEffect(() => {
    const bot = difficultyLevels[difficultyRef.current];
    const ai = window.setInterval(() => {
      if (locked.current || screen !== "battle") return;
      if (rivalActionRef.current !== "idle" && rivalActionRef.current !== "walk") return;

      const distance = rivalX - heroX;
      rivalIntent.current = 0;

      if (distance > 25 && rival.weapon !== "blaster") {
        rivalIntent.current = -1;
        setRivalAction("walk");
      } else if (Math.random() < bot.aggression) {
        const usesSpecial = Math.random() < bot.special;
        setRivalAction(usesSpecial ? "special" : "attack");
        window.setTimeout(() => {
          const isGuarded = heroAction === "defend";
          const isLow = heroAction === "crouch" && Math.random() > 0.4;
          if (!isLow) {
            const baseDamage = Math.round((rival.power / 9) * bot.damage * (usesSpecial ? 1.65 : 1));
            const damage = isGuarded ? Math.max(2, Math.round(baseDamage * .28)) : baseDamage;
            setHeroHp(hp => {
              const next = Math.max(0, hp - damage);
              if (next === 0) {
                setHeroAction("ko");
                setMessage("DERROTA");
                locked.current = true;
              } else if (!isGuarded) {
                setHeroAction("hit");
                window.setTimeout(() => setHeroAction("idle"), 280);
              }
              return next;
            });
          }
        }, 190);
        window.setTimeout(() => setRivalAction("idle"), usesSpecial ? 950 : 500);
      } else {
        if (Math.random() < bot.guard) {
          setRivalAction("defend");
          window.setTimeout(() => setRivalAction("idle"), 400);
        } else if (distance < 70) {
          rivalIntent.current = 1;
          setRivalAction("walk");
        } else {
          setRivalAction("idle");
        }
      }
    }, bot.reaction);
    return () => { window.clearInterval(ai); rivalIntent.current = 0; };
  }, [heroAction, heroX, rival, rivalX, screen]);

  const chooseHero = (fighter: Fighter) => {
    const newRival = fighter.id === rival.id ? fighters[(fighters.indexOf(fighter) + 1) % fighters.length] : rival;
    setHero(fighter);
    setRival(newRival);
  };

  const chooseRival = (fighter: Fighter) => {
    if (fighter.id === hero.id) return;
    setRival(fighter);
  };

  const enterFullscreen = async () => {
    if (document.fullscreenElement || !appRef.current?.requestFullscreen) return;
    await appRef.current.requestFullscreen().catch(() => undefined);
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement === appRef.current) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }
    await enterFullscreen();
  };

  const leaveBattle = () => {
    if (document.fullscreenElement === appRef.current) void document.exitFullscreen().catch(() => undefined);
    setScreen("select");
  };

  const startBattle = () => {
    void enterFullscreen();
    setRound(r => r + 1);
    setCombo(0);
    resetRound(hero, rival);
    setScreen("battle");
  };

  return (
    <main ref={appRef} className={`app-shell screen-${screen}`}>
      <header className="topbar">
        <button className="brand brand-button" onClick={() => setScreen("menu")} aria-label="Star Wars Galactic Duel início">
          <span className="brand-mark">SW</span>
          <span><small>STAR WARS</small><b>GALACTIC</b><i>DUEL</i></span>
        </button>
        <div className="game-status">{screen === "battle" ? `${arenas.find(a => a.id === arenaId)?.name} • ROUND ${round}` : screen === "select" ? "SELEÇÃO DE COMBATE" : "A FORÇA CHAMA"}</div>
        <button className="roster-button" onClick={() => setScreen(screen === "select" ? "menu" : "select")}>{screen === "select" ? "VOLTAR" : "NOVO COMBATE"}</button>
      </header>

      {screen === "menu" && (
        <section className="menu-screen">
          <div className="menu-stars" />
          <div className="menu-copy">
            <p className="eyebrow">FAN GAME • EDIÇÃO DE COMBATE</p>
            <h1><small>STAR WARS</small>GALACTIC<br /><span>DUEL</span></h1>
            <p>Dez guerreiros. Quatro mundos. Um duelo para decidir o destino da galáxia.</p>
            <div className="menu-actions">
              <button className="primary-cta" onClick={() => setScreen("select")}>INICIAR BATALHA <b>▶</b></button>
              <a href="#fighters">VER LUTADORES</a>
            </div>
          </div>
          <div className="menu-duel" aria-hidden="true">
            <div className="duel-horizon" />
            <div className="duel-orbit"><i /><i /><i /></div>
            <div className="menu-glow blue-glow" />
            <PixelFighter fighter={fighters[0]} action="attack" facing={1} />
            <div className="menu-glow red-glow" />
            <PixelFighter fighter={fighters[1]} action="defend" facing={-1} cpu />
            <div className="clash"><i /><i /><i /><i /></div>
            <div className="duel-platform"><i /><i /><i /></div>
          </div>
          <div className="crawl">QUE A FORÇA ESTEJA COM VOCÊ • ESCOLHA SUA LENDA • DOMINE A ARENA •</div>
        </section>
      )}

      {screen === "select" && (
        <section className="selection-screen" aria-label="Seleção de batalha">
          <div className="selection-title">
            <p className="eyebrow">CONFIGURE O DUELO</p>
            <h1>SELEÇÃO DE <span>COMBATE</span></h1>
          </div>
          <div className="match-preview">
            <div className="chosen-fighter blue-side">
              <span>PLAYER 01</span>
              <PixelFighter fighter={hero} action="idle" />
              <h2>{hero.name}</h2><p>{hero.superName}</p>
            </div>
            <div className="match-vs">VS<small>{arenas.find(a => a.id === arenaId)?.name}<br />CPU: {difficultyLevels[difficulty].label}</small></div>
            <div className="chosen-fighter red-side">
              <span>CPU</span>
              <PixelFighter fighter={rival} action="idle" facing={-1} cpu />
              <h2>{rival.name}</h2><p>{rival.superName}</p>
            </div>
          </div>

          <div className="roster-panel">
            <div className="roster-heading">
              <div><span>PASSO 01</span><h2>DEFINA O DUELO</h2></div>
              <p>Clique no retrato para escolher o jogador e em <b>ESCOLHER CPU</b> para definir o adversário.</p>
            </div>
            <div className="fighter-grid">
              {fighters.map(fighter => (
                <article className={`fighter-card ${hero.id === fighter.id ? "selected" : ""} ${rival.id === fighter.id ? "cpu-selected" : ""}`} key={fighter.id}>
                  <button className="portrait" onClick={() => chooseHero(fighter)} aria-label={`Jogar com ${fighter.name}`}>
                    <PixelFighter fighter={fighter} action="idle" />
                    <span className={`side-tag ${fighter.side}`}>{fighter.side === "light" ? "LUZ" : fighter.side === "dark" ? "SOMBRA" : "NEUTRO"}</span>
                  </button>
                  <div><h3>{fighter.name}</h3><p>{fighter.title}</p></div>
                  {rival.id === fighter.id && <span className="cpu-current">ADVERSÁRIO</span>}
                  <button className="cpu-pick" onClick={() => chooseRival(fighter)} disabled={hero.id === fighter.id} aria-pressed={rival.id === fighter.id}>
                    {rival.id === fighter.id ? "CPU ATUAL ✓" : "ESCOLHER CPU"}
                  </button>
                </article>
              ))}
            </div>
          </div>

          <section className="attributes-panel" aria-label="Comparação de atributos">
            <div className="roster-heading">
              <div><span>PASSO 02</span><h2>ATRIBUTOS DO DUELO</h2></div>
              <p>Compare os atributos antes de entrar na arena. O domínio combina força e agilidade.</p>
            </div>
            <div className="attribute-comparison">
              <FighterAttributes fighter={hero} label="JOGADOR 01" tone="player" />
              <div className="attribute-versus">VS</div>
              <FighterAttributes fighter={rival} label="ADVERSÁRIO CPU" tone="cpu" />
            </div>
          </section>

          <div className="arena-select">
            <div className="roster-heading"><div><span>PASSO 03</span><h2>ESCOLHA O CENÁRIO</h2></div></div>
            <div className="arena-cards">
              {arenas.map(arena => (
                <button key={arena.id} className={`arena-card ${arena.id} ${arenaId === arena.id ? "selected" : ""}`} onClick={() => setArenaId(arena.id)}>
                  <i /><span>{arena.tone}</span><b>{arena.name}</b><small>{arena.subtitle}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="difficulty-select">
            <div className="roster-heading">
              <div><span>PASSO 04</span><h2>DIFICULDADE DA CPU</h2></div>
              <p>Quanto maior o nível, mais rápida, agressiva e estratégica será a resposta do bot.</p>
            </div>
            <div className="difficulty-options">
              {(Object.keys(difficultyLevels) as Difficulty[]).map(level => (
                <button key={level} className={`${level} ${difficulty === level ? "selected" : ""}`} onClick={() => setDifficulty(level)}>
                  <span>{difficultyLevels[level].label}</span>
                  <small>{difficultyLevels[level].description}</small>
                  <i>{level === "easy" ? "I" : level === "normal" ? "II" : level === "hard" ? "III" : "IV"}</i>
                </button>
              ))}
            </div>
          </div>
          <button className="battle-cta" onClick={startBattle}>ENTRAR NA BATALHA <b>▶</b></button>
        </section>
      )}

      {screen === "battle" && <section className="battle-screen">
        <div className="battle-toolbar">
          <div className="battle-toolbar-actions">
            <button onClick={leaveBattle}>‹ TROCAR LUTADORES</button>
          <button className="fullscreen-button" onClick={() => void toggleFullscreen()} aria-pressed={isFullscreen}>
            {isFullscreen ? "⛶ SAIR DA TELA CHEIA" : "⛶ VOLTAR À TELA CHEIA"}
          </button>
          </div>
          <span>{arenas.find(a => a.id === arenaId)?.subtitle} • CPU {difficultyLevels[difficulty].label}</span>
          <button onClick={() => setArenaId(arenas[(arenas.findIndex(a => a.id === arenaId) + 1) % arenas.length].id)}>PRÓXIMO CENÁRIO ›</button>
        </div>
        <section className={`game-frame stage-${arenaId} ${heroAction === "special" ? "super-active" : ""}`} id="arena">
          <div className="hud">
            <div className="hud-player">
              <div className="hud-name"><small>P1</small><div><b>{hero.name}</b><span>{hero.title}</span></div></div>
              <Bar value={heroHp} kind="health" />
              <div className="force-row"><span>FORÇA</span><Bar value={force} kind="force" /><b>{Math.round(force)}%</b></div>
            </div>
            <div className="versus"><span>{String(round).padStart(2, "0")}</span><b>VS</b></div>
            <div className="hud-player enemy">
              <div className="hud-name"><small>CPU</small><div><b>{rival.name}</b><span>{rival.title}</span></div></div>
              <Bar value={rivalHp} kind="health" />
              <div className="force-row"><b>CPU</b><Bar value={68} kind="force" /><span>ÓDIO</span></div>
            </div>
          </div>

          <div className={`arena ${rivalAction === "hit" ? "has-impact" : ""}`}>
            <div className="stars far" /><div className="stars near" />
            <div className="sun" /><div className="planet" />
            <div className="mountains back" /><div className="mountains front" />
            <div className="temple"><i /><i /><i /></div>
            <div className="stage-elements"><i /><i /><i /><i /></div>
            <div className="ambient-particles">{[0, 1, 2, 3, 4, 5, 6, 7].map(i => <i key={i} />)}</div>
            <div className="floor-lines" />
            {message && <div className={`fight-message ${message.length > 12 ? "long" : ""}`}>{message}</div>}
            {combo > 1 && <div className="combo-counter"><b>{combo}x</b><span>COMBO</span></div>}
            <div className="combatant hero-fighter" style={{ left: `${heroX}%` }}><PixelFighter fighter={hero} action={heroAction} facing={1} /></div>
            <div className="combatant rival-fighter" style={{ left: `${rivalX}%` }}><PixelFighter fighter={rival} action={rivalAction} facing={-1} cpu /></div>
            {impact > 0 && <div className="hit-spark" key={impact} style={{ left: `${rivalX}%` }}><i /><i /><i /><i /></div>}
          </div>

          <div className="control-deck">
          <div className="controls">
            <span className="control-label">MOVIMENTO</span>
            <div><kbd>A</kbd><small>TRÁS</small></div><div><kbd>D</kbd><small>FRENTE</small></div>
            <div><kbd>S</kbd><small>AGACHA</small></div><div><kbd>W</kbd><small>PULA</small></div><div><kbd>SPACE</kbd><small>PULA</small></div>
            <span className="or">OU SETAS</span>
          </div>
          <div className="controls action-controls">
            <div><kbd className="red">J</kbd><small>ATACA</small></div><div><kbd className="blue">K</kbd><small>DEFENDE</small></div>
            <div><kbd className="gold">L</kbd><small>SUPER</small></div>
            </div>
            <button className="reset-button" onClick={() => resetRound()}><span>↻</span> REINICIAR</button>
          </div>
        </section>
      </section>}

      {screen !== "select" && <section className="specials" id="fighters">
        <div className="section-title"><p>ARQUIVO DA ARENA</p><h2>SUPERS <span>ÚNICOS</span></h2></div>
        <div className="special-grid">
          {fighters.map((fighter, index) => (
            <article key={fighter.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{fighter.superName}</h3><b>{fighter.name}</b><p>{fighter.superDescription}</p></div>
            </article>
          ))}
        </div>
      </section>}

      <footer>
        <div className="brand mini"><span className="brand-mark">SW</span><span><small>STAR WARS</small><b>GALACTIC</b><i>DUEL</i></span></div>
        <p>Projeto de fã não oficial, sem fins comerciais. Personagens pertencem aos seus respectivos detentores.</p>
        <p className="copyright" style={{ color: "var(--yellow)", marginTop: "10px", fontSize: "10px" }}>&copy; Todos os direitos reservados EnzoToniato567, davi-lm7, Murilo1602 e HenriqueAlth09 2026</p>
        <a href="https://github.com/EnzoToniato567/StarWars-Galactic-Duel.git" target="_blank" rel="noreferrer">VER NO GITHUB ↗</a>
      </footer>
    </main>
  );
}
