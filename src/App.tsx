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
type RoundResult = "victory" | "defeat" | null;

const arenas = [
  { id: "mustafar", name: "Mustafar", subtitle: "Complexo de mineração", tone: "FOGO" },
  { id: "hoth", name: "Hoth", subtitle: "Base Echo", tone: "GELO" },
  { id: "endor", name: "Endor", subtitle: "Lua florestal", tone: "FLORESTA" },
  { id: "deathstar", name: "Estação Imperial", subtitle: "Hangar central", tone: "ESPAÇO" },
] as const;

type CpuProfile = { label: string; description: string; reaction: number; movement: number; damage: number; aggression: number; guard: number; guardDelay: number; jump: number; retreat: number; special: number; mistake: number };

const difficultyLevels: Record<Difficulty, CpuProfile> = {
  easy: { label: "Easy", description: "Dá espaço, erra decisões e quase não defende.", reaction: 1050, movement: .7, damage: .65, aggression: .42, guard: .05, guardDelay: 500, jump: .03, retreat: .12, special: 0, mistake: .28 },
  normal: { label: "Normal", description: "Ataca e se reposiciona em ritmo equilibrado.", reaction: 550, movement: 1, damage: 1, aggression: .68, guard: .22, guardDelay: 105, jump: .1, retreat: .24, special: .3, mistake: .1 },
  hard: { label: "Hard", description: "Pressiona, pune aberturas e reage à ofensiva.", reaction: 300, movement: 1.25, damage: 1.12, aggression: .82, guard: .47, guardDelay: 95, jump: .13, retreat: .35, special: .72, mistake: .03 },
  hardcore: { label: "Hardcore", description: "Reage cedo, controla a distância e usa a barra.", reaction: 170, movement: 1.5, damage: 1.27, aggression: .92, guard: .68, guardDelay: 45, jump: .16, retreat: .42, special: 1, mistake: 0 },
};

const weaponReach: Record<Fighter["weapon"], number> = {
  saber: 11.5,
  dual: 13,
  staff: 14,
  blaster: 18.5,
};

function attackReach(fighter: Fighter, empowered = false) {
  const skillBonus = (fighter.speed - 80) * 0.02 + (fighter.power - 80) * 0.015;
  return Math.max(9, weaponReach[fighter.weapon] + skillBonus + (empowered ? 4 : 0));
}

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
        <div className="arm arm-front">
          <i className="glove" /><i className="hand" />
          <div className="weapon">
            <i className="hilt" />
            <i className="blade blade-main" />
            {(fighter.weapon === "dual" || fighter.weapon === "staff") && <i className="blade blade-extra" />}
            {fighter.weapon === "blaster" && <i className="bolt" />}
          </div>
        </div>
        <div className="leg leg-back"><i className="boot" /></div>
        <div className="leg leg-front"><i className="boot" /></div>
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

