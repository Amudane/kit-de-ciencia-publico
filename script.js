/* ===== Navegação entre secções ===== */
const abas = document.querySelectorAll(".aba");
const secoes = document.querySelectorAll(".secao");
const gatilhos = document.querySelectorAll("[data-secao]");

function mostrarSecao(id) {
  secoes.forEach(function (secao) {
    secao.classList.remove("visivel");
  });
  abas.forEach(function (aba) {
    aba.classList.remove("activa");
  });

  document.getElementById(id).classList.add("visivel");

  const abaActiva = document.querySelector('.aba[data-secao="' + id + '"]');
  if (abaActiva) {
    abaActiva.classList.add("activa");
  }

  window.scrollTo(0, 0);
}

gatilhos.forEach(function (elemento) {
  elemento.addEventListener("click", function () {
    mostrarSecao(elemento.dataset.secao);
  });
});

/* ===== Pomodoro ===== */
(function () {
  const DURACOES = { foco: 25 * 60, curta: 5 * 60, longa: 15 * 60 };

  const relogio = document.getElementById("relogio");
  const btnIniciar = document.getElementById("btn-iniciar");
  const btnReiniciar = document.getElementById("btn-reiniciar");
  const estado = document.getElementById("estado-pomodoro");
  const ciclosHoje = document.getElementById("ciclos-hoje");
  const minutosHoje = document.getElementById("minutos-hoje");
  const botoesModo = document.querySelectorAll(".modo");

  let modo = "foco";
  let restante = DURACOES.foco;
  let fim = 0;
  let intervalo = null;
  let focosSeguidos = 0;

  /* --- Estatísticas do dia (guardadas no navegador) --- */
  function dataHoje() {
    const d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function lerHoje() {
    try {
      const guardado = JSON.parse(localStorage.getItem("kit-pomodoro"));
      if (guardado && guardado.data === dataHoje()) {
        return guardado;
      }
    } catch (e) {}
    return { data: dataHoje(), ciclos: 0, minutos: 0 };
  }

  function guardarHoje(dados) {
    try {
      localStorage.setItem("kit-pomodoro", JSON.stringify(dados));
    } catch (e) {}
  }

  function mostrarEstatisticas() {
    const dados = lerHoje();
    ciclosHoje.textContent = dados.ciclos;
    minutosHoje.textContent = dados.minutos;
  }

  /* --- Relógio --- */
  function formatar(segundos) {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function actualizarEcra() {
    relogio.textContent = formatar(restante);
    document.title = intervalo !== null
      ? formatar(restante) + " · Kit de Ciência"
      : "Kit de Ciência";
  }

  function parar() {
    clearInterval(intervalo);
    intervalo = null;
    btnIniciar.textContent = "Iniciar";
  }

  function mudarModo(novo) {
    parar();
    modo = novo;
    restante = DURACOES[novo];
    botoesModo.forEach(function (b) {
      b.classList.toggle("activo", b.dataset.modo === novo);
    });
    actualizarEcra();
  }

  function apito() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.frequency.value = 880;
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {}
  }

  function terminar() {
    parar();
    apito();

    if (modo === "foco") {
      const dados = lerHoje();
      dados.ciclos += 1;
      dados.minutos += DURACOES.foco / 60;
      guardarHoje(dados);
      mostrarEstatisticas();

      focosSeguidos += 1;
      if (focosSeguidos % 4 === 0) {
        mudarModo("longa");
        estado.textContent = "Ciclo concluído! Faz uma pausa longa.";
      } else {
        mudarModo("curta");
        estado.textContent = "Ciclo concluído! Faz uma pausa curta.";
      }
    } else {
      mudarModo("foco");
      estado.textContent = "Pausa terminada. Vamos focar!";
    }
  }

  function tick() {
    restante = Math.max(0, Math.ceil((fim - Date.now()) / 1000));
    actualizarEcra();
    if (restante === 0) {
      terminar();
    }
  }

  function iniciarOuPausar() {
    if (intervalo !== null) {
      parar();
      actualizarEcra();
      estado.textContent = "Em pausa.";
      return;
    }
    fim = Date.now() + restante * 1000;
    intervalo = setInterval(tick, 250);
    btnIniciar.textContent = "Pausar";
    estado.textContent = modo === "foco" ? "A focar..." : "Descansa um pouco...";
  }

  btnIniciar.addEventListener("click", iniciarOuPausar);

  btnReiniciar.addEventListener("click", function () {
    mudarModo(modo);
    estado.textContent = "Pronto.";
  });

  botoesModo.forEach(function (botao) {
    botao.addEventListener("click", function () {
      mudarModo(botao.dataset.modo);
      estado.textContent = "Pronto.";
    });
  });

  mostrarEstatisticas();
  actualizarEcra();
})();