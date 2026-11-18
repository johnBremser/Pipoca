export interface DialogueStep {
  speaker: 'pipoca' | 'baby' | 'boss';
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
        speaker: 'pipoca',
        speakerName: 'Pipoca',
        text: 'Missão cumprida! Agora todos os 8 filhotinhos estão juntos comigo de novo — e você aprendeu a lição, Barão Raposão!',
        mood: 'determined',
      },
      {
        speaker: 'boss',
        speakerName: 'Barão Raposão',
        text: 'Ai, ai, minha cartola! Desculpe, Dona Pipoca... prometo que nunca mais mexo com nenhuma capivarinha!',
        mood: 'hurt',
      },
      {
        speaker: 'baby',
        speakerName: 'Todos os 8 Filhotinhos',
        text: 'Viva a Mamãe Pipoca! Vamos comemorar com muita tangerina na Lagoa das Laranjas!',
        mood: 'happy',
      },
    ],
  },
};

export function speakPortuguese(text: string, enabled: boolean, pitch = 1.05) {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.rate = 1.02;
    utter.pitch = pitch;
    const voices = window.speechSynthesis.getVoices();
    const ptVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith('pt-br')) ??
      voices.find((v) => v.lang.toLowerCase().startsWith('pt'));
    if (ptVoice) utter.voice = ptVoice;
    window.speechSynthesis.speak(utter);
  } catch {
    // Ignore speech synthesis errors on restricted browsers
  }
}

export function stopPortugueseSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
