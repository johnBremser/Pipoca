export interface DialogueStep {
  speaker: 'pipoca' | 'baby' | 'boss' | 'oswaldao';
  speakerName: string;
  text: string;
  mood: 'determined' | 'happy' | 'hurt' | 'confess';
}

export interface PostBossCutscene {
  stageId: number;
  nextStageName: string | null;
  steps: DialogueStep[];
}

export const POST_BOSS_CUTSCENES: Record<number, PostBossCutscene> = {
  1: {
    stageId: 1,
    nextStageName: 'Floresta dos Cogumelos',
    steps: [
      {
        speaker: 'baby',
        speakerName: 'Laranjinha',
        text: 'Mamãe Pipoca! Você estourou a bolha e me salvou!',
        mood: 'happy',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'Que alívio, Laranjinha! Agora me diga, Rei Jacaré: onde estão os meus outros 7 filhotinhos?!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Rei Jacaré Soneca',
        text: 'Ai, meu cocuruto! Eu não sei de todos... quem levou a Bolinha foi o Corujão Maestro!',
        mood: 'hurt',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'E onde eu encontro esse Corujão Maestro?!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Rei Jacaré Soneca',
        text: 'Vá para a Floresta dos Cogumelos! Ele fica nas copas gigantes lá no alto... agora deixa eu tirar um cochilo...',
        mood: 'confess',
      },
    ],
  },
  2: {
    stageId: 2,
    nextStageName: 'Cachoeira de Espuma',
    steps: [
      {
        speaker: 'baby',
        speakerName: 'Bolinha',
        text: 'Uhuu! Mamãe, você quicou muito alto nos cogumelos!',
        mood: 'happy',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'Estou chegando, filhotes! Corujão Maestro, fale logo: onde estão os outros?!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Corujão Maestro',
        text: 'Ui, meus óculos ficaram tortos! Eu só guardei um... o Polvo Bolha-Bolha está com a Gotinha!',
        mood: 'hurt',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'Onde esse Polvo se escondeu?!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Corujão Maestro',
        text: 'Vá para a Cachoeira de Espuma! Procure os gêiseres de água que levam até a arena dele!',
        mood: 'confess',
      },
    ],
  },
  3: {
    stageId: 3,
    nextStageName: 'Fazenda do Sol',
    steps: [
      {
        speaker: 'baby',
        speakerName: 'Gotinha',
        text: 'Mamãe Pipoca! A bolha estourou e eu estou livre!',
        mood: 'happy',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'Já salvei três! Polvo Bolha-Bolha, onde o Barão Raposão escondeu os próximos?!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Polvo Bolha-Bolha',
        text: 'Ai, meus tentáculos deram nó! Quem está vigiando a Paçoca é o Trator Maluco!',
        mood: 'hurt',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'E para onde eu devo correr para achar esse Trator?!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Polvo Bolha-Bolha',
        text: 'Vá para a Fazenda do Sol! Cuidado com os moinhos giratórios e com a corrida dele!',
        mood: 'confess',
      },
    ],
  },
  4: {
    stageId: 4,
    nextStageName: 'Caverna dos Cristais',
    steps: [
      {
        speaker: 'baby',
        speakerName: 'Paçoca',
        text: 'Eba! Você freou aquele trator barulhento, mamãe!',
        mood: 'happy',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'Metade da família já está salva! Trator Maluco, para onde foi o próximo filhotinho?!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Trator Maluco',
        text: 'Cof, cof... minha chaminé entortou! O Tatu-Rei Metálico levou a Estrelinha lá para baixo da terra!',
        mood: 'hurt',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'Onde fica a toca desse Tatu-Rei?!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Trator Maluco',
        text: 'Vá para a Caverna dos Cristais! Use o seu rolamento veloz nos trilhos brilhantes para alcançá-lo!',
        mood: 'confess',
      },
    ],
  },
  5: {
    stageId: 5,
    nextStageName: 'Montanha Algodão-Doce',
    steps: [
      {
        speaker: 'baby',
        speakerName: 'Estrelinha',
        text: 'Mamãe! Os cristais estavam brilhando, mas eu queria você!',
        mood: 'happy',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'Nunca mais solto vocês! Tatu-Rei, fale rápido: quem está com os outros três?!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Tatu-Rei Metálico',
        text: 'Ai, minha cabeça está girando até agora! A Nuvem Trovão Birrenta pegou o Pudim e subiu bem alto!',
        mood: 'hurt',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'Onde ela está escondida?!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Tatu-Rei Metálico',
        text: 'Vá para a Montanha Algodão-Doce! Pule rápido pelas nuvens fofinhas lá no céu!',
        mood: 'confess',
      },
    ],
  },
  6: {
    stageId: 6,
    nextStageName: 'Parque dos Brinquedos',
    steps: [
      {
        speaker: 'baby',
        speakerName: 'Pudim',
        text: 'Mamãe Pipoca! Você voou pelas nuvens como um foguete!',
        mood: 'happy',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'Só faltam dois! Nuvem Trovão, onde está a Jujuba e o Fofucho?!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Nuvem Trovão Birrenta',
        text: 'Snif... você venceu meus raios! O Robô-Caixa Surpresa trancou a Jujuba no meio dos brinquedos!',
        mood: 'hurt',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'Qual é o caminho para esse Robô?!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Nuvem Trovão Birrenta',
        text: 'Vá para o Parque dos Brinquedos! O Barão Raposão deixou ele vigiando a entrada do castelo!',
        mood: 'confess',
      },
    ],
  },
  7: {
    stageId: 7,
    nextStageName: 'Castelo do Barão Raposão',
    steps: [
      {
        speaker: 'baby',
        speakerName: 'Jujuba',
        text: 'Oba!! Só falta o Fofucho agora, mamãe!',
        mood: 'happy',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'Agora é pessoal! Robô-Caixa, onde está o próprio Barão Raposão?!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Robô-Caixa Surpresa',
        text: 'Bip-bop... minha mola quebrou! O Barão Raposão está com o último filhotinho no trono dele!',
        mood: 'hurt',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'Diga logo onde fica esse trono!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Robô-Caixa Surpresa',
        text: 'Vá direto para o Castelo do Barão Raposão! Use os canhões de confete e mostre quem manda!',
        mood: 'confess',
      },
    ],
  },
  8: {
    stageId: 8,
    nextStageName: null,
    steps: [
      {
        speaker: 'baby',
        speakerName: 'Fofucho',
        text: 'Mamãe Pipoca! Você derrotou o grande vilão e salvou todos nós!',
        mood: 'happy',
      },
      {
        speaker: 'boss',
        speakerName: 'Barão Raposão',
        text: 'Ai, ai, minha cartola! Desculpe, Dona Pipoca e Seu Oswaldão... prometo que nunca mais mexo com nenhuma capivarinha!',
        mood: 'hurt',
      },
      {
        speaker: 'oswaldao',
        speakerName: 'Papai Oswaldão',
        text: 'Mandou bem demais, Pipoca! Agora todos os nossos 8 filhotinhos estão salvos e protegidos com a gente!',
        mood: 'happy',
      },
      {
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'Finalmente conseguimos! Agora a família toda reunida vai se juntar à Liz para comemorar com muita festa e tangerina!',
        mood: 'happy',
      },
      {
        speaker: 'baby',
        speakerName: 'Todos os 8 Filhotinhos',
        text: 'Viva a Mamãe Pipoca, viva o Papai Oswaldão e viva a nossa amiga Liz!',
        mood: 'happy',
      },
    ],
  },
};

