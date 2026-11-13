/* Banco de perguntas.
   p = pergunta, o = opções, c = posição da opção certa (0 = primeira, 1 = segunda, 2 = terceira).
   Para acrescentar uma pergunta, copia uma linha e muda o texto. */
const BANCO = {
  "Matemática": [
    { p: "Qual é o valor de x na equação 2x + 6 = 14?", o: ["3", "4", "5"], c: 1 },
    { p: "Quanto é a raiz quadrada de 144?", o: ["11", "14", "12"], c: 2 },
    { p: "Qual é a soma dos ângulos internos de um triângulo?", o: ["360°", "90°", "180°"], c: 2 },
    { p: "Qual é a fórmula da área de um círculo de raio r?", o: ["π · r²", "2 · π · r", "π · r"], c: 0 },
    { p: "Qual é a derivada de f(x) = x²?", o: ["x", "2x", "x²"], c: 1 },
    { p: "Quanto vale sen 30°?", o: ["√3/2", "1", "1/2"], c: 2 },
    { p: "Quanto é 2⁵?", o: ["10", "32", "25"], c: 1 },
    { p: "Num triângulo rectângulo, o quadrado da hipotenusa é igual a:", o: ["à soma dos quadrados dos catetos", "ao produto dos catetos", "à soma dos catetos"], c: 0 },
    { p: "Qual é a expressão do discriminante (Δ) de ax² + bx + c = 0?", o: ["b² + 4ac", "b² − 4ac", "4ac − b²"], c: 1 },
    { p: "Quanto vale log₁₀(1000)?", o: ["2", "10", "3"], c: 2 }
  ],

  "Física": [
    { p: "Qual é a unidade SI de energia?", o: ["Joule", "Newton", "Watt"], c: 0 },
    { p: "Segundo a 2.ª lei de Newton, a força resultante é dada por:", o: ["F = m / a", "F = m · a", "F = m + a"], c: 1 },
    { p: "Qual é o valor aproximado da aceleração da gravidade à superfície da Terra?", o: ["1,6 m/s²", "98 m/s²", "9,8 m/s²"], c: 2 },
    { p: "A lei de Ohm relaciona a tensão (V), a resistência (R) e a corrente (I) por:", o: ["V = R · I", "V = R / I", "V = R + I"], c: 0 },
    { p: "Qual é a unidade SI de frequência?", o: ["Watt", "Hertz", "Volt"], c: 1 },
    { p: "Que tipo de energia possui um corpo pelo facto de estar em movimento?", o: ["Potencial", "Térmica", "Cinética"], c: 2 },
    { p: "Qual é a unidade SI de potência?", o: ["Watt", "Joule", "Pascal"], c: 0 },
    { p: "A velocidade média calcula-se dividindo:", o: ["o tempo pela distância", "a distância pelo tempo", "a distância pela massa"], c: 1 },
    { p: "A lei da inércia corresponde a que lei de Newton?", o: ["À 2.ª lei", "À 3.ª lei", "À 1.ª lei"], c: 2 },
    { p: "Qual é a unidade SI de pressão?", o: ["Pascal", "Newton", "Joule"], c: 0 }
  ],

  "Química": [
    { p: "Qual é o símbolo químico do sódio?", o: ["Na", "N", "Sd"], c: 0 },
    { p: "Qual é o pH da água pura a 25 °C?", o: ["0", "7", "14"], c: 1 },
    { p: "O número atómico de um elemento corresponde ao número de:", o: ["neutrões", "protões + neutrões", "protões"], c: 2 },
    { p: "Qual é a fórmula química do sal de cozinha?", o: ["NaCl", "KCl", "CaCO₃"], c: 0 },
    { p: "Qual destes elementos é um gás nobre?", o: ["Oxigénio", "Hélio", "Azoto"], c: 1 },
    { p: "Uma solução ácida tem pH:", o: ["igual a 7", "maior que 7", "menor que 7"], c: 2 },
    { p: "Qual é o símbolo químico do ferro?", o: ["Fe", "F", "Fr"], c: 0 },
    { p: "A ligação entre iões de cargas opostas chama-se:", o: ["covalente", "iónica", "metálica"], c: 1 },
    { p: "A passagem do estado líquido para o estado gasoso chama-se:", o: ["fusão", "solidificação", "vaporização"], c: 2 },
    { p: "Qual é a fórmula química do dióxido de carbono?", o: ["CO₂", "CO", "C₂O"], c: 0 }
  ],

  "Biologia": [
    { p: "Qual é o organelo responsável pela produção de energia na respiração celular?", o: ["Núcleo", "Mitocôndria", "Ribossoma"], c: 1 },
    { p: "Como se chama o pigmento verde responsável pela fotossíntese?", o: ["Hemoglobina", "Melanina", "Clorofila"], c: 2 },
    { p: "Quantos cromossomas tem uma célula somática humana?", o: ["23", "46", "48"], c: 1 },
    { p: "Os glóbulos vermelhos (eritrócitos) transportam principalmente:", o: ["oxigénio", "anticorpos", "hormonas"], c: 0 },
    { p: "Que molécula guarda a informação genética nos seres vivos?", o: ["ATP", "Glicose", "ADN"], c: 2 },
    { p: "Qual é a unidade básica estrutural e funcional dos seres vivos?", o: ["Célula", "Tecido", "Órgão"], c: 0 },
    { p: "A malária é transmitida pela picada de um mosquito do género:", o: ["Aedes", "Anopheles", "Culex"], c: 1 },
    { p: "Em que organelos das células vegetais ocorre a fotossíntese?", o: ["Mitocôndrias", "Vacúolos", "Cloroplastos"], c: 2 },
    { p: "A falta de qual vitamina causa o escorbuto?", o: ["Vitamina A", "Vitamina D", "Vitamina C"], c: 2 },
    { p: "Numa cadeia alimentar, as plantas são:", o: ["consumidoras", "produtoras", "decompositoras"], c: 1 }
  ],

  "Filosofia": [
    { p: "A palavra «filosofia», de origem grega, significa:", o: ["amor à sabedoria", "estudo da natureza", "arte de falar bem"], c: 0 },
    { p: "Quem é o autor da frase «Penso, logo existo»?", o: ["Platão", "Kant", "Descartes"], c: 2 },
    { p: "Quem foi o mestre de Platão?", o: ["Aristóteles", "Sócrates", "Tales de Mileto"], c: 1 },
    { p: "Aristóteles foi discípulo de:", o: ["Platão", "Sócrates", "Pitágoras"], c: 0 },
    { p: "Que ramo da filosofia estuda o conhecimento (origem, limites e validade)?", o: ["Ética", "Estética", "Teoria do conhecimento (Gnosiologia)"], c: 2 },
    { p: "Que ramo da filosofia estuda a moral e o comportamento humano?", o: ["Lógica", "Ética", "Metafísica"], c: 1 },
    { p: "Como se chama o método de Sócrates, baseado em perguntas, que ajuda o interlocutor a descobrir a verdade?", o: ["Indução experimental", "Dúvida metódica", "Maiêutica"], c: 2 },
    { p: "A «Alegoria da Caverna» é um texto de:", o: ["Platão", "Aristóteles", "Descartes"], c: 0 },
    { p: "O racionalismo defende que a principal fonte do conhecimento é:", o: ["a experiência dos sentidos", "a fé", "a razão"], c: 2 },
    { p: "A Lógica é a parte da filosofia que estuda:", o: ["os valores morais", "as regras do raciocínio correcto", "a beleza"], c: 1 }
  ],

  "Antropologia Cultural de Moçambique": [
    { p: "A Antropologia Cultural estuda:", o: ["as rochas e os solos", "a cultura e o modo de vida dos povos", "os astros e os planetas"], c: 1 },
    { p: "As timbilas, instrumentos musicais de lâminas de madeira (xilofones), são tradição de qual povo?", o: ["Macondes", "Macuas", "Chopes"], c: 2 },
    { p: "O Mapiko, dança de máscaras, é uma tradição de qual povo?", o: ["Macondes", "Chopes", "Ndaus"], c: 0 },
    { p: "No sul de Moçambique, como se chama o pagamento feito pela família do noivo à família da noiva?", o: ["Dote", "Lobolo", "Herança"], c: 1 },
    { p: "Que sítio de Moçambique foi classificado Património Mundial da UNESCO em 1991?", o: ["Ilha de Inhaca", "Cidade de Tete", "Ilha de Moçambique"], c: 2 },
    { p: "Qual é a língua oficial de Moçambique?", o: ["Português", "Suaíli", "Changana"], c: 0 },
    { p: "A marrabenta é um género musical originário da região de:", o: ["Nampula", "Maputo", "Cabo Delgado"], c: 1 },
    { p: "A maior parte das línguas nacionais moçambicanas pertence à família linguística:", o: ["Indo-europeia", "Semítica", "Bantu"], c: 2 },
    { p: "Tradicionalmente, os Macuas, do norte de Moçambique, organizam-se num sistema de descendência:", o: ["patrilinear", "matrilinear", "bilateral"], c: 1 },
    { p: "Em muitas culturas tradicionais moçambicanas, as cerimónias de respeito pelos espíritos dos familiares falecidos chamam-se culto aos:", o: ["antepassados", "astros", "animais"], c: 0 }
  ]
};