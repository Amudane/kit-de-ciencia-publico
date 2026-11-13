/* simulado.js — Simulado cronometrado (Matemática e Física), 12.ª classe e exame de admissão.
   Cria sozinho o separador "Simulado" e a secção; precisa de simulado-dados.js e deve ser carregado ANTES de script.js. */
(function () {
  "use strict";

  /* ===== Definições (muda aqui os tempos e o número de questões) ===== */
  const MODOS = {
    classe12: { rotulo: "12.ª classe", questoes: 20, minutos: 60 },
    admissao: { rotulo: "Exame de admissão", questoes: 40, minutos: 100 }
  };
  const PERC_REPETIDAS = 0.05;          /* 5 % das questões podem ser repetidas de testes anteriores */
  const CHAVE_HIST = "kit-simulado-historico";
  const CHAVE_VISTAS = "kit-simulado-vistas";
  const MAX_HIST = 30;
  const MAX_VISTAS = 400;

  const DADOS = window.SIMULADO_DADOS;
  const main = document.querySelector("main");
  const menu = document.querySelector(".menu");
  if (!DADOS || !main || !menu) { return; }

  /* ===== Ferramentas ===== */
  function ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function baralhar(l) {
    const c = l.slice();
    for (let i = c.length - 1; i > 0; i--) {
      const j = ri(0, i);
      const t = c[i]; c[i] = c[j]; c[j] = t;
    }
    return c;
  }
  function criar(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) { e.className = classe; }
    if (texto !== undefined) { e.textContent = texto; }
    return e;
  }
  function $(id) { return document.getElementById(id); }
  function pt(n, casas) { return n.toFixed(casas === undefined ? 1 : casas).replace(".", ","); }
  function mmss(seg) {
    const m = Math.floor(seg / 60), s = seg % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }
  function ler(chave) {
    try { const l = JSON.parse(localStorage.getItem(chave)); return Array.isArray(l) ? l : []; }
    catch (e) { return []; }
  }
  function guardar(chave, lista) {
    try { localStorage.setItem(chave, JSON.stringify(lista)); } catch (e) {}
  }

  /* ===== Separador e secção (criados aqui) ===== */
  const aba = criar("button", "aba", "Simulado");
  aba.dataset.secao = "simulado";
  const abaQuiz = menu.querySelector('.aba[data-secao="quiz"]');
  if (abaQuiz && abaQuiz.nextSibling) { menu.insertBefore(aba, abaQuiz.nextSibling); } else { menu.appendChild(aba); }

  const seccao = document.createElement("section");
  seccao.id = "simulado";
  seccao.className = "secao";
  seccao.innerHTML =
    '<h2>Simulado</h2>' +

    '<div id="sim-config" class="quiz-painel">' +
      '<h3>1. Tipo de teste</h3>' +
      '<div id="sim-modos" class="fichas fichas-escolha"></div>' +
      '<h3>2. Disciplina</h3>' +
      '<div id="sim-discs" class="fichas fichas-escolha"></div>' +
      '<div id="sim-topicos-bloco" hidden><h3>3. Tópicos</h3><div id="sim-topicos"></div></div>' +
      '<p class="suave" id="sim-resumo"></p>' +
      '<p class="aviso" id="sim-aviso"></p>' +
      '<div class="controlos controlos-esq"><button class="botao" id="sim-comecar">Começar o teste</button></div>' +
      '<h4 class="subtitulo">Testes anteriores</h4>' +
      '<div id="sim-hist"></div>' +
    '</div>' +

    '<div id="sim-teste" class="quiz-painel" hidden>' +
      '<div class="sim-topo">' +
        '<div><p class="progresso" id="sim-progresso"></p><p class="etiqueta" id="sim-etiqueta"></p></div>' +
        '<div class="sim-relogio" id="sim-relogio">00:00</div>' +
      '</div>' +
      '<div class="barra sim-barra-tempo"><div class="barra-cheia" id="sim-barra"></div></div>' +
      '<h3 id="sim-texto"></h3>' +
      '<div id="sim-opcoes"></div>' +
      '<div class="controlos controlos-esq">' +
        '<button class="botao botao-contorno" id="sim-ant">Anterior</button>' +
        '<button class="botao botao-contorno" id="sim-seg">Seguinte</button>' +
        '<button class="botao" id="sim-terminar">Terminar teste</button>' +
      '</div>' +
      '<h4 class="subtitulo">Questões (azul = respondida)</h4>' +
      '<div id="sim-grelha" class="sim-grelha"></div>' +
    '</div>' +

    '<div id="sim-resultado" class="quiz-painel" hidden>' +
      '<h3>Resultado do simulado</h3>' +
      '<div class="pontuacao" id="sim-nota"></div>' +
      '<p class="suave" id="sim-detalhe"></p>' +
      '<p class="suave" id="sim-mensagem"></p>' +
      '<h4 class="subtitulo">Desempenho por tópico</h4>' +
      '<div id="sim-desempenho"></div>' +
      '<h4 class="subtitulo">Correcção</h4>' +
      '<div id="sim-revisao"></div>' +
      '<div class="controlos controlos-esq"><button class="botao" id="sim-novo">Novo simulado</button></div>' +
    '</div>';
  main.appendChild(seccao);

  const ecras = { config: $("sim-config"), teste: $("sim-teste"), resultado: $("sim-resultado") };
  function mostrar(nome) {
    Object.keys(ecras).forEach(function (k) { ecras[k].hidden = k !== nome; });
    window.scrollTo(0, 0);
  }

  /* ===== Ecrã de configuração ===== */
  let modoAtual = "classe12";
  const discsEsc = new Set();
  const topEsc = {};   /* disciplina -> Set de tópicos */

  function desenharModos() {
    const c = $("sim-modos"); c.textContent = "";
    Object.keys(MODOS).forEach(function (k) {
      const m = MODOS[k];
      const f = criar("button", "ficha" + (k === modoAtual ? " activa" : ""), m.rotulo + " · " + m.questoes + " questões · " + m.minutos + " min");
      f.type = "button";
      f.addEventListener("click", function () { modoAtual = k; desenharModos(); resumo(); });
      c.appendChild(f);
    });
  }

  function desenharDiscs() {
    const c = $("sim-discs"); c.textContent = "";
    Object.keys(DADOS).forEach(function (d) {
      const f = criar("button", "ficha" + (discsEsc.has(d) ? " activa" : ""), d);
      f.type = "button";
      f.addEventListener("click", function () {
        if (discsEsc.has(d)) { discsEsc.delete(d); delete topEsc[d]; }
        else { discsEsc.add(d); topEsc[d] = new Set(Object.keys(DADOS[d])); }
        desenharDiscs(); desenharTopicos(); resumo();
      });
      c.appendChild(f);
    });
  }

  function desenharTopicos() {
    const bloco = $("sim-topicos-bloco"), c = $("sim-topicos");
    c.textContent = "";
    bloco.hidden = discsEsc.size === 0;
    Object.keys(DADOS).forEach(function (d) {
      if (!discsEsc.has(d)) { return; }
      const nomes = Object.keys(DADOS[d]);
      const grupo = criar("div", "sim-grupo");
      grupo.appendChild(criar("p", "sim-grupo-nome", d));
      const fichas = criar("div", "fichas fichas-escolha");

      const todos = topEsc[d].size === nomes.length;
      const ft = criar("button", "ficha" + (todos ? " activa" : ""), "Todos");
      ft.type = "button";
      ft.addEventListener("click", function () {
        topEsc[d] = todos ? new Set() : new Set(nomes);
        desenharTopicos(); resumo();
      });
      fichas.appendChild(ft);

      nomes.forEach(function (t) {
        const f = criar("button", "ficha" + (topEsc[d].has(t) ? " activa" : ""), t);
        f.type = "button";
        f.addEventListener("click", function () {
          if (topEsc[d].has(t)) { topEsc[d].delete(t); } else { topEsc[d].add(t); }
          desenharTopicos(); resumo();
        });
        fichas.appendChild(f);
      });
      grupo.appendChild(fichas);
      c.appendChild(grupo);
    });
  }

  function resumo() {
    const m = MODOS[modoAtual];
    let txt = m.rotulo + ": " + m.questoes + " questões em " + m.minutos + " minutos.";
    if (discsEsc.size) {
      txt += " Matéria: " + Array.from(discsEsc).map(function (d) { return d + " (" + topEsc[d].size + " tópicos)"; }).join(", ") + ".";
    }
    $("sim-resumo").textContent = txt;
    $("sim-aviso").textContent = "";
  }

  /* ===== Gerar o teste ===== */
  function chaveQ(q) { return q.disc + "|" + q.top; }

  function gerarNova(disc, top, usadas, vistasTxt) {
    const gens = DADOS[disc][top];
    for (let fase = 0; fase < 3; fase++) {
      for (let i = 0; i < 40; i++) {
        let q;
        try { q = gens[ri(0, gens.length - 1)](); } catch (e) { continue; }
        if (fase === 0 && (usadas.has(q.p) || vistasTxt.has(q.p))) { continue; }   /* nova de verdade */
        if (fase === 1 && usadas.has(q.p)) { continue; }                          /* pelo menos diferente das do teste */
        return { disc: disc, top: top, p: q.p, o: q.o, c: q.c, e: q.e, resp: null };
      }
    }
    return null;
  }

  function gerarTeste(total) {
    const pares = [];
    discsEsc.forEach(function (d) { topEsc[d].forEach(function (t) { pares.push([d, t]); }); });
    const vistas = ler(CHAVE_VISTAS).filter(function (q) {
      return discsEsc.has(q.disc) && topEsc[q.disc] && topEsc[q.disc].has(q.top);
    });
    const vistasTxt = new Set(vistas.map(function (q) { return q.p; }));

    const nRep = Math.min(Math.round(total * PERC_REPETIDAS), vistas.length);
    const teste = [];
    const usadas = new Set();
    baralhar(vistas).slice(0, nRep).forEach(function (q) {
      teste.push({ disc: q.disc, top: q.top, p: q.p, o: q.o, c: q.c, e: q.e, resp: null });
      usadas.add(q.p);
    });

    /* distribuição por rotação: disciplinas alternadas, tópicos alternados dentro de cada disciplina */
    const lista = Array.from(discsEsc);
    const idx = {}; lista.forEach(function (d) { idx[d] = 0; });
    const ordTop = {}; lista.forEach(function (d) { ordTop[d] = baralhar(Array.from(topEsc[d])); });
    let i = 0, guarda = 0;
    while (teste.length < total && guarda++ < total * 20) {
      const d = lista[i++ % lista.length];
      const t = ordTop[d][idx[d]++ % ordTop[d].length];
      const q = gerarNova(d, t, usadas, vistasTxt);
      if (q) { teste.push(q); usadas.add(q.p); }
    }
    return baralhar(teste);
  }

  /* ===== Teste em curso ===== */
  let teste = [], pos = 0, modoTeste = null, inicio = 0, fim = 0, duracao = 0, relogioId = null;

  function comecar() {
    const aviso = $("sim-aviso");
    if (discsEsc.size === 0) { aviso.textContent = "Escolhe pelo menos uma disciplina."; return; }
    let falta = "";
    discsEsc.forEach(function (d) { if (topEsc[d].size === 0) { falta = d; } });
    if (falta) { aviso.textContent = "Escolhe pelo menos um tópico de " + falta + "."; return; }

    modoTeste = MODOS[modoAtual];
    teste = gerarTeste(modoTeste.questoes);

    /* regista as questões como "vistas" para as poder repetir (5 %) mais tarde */
    const vistas = ler(CHAVE_VISTAS);
    const jaTem = new Set(vistas.map(function (q) { return q.p; }));
    teste.forEach(function (q) {
      if (!jaTem.has(q.p)) { vistas.push({ disc: q.disc, top: q.top, p: q.p, o: q.o, c: q.c, e: q.e }); jaTem.add(q.p); }
    });
    guardar(CHAVE_VISTAS, vistas.slice(-MAX_VISTAS));

    pos = 0;
    duracao = modoTeste.minutos * 60;
    inicio = Date.now();
    fim = inicio + duracao * 1000;
    mostrar("teste");
    desenharQuestao();
    clearInterval(relogioId);
    relogioId = setInterval(tick, 500);
    tick();
  }

  function tick() {
    const rest = Math.max(0, Math.ceil((fim - Date.now()) / 1000));
    const rel = $("sim-relogio");
    rel.textContent = mmss(rest);
    rel.classList.toggle("sim-pouco", rest <= 300);
    $("sim-barra").style.width = (rest / duracao * 100) + "%";
    if (rest === 0) { terminar(true); }
  }

  function desenharQuestao() {
    const q = teste[pos];
    const respondidas = teste.filter(function (x) { return x.resp !== null; }).length;
    $("sim-progresso").textContent = "Questão " + (pos + 1) + " de " + teste.length + " · respondidas: " + respondidas;
    $("sim-etiqueta").textContent = q.disc + " · " + q.top;
    $("sim-texto").textContent = q.p;

    const c = $("sim-opcoes"); c.textContent = "";
    q.o.forEach(function (txt, i) {
      const b = criar("button", "opcao" + (q.resp === i ? " marcada" : ""), String.fromCharCode(65 + i) + ") " + txt);
      b.type = "button";
      b.addEventListener("click", function () {
        q.resp = (q.resp === i) ? null : i;      /* clicar outra vez desmarca */
        desenharQuestao();
      });
      c.appendChild(b);
    });

    $("sim-ant").disabled = pos === 0;
    $("sim-seg").disabled = pos === teste.length - 1;

    const g = $("sim-grelha"); g.textContent = "";
    teste.forEach(function (x, i) {
      const b = criar("button", "sim-num" + (x.resp !== null ? " resp" : "") + (i === pos ? " atual" : ""), String(i + 1));
      b.type = "button";
      b.addEventListener("click", function () { pos = i; desenharQuestao(); });
      g.appendChild(b);
    });
  }

  /* ===== Resultado ===== */
  function desenharDesempenho(c, itens) {
    c.textContent = "";
    const st = {};
    itens.forEach(function (x) {
      const k = x.disc + " · " + x.top;
      if (!st[k]) { st[k] = { certas: 0, total: 0 }; }
      st[k].total++;
      if (x.resp === x.c) { st[k].certas++; }
    });
    Object.keys(st).forEach(function (k) {
      const s = st[k], pct = Math.round(s.certas / s.total * 100);
      const linha = criar("div", "linha-disc");
      linha.appendChild(criar("span", "linha-nome", k));
      const caixa = criar("div", "barra"), cheia = criar("div", "barra-cheia");
      cheia.style.width = pct + "%"; caixa.appendChild(cheia); linha.appendChild(caixa);
      linha.appendChild(criar("span", "linha-valor", s.certas + "/" + s.total + " (" + pct + "%)"));
      c.appendChild(linha);
    });
  }

  function desenharRevisao(c, itens) {
    c.textContent = "";
    itens.forEach(function (x, i) {
      const certo = x.resp === x.c;
      const b = criar("div", "item " + (certo ? "item-certo" : "item-errado"));
      b.appendChild(criar("p", "item-pergunta", (certo ? "✓ " : "✗ ") + (i + 1) + ". " + x.p));
      b.appendChild(criar("p", "item-linha", "A tua resposta: " + (x.resp === null ? "sem resposta" : x.o[x.resp])));
      if (!certo) { b.appendChild(criar("p", "item-linha", "Resposta certa: " + x.o[x.c])); }
      if (x.e) { b.appendChild(criar("p", "item-linha", "Resolução: " + x.e)); }
      c.appendChild(b);
    });
  }

  function terminar(automatico) {
    if (!automatico) {
      const vazias = teste.filter(function (x) { return x.resp === null; }).length;
      const msg = vazias ? "Tens " + vazias + " questões por responder. Terminar mesmo assim?" : "Terminar o teste e ver o resultado?";
      if (!confirm(msg)) { return; }
    }
    clearInterval(relogioId); relogioId = null;

    const usado = Math.min(duracao, Math.round((Date.now() - inicio) / 1000));
    const pontos = teste.filter(function (x) { return x.resp === x.c; }).length;
    const total = teste.length;
    const branco = teste.filter(function (x) { return x.resp === null; }).length;
    const pct = pontos / total * 100;

    const reg = {
      data: new Date().toISOString(), modo: modoTeste.rotulo, minutos: modoTeste.minutos, usado: usado,
      pontos: pontos, total: total, branco: branco, itens: teste
    };
    const hist = ler(CHAVE_HIST); hist.push(reg); guardar(CHAVE_HIST, hist.slice(-MAX_HIST));

    $("sim-nota").textContent = pt(pontos / total * 20) + " / 20";
    $("sim-detalhe").textContent = pontos + " certas em " + total + " (" + Math.round(pct) + " %) · em branco: " + branco +
      " · tempo usado: " + mmss(usado) + " de " + mmss(duracao) + (automatico ? " · o tempo esgotou-se" : "");
    $("sim-mensagem").textContent =
      pct >= 80 ? "Excelente! Estás muito bem preparado." :
      pct >= 60 ? "Bom resultado. Revê os erros abaixo para subires a nota." :
      pct >= 40 ? "Resultado médio. Estuda os tópicos mais fracos e repete o teste." :
                  "Ainda precisas de estudar mais. Começa pelos tópicos com menor percentagem.";
    desenharDesempenho($("sim-desempenho"), teste);
    desenharRevisao($("sim-revisao"), teste);
    mostrar("resultado");
    desenharHistorico();
  }

  /* ===== Histórico (na página de configuração) ===== */
  function desenharHistorico() {
    const c = $("sim-hist"); c.textContent = "";
    const h = ler(CHAVE_HIST).slice().reverse();
    if (h.length === 0) { c.appendChild(criar("p", "suave", "Ainda não fizeste nenhum simulado.")); return; }
    h.forEach(function (r) {
      const d = criar("details", "sessao");
      const discs = []; r.itens.forEach(function (x) { if (discs.indexOf(x.disc) === -1) { discs.push(x.disc); } });
      d.appendChild(criar("summary", "",
        new Date(r.data).toLocaleString("pt-PT") + " · " + r.modo + " · " + discs.join(", ") + " · " +
        pt(r.pontos / r.total * 20) + "/20 (" + r.pontos + "/" + r.total + ")"));
      const corpo = criar("div"); d.appendChild(corpo);
      let feito = false;
      d.addEventListener("toggle", function () { if (d.open && !feito) { feito = true; desenharRevisao(corpo, r.itens); } });
      c.appendChild(d);
    });
  }

  /* ===== Botões ===== */
  $("sim-comecar").addEventListener("click", comecar);
  $("sim-ant").addEventListener("click", function () { if (pos > 0) { pos--; desenharQuestao(); } });
  $("sim-seg").addEventListener("click", function () { if (pos < teste.length - 1) { pos++; desenharQuestao(); } });
  $("sim-terminar").addEventListener("click", function () { terminar(false); });
  $("sim-novo").addEventListener("click", function () { mostrar("config"); });

  desenharModos(); desenharDiscs(); desenharTopicos(); resumo(); desenharHistorico();
  mostrar("config");
  window.scrollTo(0, 0);
})();