export type VoiceRole = 'pipoca' | 'baby' | 'oswaldao' | 'boss';

const MALE_VOICE_RE =
  /\b(male|masculin\w*|homem|man|daniel|ant[oô]nio|f[aá]bio|humberto|j[uú]lio|nicolau|val[eé]rio|donato|duarte|felipe|eddy|reed|rocko|grandpa|cristiano|joaquim|tiago|thiago|carlos|rafael|pedro|lucas|gabriel|henrique|bruno|marcos|paulo|ricardo)\b|#male|pt-br-x-pte/i;

const FEMALE_VOICE_RE =
  /\b(female|feminin\w*|mulher|woman|maria|francisca|luciana|brenda|elza|giovanna|leila|let[ií]cia|manuela|thalita|yara|raquel|fernanda|joana|catarina|in[eê]s|flo|sandy|shelley|grandma|camila|vit[oó]ria|helena|sofia|clara|ana)\b|#female|pt-br-x-afs|pt-br-x-ptd/i;

let cachedVoices: SpeechSynthesisVoice[] = [];
let pendingSpeechCleanup: (() => void) | null = null;

function refreshVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const list = window.speechSynthesis.getVoices();
  if (list.length > 0) {
    cachedVoices = list;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
}

function getVoiceTag(v: SpeechSynthesisVoice): string {
  return `${v.name} ${v.voiceURI}`.toLowerCase();
}

function pickPortugueseVoice(
  voices: SpeechSynthesisVoice[],
  desiredGender: 'female' | 'male'
): {voice: SpeechSynthesisVoice | null; isConfirmedMatch: boolean} {
  const ptBrVoices = voices.filter((v) =>
    v.lang.toLowerCase().replace('_', '-').startsWith('pt-br')
  );
  const ptAnyVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith('pt')
  );
  const pool = ptBrVoices.length > 0 ? ptBrVoices : ptAnyVoices;

  if (pool.length === 0) {
    return {voice: null, isConfirmedMatch: false};
  }

  const isMale = (v: SpeechSynthesisVoice) => MALE_VOICE_RE.test(getVoiceTag(v));
  const isFemale = (v: SpeechSynthesisVoice) =>
    FEMALE_VOICE_RE.test(getVoiceTag(v)) && !isMale(v);

  if (desiredGender === 'female') {
    const exact =
      ptBrVoices.find(isFemale) ??
      ptAnyVoices.find(isFemale) ??
      pool.find((v) => !isMale(v));
    if (exact) {
      return {voice: exact, isConfirmedMatch: true};
    }
    return {voice: pool[0], isConfirmedMatch: false};
  }

  // Male voice selection (Oswaldão & Bosses)
  const exactMale = ptBrVoices.find(isMale) ?? ptAnyVoices.find(isMale);
  if (exactMale) {
    return {voice: exactMale, isConfirmedMatch: true};
  }

  // If no explicit male label exists, prefer a distinct second PT voice if available
  const femaleDefault = ptBrVoices.find(isFemale) ?? pool[0];
  const alternate = pool.find((v) => v !== femaleDefault && !isFemale(v));
  if (alternate) {
    return {voice: alternate, isConfirmedMatch: false};
  }

  return {voice: pool[0], isConfirmedMatch: false};
}