function ControlButton({ label, shortcut, control, tone, pressed = false, disabled = false, onPress, onRelease }: {
  label: string;
  shortcut: string;
  control: string;
  tone?: string;
  pressed?: boolean;
  disabled?: boolean;
  onPress: (control: string) => void;
  onRelease: (control: string) => void;
}) {
  const release = () => onRelease(control);
  return (
    <button
      type="button"
      className={`control-button ${tone ?? ""}`}
      aria-label={`${label} (${shortcut})`}
      aria-pressed={pressed}
      disabled={disabled}
      onPointerDown={event => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        onPress(control);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onKeyDown={event => {
        if ((event.key === "Enter" || event.key === " ") && ["left", "right", "crouch", "defend"].includes(control)) {
          event.preventDefault();
          if (!event.repeat) onPress(control);
        }
      }}
      onClick={event => { if (event.detail === 0 && !["left", "right", "crouch", "defend"].includes(control)) onPress(control); }}
      onKeyUp={release}
    >
      <kbd>{shortcut}</kbd><small>{label}</small>
    </button>
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

type ArcadeTrack = {
  id: string;
  title: string;
  artist: string;
  duration: number;
  image?: string;
  trackerType?: string;
  startedAt?: number;
  streamingOffset?: number;
};

type EricadeHistoryResponse = {
  message?: string;
  Tracks?: Array<{ TrackID?: string | number; Title?: string; Artist?: string; Duration?: string | number; PlayLength?: string | number; TimeStamp?: string | number; WebStreamingOffset?: string | number; musicURL?: string; Image?: string; TrackerType?: string }>;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

function ArcadePlayer() {
  const streamUrl = "https://radio.ericade.net/sc/stream/1/";
  const localUrl = `${import.meta.env.BASE_URL}audio/galactic-duel-theme.wav`;
  const audioRef = useRef<HTMLAudioElement>(null);
  const sourceRef = useRef<"radio" | "local">("radio");
  const tokenRef = useRef<Promise<string> | null>(null);
  const sequenceRef = useRef(0);
  const nextApiAttemptRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [source, setSource] = useState<"radio" | "local">("radio");
  const [metadataUnavailable, setMetadataUnavailable] = useState(false);
  const [volume, setVolume] = useState(0.42);
  const [playlist, setPlaylist] = useState<ArcadeTrack[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [liveTrack, setLiveTrack] = useState<ArcadeTrack | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const currentTrack = source === "local"
    ? { id: "local-theme", title: "Galactic Duel — trilha arcade", artist: "Trilha original do jogo", duration: 16 }
    : liveTrack;
  const duration = currentTrack?.duration || 0;
  const artist = currentTrack?.artist || "Chiptune e demoscene";

  const getToken = () => {
    if (!tokenRef.current) {
      tokenRef.current = fetch("https://radio.ericade.net/get-token/").then(async response => {
        if (!response.ok) throw new Error("Token unavailable");
        return (await response.text()).trim();
      });
    }
    return tokenRef.current.catch(error => {
      tokenRef.current = null;
      throw error;
    });
  };

  const fetchMetadata = async (endpoint: string, fields: Record<string, number>) => {
    if (Date.now() < nextApiAttemptRef.current) throw new Error("API rate limited");
    const token = await getToken();
    const response = await fetch(`https://api.ericade.net/radio/v2/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Token: token, StationID: 1, ...fields }),
    });
    if (response.status === 429) {
      nextApiAttemptRef.current = Date.now() + (Number(response.headers.get("Retry-After")) || 600) * 1000;
      throw new Error("API rate limited");
    }
    if (response.status === 204) return null;
    if (!response.ok) throw new Error("Metadata unavailable");
    const data = await response.json() as EricadeHistoryResponse;
    if (data.message === "Failure" || !Array.isArray(data.Tracks)) {
      tokenRef.current = null;
      throw new Error("Invalid metadata response");
    }
    return data;
  };

  useEffect(() => {
    let active = true;
    const getPlaylist = async () => {
      try {
        const data = await fetchMetadata("songhistory", { Limit: 24 });
        const tracks = (data?.Tracks || []).filter(track => track.Artist !== "ericade.radio" && Number(track.Duration) > 20).slice(0, 8).map(track => ({
          id: String(track.TrackID),
          title: track.Title || "Faixa sem título",
          artist: track.Artist || "Artista desconhecido",
          duration: Number(track.Duration) || 0,
          image: track.Image,
          trackerType: track.TrackerType,
        }));
        if (!tracks.length) throw new Error("No playable tracks");
        if (active) setPlaylist(tracks);
      } catch {
        // The stream and current-song metadata do not depend on song history.
      }
    };
    queueMicrotask(() => { if (active) void getPlaylist(); });
    const timer = window.setInterval(() => void getPlaylist(), 120000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    let active = true;
    const refreshNowPlaying = async () => {
      try {
        const data = await fetchMetadata("nowplaying/", { Sequence: sequenceRef.current });
        const track = data?.Tracks?.[0];
        if (!active || !track) return;
        sequenceRef.current = Number(track.TimeStamp) || 0;
        setLiveTrack({
          id: String(track.TrackID),
          title: track.Title || "ERICADE Radio",
          artist: track.Artist || "Chiptune e demoscene",
          duration: Number(track.PlayLength ?? track.Duration) || 0,
          image: track.Image,
          trackerType: track.TrackerType,
          startedAt: Number(track.TimeStamp) || undefined,
          streamingOffset: Number(track.WebStreamingOffset) || 0,
        });
        setMetadataUnavailable(false);
      } catch {
        if (active) setMetadataUnavailable(true);
      }
    };
    queueMicrotask(() => { if (active) void refreshNowPlaying(); });
    const timer = window.setInterval(() => void refreshNowPlaying(), 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      if (source === "local") return;
      if (!liveTrack?.startedAt || !liveTrack.duration) return;
      const elapsed = (Date.now() / 1000) - liveTrack.startedAt - (liveTrack.streamingOffset || 0);
      setCurrentTime(Math.max(0, Math.min(liveTrack.duration, elapsed)));
    };
    updateProgress();
    const timer = window.setInterval(updateProgress, 1000);
    return () => window.clearInterval(timer);
  }, [liveTrack, source]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const playWithTimeout = async (player: HTMLAudioElement) => {
    let timeout = 0;
    try {
      await Promise.race([
        player.play(),
        new Promise<never>((_, reject) => {
          timeout = window.setTimeout(() => reject(new Error("Audio timeout")), 8000);
        }),
      ]);
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const switchToLocal = async () => {
    const player = audioRef.current;
    if (!player) return;
    if (sourceRef.current === "local") {
      setAudioError(true);
      setIsConnecting(false);
      return;
    }
    sourceRef.current = "local";
    setSource("local");
    setCurrentTime(0);
    player.src = localUrl;
    player.loop = true;
    player.load();
    try {
      await playWithTimeout(player);
    } catch {
      setAudioError(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const togglePlayback = async () => {
    const player = audioRef.current;
    if (!player) return;
    if (!player.paused) {
      player.pause();
      return;
    }
    setAudioError(false);
    setIsConnecting(true);
    const attemptedSource = sourceRef.current;
    try {
      await playWithTimeout(player);
    } catch {
      if (attemptedSource === "radio") {
        if (sourceRef.current === "radio") await switchToLocal();
      } else {
        setAudioError(true);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const retryRadio = async () => {
    const player = audioRef.current;
    if (!player) return;
    player.pause();
    sourceRef.current = "radio";
    setSource("radio");
    setCurrentTime(0);
    setAudioError(false);
    setIsConnecting(true);
    player.src = streamUrl;
    player.loop = false;
    player.load();
    try {
      await playWithTimeout(player);
    } catch {
      if (sourceRef.current === "radio") await switchToLocal();
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <aside className={`arcade-player ${isExpanded ? "is-expanded" : ""}`} aria-label="Player de músicas arcade">
      <audio ref={audioRef} src={streamUrl} loop={source === "local"} preload="none" onPlaying={() => { setIsPlaying(true); setIsConnecting(false); setAudioError(false); }} onPause={() => setIsPlaying(false)} onTimeUpdate={event => { if (sourceRef.current === "local") setCurrentTime(event.currentTarget.currentTime); }} onError={() => { if (sourceRef.current === "radio") void switchToLocal(); else { setAudioError(true); setIsConnecting(false); } }} />
      <button className="player-collapse" onClick={() => { setIsExpanded(value => !value); if (!isExpanded && !isPlaying && !isConnecting) void togglePlayback(); }} aria-expanded={isExpanded} aria-label={isExpanded ? "Fechar player de música" : "Abrir player e tocar música"} title={isExpanded ? "Fechar player" : "Abrir e tocar música"}>
        {isExpanded ? "×" : "♫"}
      </button>
      <div className="player-main">
        <div className="player-cover">
          {currentTrack?.image ? <img src={currentTrack.image} alt="" /> : <span>8BIT</span>}
        </div>
        <div className="player-track">
          <span>{source === "local" ? "TRILHA ARCADE · OFFLINE" : metadataUnavailable ? "ERICADE RADIO · DADOS INDISPONÍVEIS" : "ERICADE RADIO · AO VIVO"}</span>
          <b title={currentTrack?.title}>{currentTrack?.title || (metadataUnavailable ? "ERICADE Radio — ao vivo" : "Carregando músicas…")}</b>
          <small>{currentTrack?.trackerType ? `${artist} · ${currentTrack.trackerType}` : artist}</small>
        </div>
        <div className="player-controls">
          <button className="player-play" onClick={() => void togglePlayback()} aria-label={isPlaying ? "Pausar música" : "Tocar música"}>{isConnecting ? "…" : isPlaying ? "Ⅱ" : "▶"}</button>
        </div>
      </div>
      {audioError && <p className="player-error" role="alert">Não foi possível iniciar o áudio. Toque em ▶ para tentar novamente.</p>}
      <div className="player-progress"><span>{formatTime(currentTime)}</span><input type="range" min="0" max={duration || 1} value={currentTime} disabled aria-label="Progresso da música" /><span>{duration ? formatTime(duration) : "AO VIVO"}</span></div>
      <label className="player-volume" aria-label="Volume"><span>VOL</span><input type="range" min="0" max="1" step="0.05" value={volume} onChange={event => setVolume(Number(event.target.value))} /></label>
      <div className="player-list" aria-label="Faixas recentes da ERICADE Radio">
        {playlist.map((track, index) => <div key={track.id}><span>{String(index + 1).padStart(2, "0")}</span><b>{track.title}</b><small>{track.artist}</small><i>{formatTime(track.duration)}</i></div>)}
        {!playlist.length && <p className="player-list-empty">Faixas recentes indisponíveis.</p>}
      </div>
      {source === "local" && <button className="player-retry" onClick={() => void retryRadio()} disabled={isConnecting}>TENTAR RÁDIO ↻</button>}
      {source === "radio" ? <a className="player-credit" href="https://ericade.radio/" target="_blank" rel="noreferrer">MÚSICA VIA ERICADE RADIO ↗</a> : <span className="player-credit">TRILHA ORIGINAL DO JOGO</span>}
    </aside>
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
  const [rivalForce, setRivalForce] = useState(35);
  const [heroX, setHeroX] = useState(18);
  const [rivalX, setRivalX] = useState(76);
  const [heroAction, setHeroAction] = useState<Action>("idle");
  const [rivalAction, setRivalAction] = useState<Action>("idle");
  const [message, setMessage] = useState("ROUND 01");
  const [round, setRound] = useState(1);
  const [roundResult, setRoundResult] = useState<RoundResult>(null);
  const [roundWins, setRoundWins] = useState(0);
  const [roundLosses, setRoundLosses] = useState(0);
  const [impact, setImpact] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const appRef = useRef<HTMLElement>(null);
  const keys = useRef(new Set<string>());
  const touchKeys = useRef(new Set<string>());
  const locked = useRef(false);
  const pausedRef = useRef(false);
  const heroXRef = useRef(heroX);
  const rivalXRef = useRef(rivalX);
  const heroHpRef = useRef(heroHp);
  const rivalHpRef = useRef(rivalHp);
  const heroActionRef = useRef<Action>(heroAction);
  const rivalActionRef = useRef<Action>("idle");
  const forceRef = useRef(force);
  const rivalForceRef = useRef(rivalForce);
  const roundToken = useRef(0);
  const roundResultRef = useRef<RoundResult>(null);
  const lastGuardAt = useRef(0);
  const rivalIntent = useRef<number>(0);
  heroXRef.current = heroX;
  rivalXRef.current = rivalX;
  heroHpRef.current = heroHp;
  rivalHpRef.current = rivalHp;
  heroActionRef.current = heroAction;
  rivalActionRef.current = rivalAction;
  forceRef.current = force;
  rivalForceRef.current = rivalForce;

  const setHeroMotion = useCallback((action: Action) => {
    if (heroActionRef.current === action) return;
    heroActionRef.current = action;
    setHeroAction(action);
  }, []);
  const setRivalMotion = useCallback((action: Action) => {
    if (rivalActionRef.current === action) return;
    rivalActionRef.current = action;
    setRivalAction(action);
  }, []);
  const togglePause = useCallback(() => {
    if (screen !== "battle") return;
    const nextPaused = !pausedRef.current;
    pausedRef.current = nextPaused;
    setIsPaused(nextPaused);
    keys.current.clear();
    touchKeys.current.clear();
    if (!nextPaused && !locked.current) setHeroMotion("idle");
  }, [screen, setHeroMotion]);
  const later = useCallback((delay: number, callback: () => void) => {
    const token = roundToken.current;
    let remaining = delay;
    let lastTick = Date.now();
    let timer = 0;
    const tick = () => {
      if (token !== roundToken.current) return;
      const now = Date.now();
      if (!pausedRef.current) remaining -= now - lastTick;
      lastTick = now;
      if (remaining <= 0) callback();
      else timer = window.setTimeout(tick, Math.min(50, remaining));
    };
    timer = window.setTimeout(tick, Math.min(50, delay));
    return () => window.clearTimeout(timer);
  }, []);

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
    return later(1400, () => setCombo(0));
  }, [combo, later]);

  const resetRound = useCallback((nextHero = hero, nextRival = rival, nextRound = round, carryForce = false) => {
    roundToken.current += 1;
    pausedRef.current = false;
    setIsPaused(false);
    keys.current.clear();
    touchKeys.current.clear();
    setHero(nextHero);
    setRival(nextRival);
    setHeroHp(100);
    setRivalHp(100);
    heroHpRef.current = 100;
    rivalHpRef.current = 100;
    if (!carryForce) {
      setForce(35);
      setRivalForce(35);
      forceRef.current = 35;
      rivalForceRef.current = 35;
    }
    setCombo(0);
    setImpact(0);
    setHeroX(18);
    setRivalX(76);
    heroXRef.current = 18;
    rivalXRef.current = 76;
    heroActionRef.current = "idle";
    rivalActionRef.current = "idle";
    setHeroAction("idle");
    setRivalAction("idle");
    rivalIntent.current = 0;
    roundResultRef.current = null;
    setRoundResult(null);
    lastGuardAt.current = 0;
    locked.current = true;
    setMessage(`ROUND ${String(nextRound).padStart(2, "0")}`);
    later(700, () => setMessage("LUTE!"));
    later(1400, () => {
      setMessage("");
      locked.current = false;
    });
  }, [hero, rival, round, later]);

  const advanceRound = useCallback(() => {
    if (!roundResultRef.current) return;
    const nextRound = round + 1;
    setRound(nextRound);
    resetRound(hero, rival, nextRound, true);
  }, [hero, rival, round, resetRound]);

  useEffect(() => {
    if (screen !== "battle" || !roundResult) return;
    return later(4000, advanceRound);
  }, [screen, roundResult, advanceRound, later]);

  const hurtRival = useCallback((damage: number, special = false) => {
    if (locked.current) return;
    const guarded = rivalActionRef.current === "defend";
    const dealt = guarded ? Math.ceil(damage * 0.28) : damage;
    const next = Math.max(0, rivalHpRef.current - dealt);
    rivalHpRef.current = next;
    setRivalHp(next);
    if (next === 0) {
      setRivalMotion("ko");
      setMessage("VITÓRIA");
      locked.current = true;
      roundResultRef.current = "victory";
      setRoundResult("victory");
      setRoundWins(wins => wins + 1);
    }
    if (!guarded && next > 0) {
      setImpact(v => v + 1);
      setCombo(v => v + (special ? 3 : 1));
      setRivalMotion("hit");
      later(special ? 700 : 280, () => {
        if (!locked.current) setRivalMotion("idle");
      });
    }
  }, [later, setRivalMotion]);

  const attack = useCallback(() => {
    if (locked.current || pausedRef.current || ["attack", "special", "hit", "ko", "jump"].includes(heroActionRef.current)) return;
    setHeroMotion("attack");
    later(130, () => {
      if (locked.current || Math.abs(rivalXRef.current - heroXRef.current) > attackReach(hero)) return;
      if ((rivalActionRef.current === "jump" && hero.weapon !== "blaster") ||
          (rivalActionRef.current === "crouch" && hero.weapon === "blaster")) return;
      hurtRival(Math.round(hero.power / 8));
      setForce(v => Math.min(100, v + 14));
    });
    later(430, () => {
      if (!locked.current) setHeroMotion("idle");
    });
  }, [hero, hurtRival, later, setHeroMotion]);

  const special = useCallback(() => {
    if (locked.current || pausedRef.current || forceRef.current < 100 || ["special", "hit", "ko"].includes(heroActionRef.current)) return;
    if (Math.abs(rivalXRef.current - heroXRef.current) > attackReach(hero, true)) return;
    setForce(0);
    setHeroMotion("special");
    setMessage(hero.superName.toUpperCase());
    later(480, () => {
      if (!locked.current && Math.abs(rivalXRef.current - heroXRef.current) <= attackReach(hero, true)) hurtRival(31, true);
    });
    later(950, () => { if (!locked.current) setMessage(""); });
    later(1050, () => { if (!locked.current) setHeroMotion("idle"); });
  }, [hero, hurtRival, later, setHeroMotion]);

  const jump = useCallback(() => {
    if (locked.current || pausedRef.current || ["attack", "special", "hit", "ko", "jump"].includes(heroActionRef.current)) return;
    setHeroMotion("jump");
    later(650, () => { if (!locked.current) setHeroMotion("idle"); });
  }, [later, setHeroMotion]);

  const pressControl = (control: string) => {
    if (pausedRef.current) return;
    if (control === "attack") attack();
    else if (control === "special") special();
    else if (control === "jump") jump();
    else touchKeys.current.add(control);
  };
  const releaseControl = (control: string) => touchKeys.current.delete(control);
  const held = (control: string) => touchKeys.current.has(control) ||
    (control === "left" && (keys.current.has("a") || keys.current.has("arrowleft"))) ||
    (control === "right" && (keys.current.has("d") || keys.current.has("arrowright"))) ||
    (control === "crouch" && (keys.current.has("s") || keys.current.has("arrowdown"))) ||
    (control === "defend" && keys.current.has("k"));

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (screen !== "battle") return;
      const key = event.key.toLowerCase();
      if (key === "escape") {
        event.preventDefault();
        if (!event.repeat) togglePause();
        return;
      }
      if (pausedRef.current) return;
      if ((key === " " || key === "enter") && event.target instanceof HTMLButtonElement && event.target.closest(".control-deck")) return;
      if (["a", "d", "w", "s", " ", "arrowleft", "arrowright", "arrowup", "arrowdown", "j", "k", "l"].includes(key)) event.preventDefault();
      keys.current.add(key);
      if (event.repeat) return;
      if (key === "j") attack();
      if (key === "l") special();
      if (key === "w" || key === " " || key === "arrowup") jump();
    };
    const up = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keys.current.delete(key);
    };
    const clearKeys = () => {
      keys.current.clear();
      touchKeys.current.clear();
      if (!locked.current && !pausedRef.current) setHeroMotion("idle");
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clearKeys);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clearKeys);
    };
  }, [attack, special, jump, screen, setHeroMotion, togglePause]);

  useEffect(() => {
    const movement = window.setInterval(() => {
      if (locked.current || pausedRef.current || screen !== "battle") return;
      const bot = difficultyLevels[difficulty];

      const left = held("left");
      const right = held("right");
      const crouch = held("crouch");

      if (left !== right) {
        const movementSpeed = (hero.speed / 480) * (heroActionRef.current === "jump" ? 1.8 : 1);
        heroXRef.current = left
          ? Math.max(3, heroXRef.current - movementSpeed)
          : Math.min(92, heroXRef.current + movementSpeed);
        setHeroX(heroXRef.current);
      }

      const actionLocked = ["attack", "special", "hit", "ko", "jump"].includes(heroActionRef.current);
      if (!actionLocked) {
        if (held("defend")) setHeroMotion("defend");
        else if (crouch) setHeroMotion("crouch");
        else if (left !== right) setHeroMotion("walk");
        else setHeroMotion("idle");
      }

      if (rivalIntent.current !== 0 && ["idle", "walk"].includes(rivalActionRef.current)) {
        rivalXRef.current = rivalIntent.current < 0
          ? Math.max(3, rivalXRef.current - (rival.speed / 480) * bot.movement)
          : Math.min(92, rivalXRef.current + (rival.speed / 480) * bot.movement);
        setRivalX(rivalXRef.current);
      }
    }, 16);
    return () => window.clearInterval(movement);
  }, [hero.speed, rival.speed, difficulty, screen, setHeroMotion]);

  useEffect(() => {
    if (screen !== "battle" || !["attack", "special"].includes(heroAction)) return;
    const bot = difficultyLevels[difficulty];
    if (Math.random() >= bot.guard || Date.now() - lastGuardAt.current < 850) return;
    return later(bot.guardDelay, () => {
      if (locked.current || Math.abs(rivalXRef.current - heroXRef.current) > attackReach(hero) + 2 ||
          !["idle", "walk"].includes(rivalActionRef.current)) return;
      lastGuardAt.current = Date.now();
      rivalIntent.current = 0;
      setRivalMotion(hero.weapon === "blaster" && Math.random() < .4 ? "crouch" : "defend");
      later(360, () => { if (!locked.current) setRivalMotion("idle"); });
    });
  }, [heroAction, hero.weapon, difficulty, screen, later, setRivalMotion]);

  useEffect(() => {
    const bot = difficultyLevels[difficulty];
    const ai = window.setInterval(() => {
      if (locked.current || pausedRef.current || screen !== "battle") return;
      if (rivalActionRef.current !== "idle" && rivalActionRef.current !== "walk") return;

      const signedDistance = rivalXRef.current - heroXRef.current;
      const distance = Math.abs(signedDistance);
      const directionToHero = signedDistance > 0 ? -1 : 1;
      const attackRange = attackReach(rival);
      const specialRange = attackReach(rival, true);
      const idealRange = Math.max(8.5, attackRange * .76);
      rivalIntent.current = 0;

      if (Math.random() < bot.mistake) {
        setRivalMotion("idle");
        return;
      }
      if (distance > idealRange + 7) {
        rivalIntent.current = directionToHero;
        setRivalMotion("walk");
        return;
      }
      if (distance < idealRange - 9 && Math.random() < bot.retreat) {
        rivalIntent.current = -directionToHero;
        setRivalMotion("walk");
        return;
      }
      if (Math.random() < bot.jump && heroActionRef.current !== "defend") {
        setRivalMotion("jump");
        later(650, () => { if (!locked.current) setRivalMotion("idle"); });
        return;
      }
      const attackChance = heroActionRef.current === "defend" ? bot.aggression * .45 : bot.aggression;
      if (distance > attackRange || Math.random() > attackChance) {
        rivalIntent.current = distance < idealRange ? -directionToHero : directionToHero;
        if (distance <= idealRange + 2 && Math.random() < .45) rivalIntent.current = 0;
        setRivalMotion(rivalIntent.current === 0 ? "idle" : "walk");
        return;
      }

      const usesSpecial = rivalForceRef.current >= 100 && Math.random() < bot.special;
      rivalIntent.current = 0;
      setRivalMotion(usesSpecial ? "special" : "attack");
      if (usesSpecial) {
        rivalForceRef.current = 0;
        setRivalForce(0);
      }
      later(usesSpecial ? 460 : 190, () => {
        if (locked.current || Math.abs(rivalXRef.current - heroXRef.current) > (usesSpecial ? specialRange : attackRange)) return;
        const isGuarded = heroActionRef.current === "defend";
        const evaded = !usesSpecial &&
          ((heroActionRef.current === "crouch" && rival.weapon === "blaster") ||
           (heroActionRef.current === "jump" && rival.weapon !== "blaster"));
        if (evaded) return;
        const baseDamage = Math.round((rival.power / 9) * bot.damage * (usesSpecial ? 1.8 : 1));
        const damage = isGuarded ? Math.max(2, Math.round(baseDamage * .28)) : baseDamage;
        const next = Math.max(0, heroHpRef.current - damage);
        heroHpRef.current = next;
        setHeroHp(next);
        if (next === 0) {
          setHeroMotion("ko");
          setMessage("DERROTA");
          locked.current = true;
          roundResultRef.current = "defeat";
          setRoundResult("defeat");
          setRoundLosses(losses => losses + 1);
        } else if (!isGuarded) {
          setHeroMotion("hit");
          later(280, () => { if (!locked.current) setHeroMotion("idle"); });
        }
        if (!usesSpecial) {
          rivalForceRef.current = Math.min(100, rivalForceRef.current + 14);
          setRivalForce(rivalForceRef.current);
        }
      });
      later(usesSpecial ? 950 : 500, () => { if (!locked.current) setRivalMotion("idle"); });
    }, bot.reaction);
    return () => { window.clearInterval(ai); rivalIntent.current = 0; };
  }, [difficulty, rival, screen, later, setHeroMotion, setRivalMotion]);

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
    roundToken.current += 1;
    pausedRef.current = false;
    setIsPaused(false);
    keys.current.clear();
    touchKeys.current.clear();
    rivalIntent.current = 0;
    setScreen("select");
  };

  const startBattle = () => {
    void enterFullscreen();
    setRound(1);
    setRoundWins(0);
    setRoundLosses(0);
    setCombo(0);
    resetRound(hero, rival, 1);
    setScreen("battle");
  };

  const heroFacing = heroX <= rivalX ? 1 : -1;

  return (
    <main ref={appRef} className={`app-shell screen-${screen}`}>
      <header className="topbar">
        <button className="brand brand-button" onClick={() => { if (screen === "battle") leaveBattle(); setScreen("menu"); }} aria-label="Star Wars Galactic Duel início">
          <span className="brand-mark">SW</span>
          <span><small>STAR WARS</small><b>GALACTIC</b><i>DUEL</i></span>
        </button>
        <div className="game-status">{screen === "battle" ? `${arenas.find(a => a.id === arenaId)?.name} • ROUND ${round}` : screen === "select" ? "SELEÇÃO DE COMBATE" : "A FORÇA CHAMA"}</div>
        <button className="roster-button" onClick={() => screen === "battle" ? leaveBattle() : setScreen(screen === "select" ? "menu" : "select")}>{screen === "select" ? "VOLTAR" : "NOVO COMBATE"}</button>
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
          <button className="pause-button" onClick={togglePause} aria-pressed={isPaused}>
            {isPaused ? "▶ CONTINUAR" : "Ⅱ PAUSAR"}
          </button>
          <button className="fullscreen-button" onClick={() => void toggleFullscreen()} aria-pressed={isFullscreen}>
            {isFullscreen ? "⛶ SAIR DA TELA CHEIA" : "⛶ ENTRAR NA TELA CHEIA"}
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
            <div className="versus"><span>{String(round).padStart(2, "0")}</span><b>VS</b><small>{roundWins} × {roundLosses}</small></div>
            <div className="hud-player enemy">
              <div className="hud-name"><small>CPU</small><div><b>{rival.name}</b><span>{rival.title}</span></div></div>
              <Bar value={rivalHp} kind="health" />
              <div className="force-row"><b>CPU</b><Bar value={rivalForce} kind="force" /><span>ÓDIO</span></div>
            </div>
          </div>

          <div className={`arena ${rivalAction === "hit" ? "has-impact" : ""} ${isPaused ? "is-paused" : ""}`}>
            <div className="stars far" /><div className="stars near" />
            <div className="sun" /><div className="planet" />
            <div className="mountains back" /><div className="mountains front" />
            <div className="temple"><i /><i /><i /></div>
            <div className="stage-elements"><i /><i /><i /><i /></div>
            <div className="ambient-particles">{[0, 1, 2, 3, 4, 5, 6, 7].map(i => <i key={i} />)}</div>
            <div className="floor-lines" />
            {message && !roundResult && <div className={`fight-message ${message.length > 12 ? "long" : ""}`}>{message}</div>}
            {roundResult && <div className="round-result" role="status">
              <span>ROUND {String(round).padStart(2, "0")}</span>
              <h2>{roundResult === "victory" ? "VITÓRIA" : "DERROTA"}</h2>
              <p>Placar: {roundWins} vitória{roundWins === 1 ? "" : "s"} · {roundLosses} derrota{roundLosses === 1 ? "" : "s"}</p>
              <button type="button" onClick={advanceRound}>PRÓXIMO ROUND ▶</button>
              <small>O próximo round começa automaticamente.</small>
            </div>}
            {isPaused && <div className="pause-overlay" role="status">
              <span>BATALHA PAUSADA</span>
              <button type="button" onClick={togglePause}>▶ RETOMAR</button>
              <small>Pressione Esc para continuar</small>
            </div>}
            {combo > 1 && <div className="combo-counter"><b>{combo}x</b><span>COMBO</span></div>}
            <div className="combatant hero-fighter" style={{ left: `${heroX}%` }}><PixelFighter fighter={hero} action={heroAction} facing={heroFacing} /></div>
            <div className="combatant rival-fighter" style={{ left: `${rivalX}%` }}><PixelFighter fighter={rival} action={rivalAction} facing={-heroFacing} cpu /></div>
            {impact > 0 && <div className="hit-spark" key={impact} style={{ left: `${rivalX}%` }}><i /><i /><i /><i /></div>}
          </div>

          <div className="control-deck">
            <div className="controls">
              <span className="control-label">MOVIMENTO</span>
              <ControlButton label="TRÁS" shortcut="A / ←" control="left" pressed={held("left")} onPress={pressControl} onRelease={releaseControl} />
              <ControlButton label="FRENTE" shortcut="D / →" control="right" pressed={held("right")} onPress={pressControl} onRelease={releaseControl} />
              <ControlButton label="AGACHA" shortcut="S / ↓" control="crouch" pressed={held("crouch")} onPress={pressControl} onRelease={releaseControl} />
              <ControlButton label="PULA" shortcut="W / ↑" control="jump" onPress={pressControl} onRelease={releaseControl} />
            </div>
            <div className="controls action-controls">
              <ControlButton label="ATACA" shortcut="J" control="attack" tone="red" onPress={pressControl} onRelease={releaseControl} />
              <ControlButton label="DEFENDE" shortcut="K" control="defend" tone="blue" pressed={held("defend")} onPress={pressControl} onRelease={releaseControl} />
              <ControlButton label="SUPER" shortcut="L" control="special" tone="gold" disabled={force < 100 || locked.current} onPress={pressControl} onRelease={releaseControl} />
            </div>
            <button className="reset-button" onClick={() => roundResult ? advanceRound() : resetRound(hero, rival, round)}><span>↻</span> {roundResult ? "PRÓXIMO ROUND" : "REINICIAR ROUND"}</button>
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

      <ArcadePlayer />

      <footer>
        <div className="brand mini"><span className="brand-mark">SW</span><span><small>STAR WARS</small><b>GALACTIC</b><i>DUEL</i></span></div>
        <p>Projeto de fã não oficial, sem fins comerciais. Personagens pertencem aos seus respectivos detentores.</p>
        <p className="copyright" style={{ color: "var(--yellow)", marginTop: "10px", fontSize: "10px" }}>&copy; Todos os direitos reservados EnzoToniato567, davi-lm7, Murilo1602 e HenriqueAlth09 2026</p>
        <a href="https://github.com/EnzoToniato567/StarWars-Galactic-Duel.git" target="_blank" rel="noreferrer">VER NO GITHUB ↗</a>
      </footer>
    </main>
  );
}
