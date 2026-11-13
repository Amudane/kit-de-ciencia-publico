(function () {
  const CHAVE = "kit-quiz-historico";
  const MAX_HISTORICO = 50;

  function $(id) {
    return document.getElementById(id);
  }

  function criar(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) {
      e.className = classe;
    }
    if (texto !== undefined) {
      e.textContent = texto;
    }
    return e;
  }

  function baralhar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copia[i];
      copia[i] = copia[j];
      copia[j] = tmp;
    }
    return copia;
  }

  /* ===== Elementos ===== */
  const ecras = {
    escolha: $("quiz-escolha"),
    pergunta: $("quiz-pergunta"),
    resultado: $("quiz-resultado"),
    historico: $("quiz-historico")
  };

  const divDisciplinas = $("quiz-disciplinas");
  const selNumero = $("quiz-numero");
  const aviso = $("quiz-aviso");

  const progresso = $("quiz-progresso");
  const barra = $("quiz-barra");
  const etiquetaDisc = $("quiz-disciplina");
  const textoPergunta = $("quiz-texto");
  const divOpcoes = $("quiz-opcoes");
  const feedback = $("quiz-feedback");
  const btnSeguinte = $("btn-seguinte");

  const resPontuacao = $("res-pontuacao");
  const resMensagem = $("res-mensagem");
  const resDisciplinas = $("res-disciplinas");
  const btnRefazer = $("btn-refazer-erros");

  const histResumo = $("hist-resumo");
  const histLista = $("hist-lista");

  /* Linha que mostra as disciplinas seleccionadas (criada aqui, por baixo das fichas) */
  const resumo = criar("p", "suave");
  resumo.style.marginBottom = "16px";
  divDisciplinas.parentNode.insertBefore(resumo, divDisciplinas.nextSibling);

  const escolhidas = new Set();
  let sessao = null;

  /* ===== Escolha de disciplinas ===== */
  function actualizarResumo() {
    if (escolhidas.size === 0) {
      resumo.textContent = "Nenhuma disciplina seleccionada.";
    } else {
      resumo.textContent = "Seleccionadas: " + Array.from(escolhidas).join(", ");
    }
  }

  function limparEscolha() {
    escolhidas.clear();
    divDisciplinas.querySelectorAll(".ficha").forEach(function (f) {
      f.classList.remove("activa");
    });
    aviso.textContent = "";
    actualizarResumo();
  }

  function mostrarEcra(nome) {
    Object.keys(ecras).forEach(function (chave) {
      ecras[chave].hidden = chave !== nome;
    });
    if (nome === "escolha") {
      limparEscolha();
    }
  }

  function construirFichas() {
    Object.keys(BANCO).forEach(function (nome) {
      const ficha = criar("button", "ficha", nome + " (" + BANCO[nome].length + ")");
      ficha.type = "button";
      ficha.addEventListener("click", function () {
        if (escolhidas.has(nome)) {
          escolhidas.delete(nome);
          ficha.classList.remove("activa");
        } else {
          escolhidas.add(nome);
          ficha.classList.add("activa");
        }
        aviso.textContent = "";
        actualizarResumo();
      });
      divDisciplinas.appendChild(ficha);
    });
  }

  /* ===== Histórico (guardado no navegador) ===== */
  function lerHistorico() {
    try {
      const lista = JSON.parse(localStorage.getItem(CHAVE));
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  }

  function guardarHistorico(lista) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(lista));
    } catch (e) {}
  }

  /* ===== Desempenho por disciplina ===== */
  function estatisticas(itens) {
    const r = {};
    itens.forEach(function (item) {
      if (!r[item.disciplina]) {
        r[item.disciplina] = { certas: 0, total: 0 };
      }
      r[item.disciplina].total += 1;
      if (item.acertou) {
        r[item.disciplina].certas += 1;
      }
    });
    return r;
  }

  function desenharDesempenho(contentor, stats) {
    contentor.textContent = "";
    Object.keys(stats).forEach(function (nome) {
      const s = stats[nome];
      const pct = Math.round((s.certas / s.total) * 100);

      const linha = criar("div", "linha-disc");
      linha.appendChild(criar("span", "linha-nome", nome));

      const caixa = criar("div", "barra");
      const cheia = criar("div", "barra-cheia");
      cheia.style.width = pct + "%";
      caixa.appendChild(cheia);
      linha.appendChild(caixa);

      linha.appendChild(criar("span", "linha-valor", s.certas + "/" + s.total + " (" + pct + "%)"));
      contentor.appendChild(linha);
    });
  }

  /* ===== Sessão de perguntas ===== */
  function prepararPergunta(disciplina, texto, opcoes, indiceCerto) {
    const ordem = baralhar(opcoes.map(function (_, i) { return i; }));
    return {
      disciplina: disciplina,
      pergunta: texto,
      opcoes: ordem.map(function (i) { return opcoes[i]; }),
      certa: ordem.indexOf(indiceCerto),
      escolhida: null
    };
  }

  function iniciarSessao(perguntas, rotulo) {
    sessao = { rotulo: rotulo, perguntas: perguntas, indice: 0, pontos: 0 };
    mostrarEcra("pergunta");
    mostrarPergunta();
  }

  function comecar() {
    if (escolhidas.size === 0) {
      aviso.textContent = "Escolhe pelo menos uma disciplina.";
      return;
    }

    const pool = [];
    escolhidas.forEach(function (nome) {
      BANCO[nome].forEach(function (q) {
        pool.push(prepararPergunta(nome, q.p, q.o, q.c));
      });
    });

    const quantas = parseInt(selNumero.value, 10);
    iniciarSessao(baralhar(pool).slice(0, quantas), "");
  }

  function mostrarPergunta() {
    const q = sessao.perguntas[sessao.indice];
    const total = sessao.perguntas.length;

    progresso.textContent = "Pergunta " + (sessao.indice + 1) + " de " + total;
    barra.style.width = (sessao.indice / total) * 100 + "%";
    etiquetaDisc.textContent = q.disciplina;
    textoPergunta.textContent = q.pergunta;
    feedback.textContent = "";
    feedback.className = "feedback";
    btnSeguinte.hidden = true;

    divOpcoes.textContent = "";
    q.opcoes.forEach(function (texto, i) {
      const botao = criar("button", "opcao", String.fromCharCode(65 + i) + ") " + texto);
      botao.type = "button";
      botao.addEventListener("click", function () {
        responder(i);
      });
      divOpcoes.appendChild(botao);
    });
  }

  function responder(i) {
    const q = sessao.perguntas[sessao.indice];
    if (q.escolhida !== null) {
      return;
    }
    q.escolhida = i;

    divOpcoes.querySelectorAll(".opcao").forEach(function (botao, k) {
      botao.disabled = true;
      if (k === q.certa) {
        botao.classList.add("certa");
      } else if (k === i) {
        botao.classList.add("errada");
      }
    });

    if (i === q.certa) {
      sessao.pontos += 1;
      feedback.textContent = "Correcto!";
      feedback.className = "feedback ok";
    } else {
      feedback.textContent = "Errado. A resposta certa é: " + q.opcoes[q.certa];
      feedback.className = "feedback mau";
    }

    const ultima = sessao.indice === sessao.perguntas.length - 1;
    btnSeguinte.textContent = ultima ? "Ver resultado" : "Seguinte";
    btnSeguinte.hidden = false;
  }

  function seguinte() {
    if (sessao.indice === sessao.perguntas.length - 1) {
      terminar();
    } else {
      sessao.indice += 1;
      mostrarPergunta();
    }
  }

  /* ===== Resultado ===== */
  function terminar() {
    const total = sessao.perguntas.length;

    const registo = {
      data: new Date().toISOString(),
      rotulo: sessao.rotulo,
      pontos: sessao.pontos,
      total: total,
      itens: sessao.perguntas.map(function (q) {
        return {
          disciplina: q.disciplina,
          pergunta: q.pergunta,
          escolhida: q.opcoes[q.escolhida],
          certa: q.opcoes[q.certa],
          acertou: q.escolhida === q.certa
        };
      })
    };

    const historico = lerHistorico();
    historico.push(registo);
    guardarHistorico(historico.slice(-MAX_HISTORICO));

    const pct = Math.round((registo.pontos / total) * 100);
    resPontuacao.textContent = registo.pontos + "/" + total + " · " + pct + "%";

    if (pct === 100) {
      resMensagem.textContent = "Perfeito! Dominaste este conjunto de perguntas.";
    } else if (pct >= 70) {
      resMensagem.textContent = "Muito bem! Revê as que falhaste para chegares aos 100%.";
    } else if (pct >= 50) {
      resMensagem.textContent = "Bom começo. Com mais estudo vais melhorar.";
    } else {
      resMensagem.textContent = "Ainda tens trabalho a fazer. Usa o botão abaixo para treinar os erros.";
    }

    desenharDesempenho(resDisciplinas, estatisticas(registo.itens));

    btnRefazer.hidden = registo.pontos === total;

    mostrarEcra("resultado");
  }

  function refazerErros() {
    const erradas = sessao.perguntas
      .filter(function (q) { return q.escolhida !== q.certa; })
      .map(function (q) {
        return prepararPergunta(q.disciplina, q.pergunta, q.opcoes, q.certa);
      });
    iniciarSessao(baralhar(erradas), "Revisão de erros");
  }

  /* ===== Histórico ===== */
  function criarSessao(r) {
    const pct = Math.round((r.pontos / r.total) * 100);
    const nomes = [];
    r.itens.forEach(function (i) {
      if (nomes.indexOf(i.disciplina) === -1) {
        nomes.push(i.disciplina);
      }
    });

    const detalhes = criar("details", "sessao");
    const titulo =
      new Date(r.data).toLocaleString("pt-PT") + " · " +
      (r.rotulo ? r.rotulo + " · " : "") +
      nomes.join(", ") + " · " +
      r.pontos + "/" + r.total + " (" + pct + "%)";
    detalhes.appendChild(criar("summary", "", titulo));

    r.itens.forEach(function (i) {
      const bloco = criar("div", "item " + (i.acertou ? "item-certo" : "item-errado"));
      bloco.appendChild(criar("p", "item-pergunta", (i.acertou ? "✓ " : "✗ ") + i.pergunta));
      bloco.appendChild(criar("p", "item-linha", "A tua resposta: " + i.escolhida));
      if (!i.acertou) {
        bloco.appendChild(criar("p", "item-linha", "Resposta certa: " + i.certa));
      }
      detalhes.appendChild(bloco);
    });

    return detalhes;
  }

  function mostrarHistorico() {
    const lista = lerHistorico();

    const todos = [];
    lista.forEach(function (r) {
      r.itens.forEach(function (i) {
        todos.push(i);
      });
    });
    desenharDesempenho(histResumo, estatisticas(todos));

    histLista.textContent = "";
    if (lista.length === 0) {
      histLista.appendChild(criar("p", "suave", "Ainda não há sessões guardadas. Faz um quiz!"));
    }
    lista.slice().reverse().forEach(function (r) {
      histLista.appendChild(criarSessao(r));
    });

    mostrarEcra("historico");
  }

  function limparHistorico() {
    if (confirm("Apagar todo o histórico do quiz?")) {
      try {
        localStorage.removeItem(CHAVE);
      } catch (e) {}
      mostrarHistorico();
    }
  }

  /* ===== Botões ===== */
  $("btn-comecar").addEventListener("click", comecar);
  $("btn-historico").addEventListener("click", mostrarHistorico);
  btnSeguinte.addEventListener("click", seguinte);
  btnRefazer.addEventListener("click", refazerErros);
  $("btn-novo").addEventListener("click", function () { mostrarEcra("escolha"); });
  $("btn-res-historico").addEventListener("click", mostrarHistorico);
  $("btn-voltar").addEventListener("click", function () { mostrarEcra("escolha"); });
  $("btn-limpar").addEventListener("click", limparHistorico);

  construirFichas();
  mostrarEcra("escolha");
})();