function getProsodyForRole(
  role: VoiceRole,
  isConfirmedMale: boolean,
  stageId = 1
): {pitch: number; rate: number} {
  if (role === 'pipoca') {
    return {pitch: 1.2, rate: 1.03};
  }
  if (role === 'baby') {
    return {pitch: 1.58, rate: 1.12};
  }
  if (role === 'oswaldao') {
    return isConfirmedMale
      ? {pitch: 0.86, rate: 0.94}
      : {pitch: 0.54, rate: 0.9};
  }

  // Bosses: distinct masculine cartoon character tones per stage (1..8)
  const bossProfilesConfirmed: Record<number, {pitch: number; rate: number}> = {
    1: {pitch: 0.72, rate: 0.88}, // Rei Jacaré Soneca (sonolento e grave)
    2: {pitch: 0.92, rate: 1.02}, // Corujão Maestro (teatral)
    3: {pitch: 0.84, rate: 0.96}, // Polvo Bolha-Bolha
    4: {pitch: 0.76, rate: 0.98}, // Trator Maluco (ronco forte)
    5: {pitch: 0.8, rate: 1.04},  // Tatu-Rei Metálico (agitado)
    6: {pitch: 0.88, rate: 0.95}, // Nuvem Trovão Birrenta
    7: {pitch: 0.94, rate: 1.06}, // Robô-Caixa Surpresa (robótico rápido)
    8: {pitch: 0.78, rate: 0.94}, // Barão Raposão (vilão clássico)
  };

  const bossProfilesFallback: Record<number, {pitch: number; rate: number}> = {
    1: {pitch: 0.42, rate: 0.86},
    2: {pitch: 0.58, rate: 1.0},
    3: {pitch: 0.52, rate: 0.94},
    4: {pitch: 0.45, rate: 0.96},
    5: {pitch: 0.5, rate: 1.02},
    6: {pitch: 0.56, rate: 0.94},
    7: {pitch: 0.6, rate: 1.05},
    8: {pitch: 0.46, rate: 0.92},
  };

  return isConfirmedMale
    ? bossProfilesConfirmed[stageId] ?? {pitch: 0.82, rate: 0.96}
    : bossProfilesFallback[stageId] ?? {pitch: 0.48, rate: 0.94};
}

export function speakPortuguese(
  text: string,
  enabled: boolean,
  role: VoiceRole = 'pipoca',
  stageId = 1
) {
  stopPortugueseSpeech();
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const doSpeak = (voices: SpeechSynthesisVoice[]) => {
    try {
      window.speechSynthesis.cancel();
      const desiredGender =
        role === 'oswaldao' || role === 'boss' ? 'male' : 'female';
      const {voice, isConfirmedMatch} = pickPortugueseVoice(
        voices,
        desiredGender
      );
      const {pitch, rate} = getProsodyForRole(
        role,
        desiredGender === 'male' && isConfirmedMatch,
        stageId
      );

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = voice?.lang || 'pt-BR';
      utter.pitch = pitch;
      utter.rate = rate;
      if (voice) {
        utter.voice = voice;
      }
      window.speechSynthesis.speak(utter);
    } catch {
      // Ignore speech synthesis errors on restricted browsers
    }
  };

  const voices = refreshVoices();
  if (voices.length > 0) {
    doSpeak(voices);
    return;
  }

  // Wait briefly on first load if browser hasn't populated voices yet
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    cleanup();
    doSpeak(refreshVoices());
  };
  const onVoicesChanged = () => finish();
  const timerId = window.setTimeout(finish, 260);
  const cleanup = () => {
    window.clearTimeout(timerId);
    window.speechSynthesis.removeEventListener?.(
      'voiceschanged',
      onVoicesChanged
    );
    if (pendingSpeechCleanup === cleanup) {
      pendingSpeechCleanup = null;
    }
  };
  pendingSpeechCleanup = cleanup;
  window.speechSynthesis.addEventListener?.('voiceschanged', onVoicesChanged);
}

export function stopPortugueseSpeech() {
  if (pendingSpeechCleanup) {
    pendingSpeechCleanup();
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
