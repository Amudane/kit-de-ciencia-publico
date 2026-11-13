/* simulado-dados.js
   Geradores de perguntas de Matemática e Física (nível 12.ª classe / exame de admissão).
   Cada gerador cria uma pergunta NOVA, com números aleatórios, e a resposta certa é calculada pelo código.
   Formato devolvido: { p: texto, o: [4 opções], c: índice da certa (0 a 3), e: explicação, d: dados } */
(function () {
  "use strict";

  /* ===== Ferramentas ===== */
  function ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function pick(l) { return l[ri(0, l.length - 1)]; }

  function baralhar(l) {
    const c = l.slice();
    for (let i = c.length - 1; i > 0; i--) {
      const j = ri(0, i);
      const t = c[i]; c[i] = c[j]; c[j] = t;
    }
    return c;
  }

  function mdc(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = a % b; a = b; b = t; }
    return a;
  }

  function comb(n, k) {
    if (k < 0 || k > n) { return 0; }
    let r = 1;
    for (let i = 1; i <= k; i++) { r = r * (n - k + i) / i; }
    return Math.round(r);
  }

  /* número em português: vírgula decimal e sinal − */
  function num(n) {
    return String(Math.round(n * 100) / 100).replace("-", "−").replace(".", ",");
  }

  function frac(n, d) {
    const g = mdc(n, d) || 1;
    n = n / g; d = d / g;
    if (d < 0) { n = -n; d = -d; }
    return d === 1 ? num(n) : num(n) + "/" + d;
  }

  function unid(s) { return function (v) { return num(v) + " " + s; }; }

  /* polinómio em texto: poli([2,-3,0],["x²","x",""]) -> "2x² − 3x" */
  function poli(cs, vs) {
    let s = "";
    cs.forEach(function (c, i) {
      if (c === 0) { return; }
      const abs = Math.abs(c);
      const corpo = (abs === 1 && vs[i] !== "") ? vs[i] : String(abs) + vs[i];
      if (s === "") { s = (c < 0 ? "−" : "") + corpo; }
      else { s += (c < 0 ? " − " : " + ") + corpo; }
    });
    return s || "0";
  }

  const SUB = { 2: "₂", 3: "₃", 5: "₅" };

  /* monta a pergunta: certaTxt + 3 distractores únicos, em ordem aleatória */
  function montar(p, certaTxt, candidatos, e, d) {
    const textos = [certaTxt];
    candidatos.forEach(function (t) {
      if (textos.length < 4 && textos.indexOf(t) === -1) { textos.push(t); }
    });
    if (textos.length < 4) { throw new Error("opções insuficientes"); }
    const ordem = baralhar([0, 1, 2, 3]);
    return {
      p: p,
      o: ordem.map(function (i) { return textos[i]; }),
      c: ordem.indexOf(0),
      e: e,
      d: d
    };
  }

  function montarNum(p, certa, candidatos, e, d, fmt) {
    fmt = fmt || num;
    const txt = candidatos.filter(function (x) { return isFinite(x); }).map(fmt);
    let passo = Math.abs(certa) * 0.1;
    if (Number.isInteger(certa) && passo < 1) { passo = 1; }
    passo = Math.round(passo * 100) / 100 || 0.01;
    for (let k = 1; k <= 4; k++) {
      txt.push(fmt(certa + k * passo));
      txt.push(fmt(certa - k * passo));
    }
    return montar(p, fmt(certa), txt, e, d);
  }

  /* ================= MATEMÁTICA ================= */

  function mEq1() {
    let r1, r2;
    do { r1 = ri(-9, 9); r2 = ri(-9, 9); } while (r1 === r2);
    const a = pick([1, 2, 3, 4]);
    const S = r1 + r2, P = r1 * r2, cert = r1 * r1 + r2 * r2;
    const eq = poli([a, -a * S, a * P], ["x²", "x", ""]);
    return montarNum(
      "Sejam x₁ e x₂ as raízes da equação " + eq + " = 0. Qual é o valor de x₁² + x₂²?",
      cert, [S * S - P, S * S + 2 * P, S * S, S * S - 4 * P],
      "Pelas relações de Viète: x₁ + x₂ = " + num(S) + " e x₁·x₂ = " + num(P) +
      ". Então x₁² + x₂² = (x₁ + x₂)² − 2·x₁·x₂ = (" + num(S) + ")² − 2·(" + num(P) + ") = " + num(cert) + ".",
      { a: a, S: S, P: P, cert: cert }
    );
  }

  function mEq2() {
    const p = ri(-8, 3), q = p + ri(5, 12), estrita = Math.random() < 0.5;
    const cert = estrita ? q - p - 1 : q - p + 1;
    const ineq = poli([1, -(p + q), p * q], ["x²", "x", ""]) + (estrita ? " < 0" : " ≤ 0");
    return montarNum(
      "Quantos números inteiros x satisfazem a inequação " + ineq + "?",
      cert, [q - p, q - p + 1, q - p - 1, q - p - 2],
      "As raízes são " + num(p) + " e " + num(q) + ". A parábola (aberta para cima) fica " +
      (estrita ? "abaixo do eixo apenas entre elas: os inteiros de " + num(p + 1) + " a " + num(q - 1)
               : "abaixo ou sobre o eixo entre elas, incluindo-as: os inteiros de " + num(p) + " a " + num(q)) +
      ". Total: " + cert + ".",
      { p: p, q: q, estrita: estrita, cert: cert }
    );
  }

  function somaPA(a1, r, k) { return k * (2 * a1 + (k - 1) * r) / 2; }

  function mPA() {
    const a1 = ri(-10, 12), r = pick([-4, -3, -2, 2, 3, 4, 5]);
    const m = ri(2, 4), n = m + ri(3, 6), k = ri(8, 16);
    const am = a1 + (m - 1) * r, an = a1 + (n - 1) * r;
    const cert = somaPA(a1, r, k);
    return montarNum(
      "Numa progressão aritmética, o " + m + ".º termo é " + num(am) + " e o " + n + ".º termo é " + num(an) +
      ". Qual é a soma dos primeiros " + k + " termos?",
      cert, [2 * cert, somaPA(a1, r, k - 1), somaPA(a1, r, k + 1), somaPA(a1, r - 1, k)],
      "Razão: r = (" + num(an) + " − " + num(am) + ")/" + (n - m) + " = " + num(r) +
      ". Primeiro termo: a₁ = " + num(am) + " − " + (m - 1) + "·(" + num(r) + ") = " + num(a1) +
      ". S = k(2a₁ + (k − 1)r)/2 = " + k + "·(" + num(2 * a1) + " + " + (k - 1) + "·(" + num(r) + "))/2 = " + num(cert) + ".",
      { a1: a1, r: r, m: m, n: n, k: k, am: am, an: an, cert: cert }
    );
  }

  function mPG() {
    const a1 = ri(1, 6), q = pick([2, 3]), n = ri(5, 7);
    const pot = Math.pow(q, n);
    const cert = a1 * (pot - 1) / (q - 1);
    return montarNum(
      "Numa progressão geométrica de termos positivos, o 2.º termo é " + a1 * q + " e o 4.º termo é " + a1 * Math.pow(q, 3) +
      ". Qual é a soma dos primeiros " + n + " termos?",
      cert, [a1 * pot, cert - a1 * Math.pow(q, n - 1), cert + a1 * pot, a1 * (pot - 1)],
      "Razão: q² = " + a1 * Math.pow(q, 3) + "/" + a1 * q + " = " + q * q + ", logo q = " + q + " (termos positivos). a₁ = " + a1 * q + "/" + q + " = " + a1 +
      ". S = a₁(qⁿ − 1)/(q − 1) = " + a1 + "·(" + pot + " − 1)/" + (q - 1) + " = " + num(cert) + ".",
      { a1: a1, q: q, n: n, cert: cert }
    );
  }

  function mLog() {
    const b = pick([2, 3, 5]), a = ri(1, 6), x0 = a + ri(2, 7), c = x0 * (x0 - a);
    const L = "log" + SUB[b];
    return montarNum(
      "Em ℝ, qual é a solução da equação " + L + " x + " + L + " (x − " + a + ") = " + L + " " + c + "?",
      x0, [a - x0, x0 + 1, x0 - 1, c - a],
      "Condição de existência: x > " + a + ". Pelo logaritmo do produto: x(x − " + a + ") = " + c +
      ", ou seja, x² − " + a + "x − " + c + " = 0, com raízes " + x0 + " e " + num(a - x0) +
      ". Só " + x0 + " cumpre x > " + a + ".",
      { b: b, a: a, x0: x0, c: c }
    );
  }

  function mExp() {
    const b = pick([2, 3]), e1 = ri(0, 2), e2 = e1 + ri(1, 3);
    const t1 = Math.pow(b, e1), t2 = Math.pow(b, e2);
    const eq = b + "^(2x) − " + (t1 + t2) + "·" + b + "^x + " + (t1 * t2) + " = 0";
    const cert = e1 + e2;
    return montarNum(
      "Qual é a soma das soluções reais da equação " + eq + "?",
      cert, [t1 + t2, e2 - e1, e1 * e2, cert + 1],
      "Fazendo t = " + b + "^x, fica t² − " + (t1 + t2) + "t + " + (t1 * t2) + " = 0, com t = " + t1 + " ou t = " + t2 +
      ". Logo x = " + e1 + " ou x = " + e2 + ", e a soma é " + cert + ".",
      { b: b, t1: t1, t2: t2, e1: e1, e2: e2, cert: cert }
    );
  }

  function mDer1() {
    const a = ri(1, 4), b = ri(-5, 5), c = ri(-6, 6), d = ri(-8, 8), x0 = ri(-3, 3);
    const f0 = a * x0 * x0 * x0 + b * x0 * x0 + c * x0 + d;
    const cert = 3 * a * x0 * x0 + 2 * b * x0 + c;
    return montarNum(
      "Qual é o declive da recta tangente ao gráfico da função f(x) = " + poli([a, b, c, d], ["x³", "x²", "x", ""]) +
      " no ponto de abscissa " + num(x0) + "?",
      cert, [f0, 3 * a * x0 * x0 + b * x0 + c, 3 * a * x0 * x0 + 2 * b * x0, 3 * a * x0 * x0 - 2 * b * x0 + c],
      "O declive é f′(" + num(x0) + "). f′(x) = " + poli([3 * a, 2 * b, c], ["x²", "x", ""]) +
      ". Então f′(" + num(x0) + ") = " + num(cert) + ".",
      { a: a, b: b, c: c, d: d, x0: x0, cert: cert }
    );
  }

  function mDer2() {
    const p = ri(-2, 2), q = p + ri(1, 3);
    const f = function (x) { return 2 * x * x * x - 3 * (p + q) * x * x + 6 * p * q * x; };
    const cert = f(p);
    return montarNum(
      "Considere a função f(x) = " + poli([2, -3 * (p + q), 6 * p * q, 0], ["x³", "x²", "x", ""]) +
      ". Qual é o valor máximo local de f?",
      cert, [f(q), 0, f((p + q) / 2), -cert],
      "f′(x) = " + poli([6, -6 * (p + q), 6 * p * q], ["x²", "x", ""]) + " = 6(x − " + num(p) + ")(x − " + num(q) +
      "). Como o coeficiente de x³ é positivo, f′ passa de + a − em x = " + num(p) + " (máximo local). f(" + num(p) + ") = " + num(cert) + ".",
      { p: p, q: q, cert: cert }
    );
  }

  function mComb() {
    const n = ri(8, 12), k = ri(3, 5);
    const total = comb(n, k), juntos = comb(n - 2, k - 2);
    const cert = total - juntos;
    return montarNum(
      "Num grupo de " + n + " pessoas, duas delas, A e B, não podem fazer parte da mesma comissão. " +
      "De quantas maneiras se pode formar uma comissão de " + k + " pessoas?",
      cert, [total, juntos, comb(n - 2, k), total + juntos],
      "Total de comissões: C(" + n + "," + k + ") = " + total + ". Comissões com A e B juntos: C(" + (n - 2) + "," + (k - 2) + ") = " + juntos +
      ". Resposta: " + total + " − " + juntos + " = " + cert + ".",
      { n: n, k: k, cert: cert }
    );
  }

  function mProb() {
    const r = ri(3, 7), b = ri(3, 7), t = r + b;
    const den = comb(t, 2), numr = comb(r, 2) + comb(b, 2);
    const cert = frac(numr, den);
    return montar(
      "Uma urna tem " + r + " bolas vermelhas e " + b + " bolas azuis. Retiram-se duas bolas ao acaso, sem reposição. " +
      "Qual é a probabilidade de serem da mesma cor?",
      cert,
      [frac(r * r + b * b, t * t), frac(comb(r, 2), den), frac(r * b, den), frac(comb(b, 2), den), frac(2 * r * b, t * t)],
      "Casos possíveis: C(" + t + ",2) = " + den + ". Casos favoráveis: C(" + r + ",2) + C(" + b + ",2) = " + numr +
      ". Probabilidade = " + numr + "/" + den + " = " + cert + ".",
      { r: r, b: b, numr: numr, den: den }
    );
  }

  function mTrig() {
    const t = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]);
    const a = t[0], b = t[1], c = t[2];
    if (Math.random() < 0.5) {
      const cert = frac(-2 * a * b, c * c);
      return montar(
        "Sabendo que sen θ = " + a + "/" + c + " e que θ pertence ao 2.º quadrante, qual é o valor de sen 2θ?",
        cert, [frac(2 * a * b, c * c), frac(2 * a, c), frac(b * b - a * a, c * c), frac(-b, c)],
        "No 2.º quadrante cos θ = −" + b + "/" + c + ". sen 2θ = 2·sen θ·cos θ = 2·(" + a + "/" + c + ")·(−" + b + "/" + c + ") = " + cert + ".",
        { a: a, b: b, c: c, tipo: "sen2" }
      );
    }
    const cert = frac(b * b - a * a, c * c);
    return montar(
      "Sabendo que sen θ = " + a + "/" + c + " e que θ pertence ao 2.º quadrante, qual é o valor de cos 2θ?",
      cert, [frac(a * a - b * b, c * c), frac(-2 * a * b, c * c), frac(2 * b, c), frac(1 - 2 * b * b, c * c)],
      "cos 2θ = 1 − 2·sen²θ = 1 − 2·(" + a + "/" + c + ")² = " + cert + ".",
      { a: a, b: b, c: c, tipo: "cos2" }
    );
  }

  function mTrig2() {
    const fn = pick(["sen", "cos", "tg"]);
    const n = ri(2, 6);
    const nomal = [["1/2", 0.5], ["√3/2", Math.sqrt(3) / 2], ["−√2/2", -Math.sqrt(2) / 2], ["−1/2", -0.5]];
    const extremo = fn !== "tg" && Math.random() < 0.4;
    let val, cert, valNum;
    if (extremo) {
      const s = pick([1, -1]);
      val = s === 1 ? "1" : "−1"; valNum = s; cert = n;
    } else {
      const v = pick(nomal); val = v[0]; valNum = v[1]; cert = 2 * n;
    }
    const periodos = fn === "tg" ? 2 * n : n;
    const porPeriodo = cert / periodos;
    return montarNum(
      "Quantas soluções tem a equação " + fn + "(" + n + "x) = " + val + " no intervalo [0, 2π[ ?",
      cert, [n, 2 * n, 4 * n, 2 * n - 1, n + 1],
      "O período de " + fn + "(" + n + "x) é " + (fn === "tg" ? "π" : "2π") + "/" + n + ", logo há " + periodos + " períodos em [0, 2π[. " +
      "Em cada período o valor " + val + " é atingido " + porPeriodo + (porPeriodo === 1 ? " vez" : " vezes") + ". Total: " + cert + " soluções.",
      { fn: fn, n: n, valNum: valNum, cert: cert }
    );
  }

  /* ================= FÍSICA ================= */

  function fQueda() {
    const t = ri(2, 5), v0 = ri(3, 5 * t - 1);
    const h0 = 5 * t * t - v0 * t;
    return montarNum(
      "Uma pedra é lançada verticalmente para cima com velocidade de " + v0 + " m/s, de um ponto situado a " + h0 +
      " m acima do solo. Desprezando a resistência do ar e tomando g = 10 m/s², ao fim de quanto tempo atinge o solo?",
      t, [v0 / 10, t + 1, t - 1, Math.sqrt(2 * h0 / 10)],
      "Com origem no solo: 0 = " + h0 + " + " + v0 + "t − 5t². Resolvendo 5t² − " + v0 + "t − " + h0 + " = 0, a raiz positiva é t = " + t + " s.",
      { v0: v0, h0: h0, t: t },
      unid("s")
    );
  }

  function fPlano() {
    const mu = pick([0.25, 0.5]);
    const a = 10 * (0.6 - mu * 0.8);
    const v = pick(mu === 0.25 ? [4, 8, 12] : [4, 6, 8, 10]);
    const s = v * v / (2 * a);
    return montarNum(
      "Um bloco desliza, a partir do repouso, num plano inclinado de 37° (sen 37° = 0,6; cos 37° = 0,8) com coeficiente de atrito cinético μ = " +
      num(mu) + ". Tomando g = 10 m/s², qual é a velocidade do bloco depois de percorrer " + num(s) + " m ao longo do plano?",
      v,
      [Math.sqrt(2 * 6 * s), Math.sqrt(2 * 10 * (0.6 + mu * 0.8) * s), Math.sqrt(2 * 10 * (0.8 - mu * 0.6) * s), Math.sqrt(2 * 10 * 0.6 * s * 0.5)],
      "a = g(sen θ − μ·cos θ) = 10(0,6 − " + num(mu) + "·0,8) = " + num(a) + " m/s². v² = 2·a·s = 2·" + num(a) + "·" + num(s) + " → v = " + v + " m/s.",
      { mu: mu, a: a, s: s, v: v },
      unid("m/s")
    );
  }

  function fEnergia1() {
    const h = pick([1.8, 2, 2.5, 3.2, 4, 5]), mu = pick([0.2, 0.25, 0.4, 0.5]), m = ri(2, 10);
    const d = h / mu;
    return montarNum(
      "Um corpo de " + m + " kg é abandonado do repouso no topo de uma rampa lisa de " + num(h) +
      " m de altura. Ao chegar à base entra num troço horizontal rugoso, com coeficiente de atrito μ = " + num(mu) +
      ". Tomando g = 10 m/s², que distância percorre no troço rugoso até parar?",
      d, [h * mu, 2 * h / mu, h / (2 * mu), h / mu + h],
      "Toda a energia potencial é dissipada pelo atrito: m·g·h = μ·m·g·d, logo d = h/μ = " + num(h) + "/" + num(mu) + " = " + num(d) + " m (a massa não interfere).",
      { h: h, mu: mu, d: d },
      unid("m")
    );
  }

  function fPotencia() {
    const m = pick([200, 300, 400, 500, 600, 800]), h = ri(5, 20), t = pick([10, 20, 25, 40, 50]), eta = pick([0.5, 0.8, 0.4, 0.25]);
    const pu = m * 10 * h / t, cert = pu / eta;
    return montarNum(
      "Um motor eléctrico eleva, com velocidade constante, uma carga de " + m + " kg a " + h + " m de altura em " + t +
      " s. Sabendo que o rendimento do motor é " + Math.round(eta * 100) + " %, qual é a potência eléctrica que consome? (g = 10 m/s²)",
      cert, [pu, pu * eta, cert * eta, pu * t],
      "Potência útil: P = m·g·h/t = " + num(pu) + " W. Rendimento = P útil / P consumida → P consumida = " + num(pu) + "/" + num(eta) + " = " + num(cert) + " W.",
      { pu: pu, eta: eta, cert: cert },
      unid("W")
    );
  }

  const PARES = [[6, 3], [12, 6], [20, 5], [30, 15], [12, 4], [6, 6], [24, 8], [10, 10]];

  function fCircuito() {
    const par = pick(PARES), R1 = par[0], R2 = par[1];
    const Rp = R1 * R2 / (R1 + R2), R3 = ri(2, 10), I = ri(1, 4);
    const V = I * (Rp + R3), Vp = I * Rp, cert = Vp * Vp / R1;
    return montarNum(
      "Duas resistências, R₁ = " + R1 + " Ω e R₂ = " + R2 + " Ω, estão ligadas em paralelo, e esta associação está em série com R₃ = " + R3 +
      " Ω. O conjunto é alimentado por uma fonte ideal de " + V + " V. Qual é a potência dissipada em R₁?",
      cert, [V * V / R1, Vp * Vp / R2, I * I * R3, V * I],
      "Rp = " + R1 + "·" + R2 + "/" + (R1 + R2) + " = " + num(Rp) + " Ω. I = V/(Rp + R₃) = " + V + "/" + num(Rp + R3) + " = " + I +
      " A. Tensão no paralelo: " + num(Vp) + " V. P₁ = V²/R₁ = " + num(Vp) + "²/" + R1 + " = " + num(cert) + " W.",
      { R1: R1, R2: R2, R3: R3, V: V, cert: cert },
      unid("W")
    );
  }

  function fCondensadores() {
    const par = pick(PARES), C1 = par[0], C2 = par[1];
    const Cs = C1 * C2 / (C1 + C2), C3 = ri(2, 8), V = pick([6, 9, 12, 20, 24, 30]);
    const Ceq = Cs + C3, cert = Ceq * V;
    return montarNum(
      "Dois condensadores, de " + C1 + " µF e " + C2 + " µF, estão ligados em série, e este conjunto está ligado em paralelo com um condensador de " +
      C3 + " µF. Aplicando ao conjunto uma tensão de " + V + " V, qual é a carga total armazenada?",
      cert, [(C1 + C2 + C3) * V, Cs * V, C3 * V, V * V * Ceq / 2],
      "Em série: " + C1 + "·" + C2 + "/" + (C1 + C2) + " = " + num(Cs) + " µF. Em paralelo com " + C3 + " µF: Ceq = " + num(Ceq) + " µF. Q = Ceq·V = " + num(Ceq) + "·" + V + " = " + num(cert) + " µC.",
      { C1: C1, C2: C2, C3: C3, V: V, cert: cert },
      unid("µC")
    );
  }

  function fForcaFio() {
    const B = pick([0.2, 0.4, 0.5, 0.8]), I = pick([5, 8, 10, 15, 20]), L = pick([0.2, 0.5, 0.8, 1.5]);
    const ang = pick([[30, 0.5, Math.cos(Math.PI / 6)], [37, 0.6, 0.8], [53, 0.8, 0.6], [90, 1, 0]]);
    const cert = B * I * L * ang[1];
    const texto = ang[0] === 90 ? "perpendicular às linhas de campo"
                : "formando um ângulo de " + ang[0] + "° com as linhas de campo (sen " + ang[0] + "° = " + num(ang[1]) + ")";
    return montarNum(
      "Um condutor rectilíneo de " + num(L) + " m, percorrido por uma corrente de " + I + " A, está num campo magnético uniforme de " + num(B) +
      " T, " + texto + ". Qual é a intensidade da força magnética sobre o condutor?",
      cert, [B * I * L, B * I * L * ang[2], B * I * ang[1], B * L * ang[1]],
      "F = B·I·L·sen θ = " + num(B) + "·" + I + "·" + num(L) + "·" + num(ang[1]) + " = " + num(cert) + " N.",
      { B: B, I: I, L: L, sen: ang[1], cert: cert },
      unid("N")
    );
  }

  function fTransformador() {
    const Vp = pick([200, 240, 400]), razao = pick([0.05, 0.1, 0.25, 0.5]);
    const Np = pick([1000, 2000]), Ns = Np * razao, R = pick([2, 4, 5, 10, 20]);
    const Vs = Vp * razao, Is = Vs / R, cert = Is * razao;
    return montarNum(
      "Um transformador ideal tem " + Np + " espiras no primário e " + Ns + " no secundário. O primário é ligado a " + Vp +
      " V e o secundário alimenta uma resistência de " + R + " Ω. Qual é a corrente no primário?",
      cert, [Is, Is / razao, Vp / R, Vs / R * 0.5],
      "Vs = Vp·Ns/Np = " + num(Vs) + " V. Is = Vs/R = " + num(Is) + " A. Num transformador ideal Vp·Ip = Vs·Is, então Ip = Is·Ns/Np = " + num(cert) + " A.",
      { Vp: Vp, Np: Np, Ns: Ns, R: R, cert: cert },
      unid("A")
    );
  }

  function fRefraccao() {
    const caso = pick([[53, 0.8, 30, 0.5], [53, 0.8, 37, 0.6], [37, 0.6, 30, 0.5]]);
    const cert = caso[1] / caso[3];
    return montarNum(
      "Um raio de luz propaga-se no ar (n = 1) e incide na superfície de um líquido com ângulo de incidência de " + caso[0] +
      "° (sen " + caso[0] + "° = " + num(caso[1]) + "), sendo o ângulo de refracção de " + caso[2] + "° (sen " + caso[2] + "° = " + num(caso[3]) +
      "). Qual é o índice de refracção do líquido?",
      cert, [caso[3] / caso[1], caso[0] / caso[2], 1 + (caso[1] - caso[3]), caso[1] * caso[3]],
      "Lei de Snell: n₁·sen θ₁ = n₂·sen θ₂ → n₂ = " + num(caso[1]) + "/" + num(caso[3]) + " = " + num(cert) + ".",
      { s1: caso[1], s2: caso[3], cert: cert }
    );
  }

  function fLente() {
    const f = pick([10, 12, 15, 20]), k = pick([1.5, 2, 3]), p = k * f;
    const cert = p * f / (p - f);
    return montarNum(
      "Um objecto é colocado a " + num(p) + " cm de uma lente convergente de distância focal " + f + " cm. A que distância da lente se forma a imagem?",
      cert, [p + f, p * f / (p + f), p - f, f],
      "Equação das lentes: 1/f = 1/p + 1/q → q = p·f/(p − f) = " + num(p) + "·" + f + "/" + num(p - f) + " = " + num(cert) + " cm.",
      { f: f, p: p, cert: cert },
      unid("cm")
    );
  }

  function fDecaimento() {
    const T = pick([3, 5, 8, 12, 20]), n = ri(2, 5), m0 = pick([80, 160, 240, 320, 640]);
    const resto = m0 / Math.pow(2, n), cert = m0 - resto;
    return montarNum(
      "Uma amostra radioactiva de " + m0 + " g tem um período de meia-vida de " + T + " dias. Que massa da amostra já se desintegrou ao fim de " + n * T + " dias?",
      cert, [resto, m0 - m0 / n, m0 / n, m0 - m0 / Math.pow(2, n + 1)],
      "Passaram " + n + " períodos de meia-vida, por isso restam " + m0 + "/2^" + n + " = " + num(resto) + " g. Desintegraram-se " + m0 + " − " + num(resto) + " = " + num(cert) + " g.",
      { T: T, n: n, m0: m0, cert: cert },
      unid("g")
    );
  }

  function fFotoelectrico() {
    const lam = pick([200, 248, 310, 620]), E = 1240 / lam;
    const phi = pick([1.5, 1.8, 2.1, 2.3, 2.5, 3.0, 3.5, 4.1].filter(function (x) { return x < E; }));
    const cert = E - phi;
    return montarNum(
      "A função trabalho de um metal é " + num(phi) + " eV. Incide na sua superfície luz de comprimento de onda " + lam +
      " nm (h·c = 1240 eV·nm). Qual é a energia cinética máxima dos fotoelectrões emitidos?",
      cert, [E + phi, phi, E, E / phi],
      "Energia do fotão: E = hc/λ = 1240/" + lam + " = " + num(E) + " eV. Equação de Einstein: Ec = E − φ = " + num(E) + " − " + num(phi) + " = " + num(cert) + " eV.",
      { lam: lam, E: E, phi: phi, cert: cert },
      unid("eV")
    );
  }

  /* ===== Estrutura: disciplina -> tópico -> geradores ===== */
  window.SIMULADO_DADOS = {
    "Matemática": {
      "Equações e inequações": [mEq1, mEq2],
      "Progressões": [mPA, mPG],
      "Logaritmos e exponenciais": [mLog, mExp],
      "Derivadas": [mDer1, mDer2],
      "Combinatória e probabilidades": [mComb, mProb],
      "Trigonometria": [mTrig, mTrig2]
    },
    "Física": {
      "Cinemática e dinâmica": [fQueda, fPlano],
      "Trabalho e energia": [fEnergia1, fPotencia],
      "Electricidade": [fCircuito, fCondensadores],
      "Electromagnetismo": [fForcaFio, fTransformador],
      "Ondas e óptica": [fRefraccao, fLente],
      "Física moderna": [fDecaimento, fFotoelectrico]
    }
  };
})();
