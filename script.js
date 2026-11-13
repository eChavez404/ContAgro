(function () {
  'use strict';

  var raiz = document.documentElement;
  var temObservador = 'IntersectionObserver' in window;
  // quem pediu menos movimento no sistema vê tudo pronto, sem animação
  var poucoMovimento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // libera a entrada do topo depois do primeiro quadro
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { raiz.classList.add('carregado'); });
  });

  // menu no celular
  var menuBotao = document.getElementById('menuBotao');
  var menu = document.getElementById('menu');

  function fecharMenu() {
    if (!menu || !menuBotao) return;
    menu.classList.remove('aberto');
    menuBotao.setAttribute('aria-expanded', 'false');
    menuBotao.setAttribute('aria-label', 'Abrir menu');
  }

  function alternarMenu() {
    if (!menu || !menuBotao) return;
    var aberto = menu.classList.toggle('aberto');
    menuBotao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    menuBotao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  }

  if (menuBotao) {
    menuBotao.addEventListener('click', alternarMenu);
  }

  if (menu) {
    // fecha ao tocar em qualquer link do menu
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') fecharMenu();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fecharMenu();
  });

  // ao voltar para a largura de desktop o menu não pode ficar preso aberto
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1000) fecharMenu();
  });

  // cabeçalho: sombra ao rolar, some ao descer e volta ao subir
  var cabecalho = document.getElementById('cabecalho');
  var ultimoY = window.scrollY;
  // depois de um clique em âncora o cabeçalho fica parado até a rolagem terminar,
  // senão ele some no caminho e a seção para com um buraco em cima
  var cabecalhoFixo = false;
  var soltarCabecalho;

  document.addEventListener('click', function (e) {
    if (!e.target.closest('a[href^="#"]')) return;
    cabecalhoFixo = true;
    if (cabecalho) cabecalho.classList.remove('escondido');
  });

  function cuidarCabecalho(y) {
    if (!cabecalho) return;
    cabecalho.classList.toggle('rolou', y > 8);
    if (cabecalhoFixo) {
      ultimoY = y;
      clearTimeout(soltarCabecalho);
      soltarCabecalho = setTimeout(function () { cabecalhoFixo = false; }, 150);
      return;
    }
    if (Math.abs(y - ultimoY) < 6) return;
    var menuAberto = menu && menu.classList.contains('aberto');
    cabecalho.classList.toggle('escondido', y > ultimoY && y > 400 && !menuAberto);
    ultimoY = y;
  }

  // como funciona: a linha enche conforme a leitura desce pelos passos
  var passos = document.getElementById('passos');
  var itensPasso = passos ? passos.querySelectorAll('.passo') : [];

  function atualizarPassos() {
    if (!passos) return;
    var total = itensPasso.length;
    if (poucoMovimento) {
      passos.style.setProperty('--progresso', 1);
      itensPasso.forEach(function (item) { item.classList.add('aceso'); });
      return;
    }
    var caixa = passos.getBoundingClientRect();
    var leitura = window.innerHeight * 0.65;
    var p = Math.max(0, Math.min(1, (leitura - caixa.top) / caixa.height));
    passos.style.setProperty('--progresso', p.toFixed(3));

    var emLinha = total > 1 && itensPasso[0].offsetTop === itensPasso[1].offsetTop;
    itensPasso.forEach(function (item, i) {
      var aceso = emLinha
        ? p > 0 && p >= i / (total - 1)
        : item.getBoundingClientRect().top < leitura;
      item.classList.toggle('aceso', aceso);
    });
  }

  var agendado = false;
  function aoRolar() {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(function () {
      agendado = false;
      cuidarCabecalho(window.scrollY);
      atualizarPassos();
    });
  }

  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRolar);
  aoRolar();

  // blocos que entram ao aparecer na tela, em cascata entre irmãos
  var revelaveis = document.querySelectorAll('.revelar, .cena');

  revelaveis.forEach(function (el) {
    var irmaos = Array.prototype.filter.call(el.parentNode.children, function (x) {
      return x.classList.contains('revelar');
    });
    var i = irmaos.indexOf(el);
    if (i > 0) el.style.setProperty('--atraso', (i * 90) + 'ms');
  });

  if (poucoMovimento || !temObservador) {
    revelaveis.forEach(function (el) { el.classList.add('visivel'); });
  } else {
    var obsRevelar = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('visivel');
        obsRevelar.unobserve(entrada.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revelaveis.forEach(function (el) { obsRevelar.observe(el); });
  }

  // conversa do topo: o produtor recebe a nota, responde e o escritório recebe o lançamento
  var visual = document.getElementById('conversa');

  if (visual) {
    var etapas = {};
    visual.querySelectorAll('[data-etapa]').forEach(function (el) {
      etapas[el.getAttribute('data-etapa')] = el;
    });
    var digitando = document.getElementById('digitando');
    var status = document.getElementById('conversaStatus');
    var escolha = visual.querySelector('.balao__escolha');
    var vistos = visual.querySelector('.vistos');
    var relogios = [];

    var mostrar = function (nome) { etapas[nome].classList.add('ativo'); };
    var digitar = function (nome) {
      digitando.style.top = etapas[nome].offsetTop + 'px';
      digitando.classList.add('ativo');
      status.textContent = 'digitando…';
    };
    var pararDeDigitar = function () {
      digitando.classList.remove('ativo');
      status.textContent = 'online';
    };

    var roteiro = [
      [0,    function () { digitar('nota'); }],
      [1100, function () { pararDeDigitar(); mostrar('nota'); }],
      [2300, function () { escolha.classList.add('tocada'); }],
      [2800, function () { mostrar('resposta'); }],
      [3400, function () { vistos.classList.add('lido'); }],
      [3700, function () { digitar('ok'); }],
      [4700, function () { pararDeDigitar(); mostrar('ok'); }],
      [5300, function () { mostrar('lancamento'); }]
    ];

    var zerar = function () {
      relogios.forEach(clearTimeout);
      relogios = [];
      Object.keys(etapas).forEach(function (nome) { etapas[nome].classList.remove('ativo'); });
      escolha.classList.remove('tocada');
      vistos.classList.remove('lido');
      pararDeDigitar();
    };

    var tocar = function () {
      zerar();
      roteiro.forEach(function (passo) { relogios.push(setTimeout(passo[1], passo[0])); });
    };

    if (poucoMovimento || !temObservador) {
      roteiro.forEach(function (passo) { passo[1](); });
      pararDeDigitar();
    } else {
      // começa quando a conversa aparece e recomeça se a pessoa sair e voltar
      var tocando = false;
      new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.intersectionRatio >= 0.4 && !tocando) {
            tocando = true;
            tocar();
          } else if (!entrada.isIntersecting) {
            tocando = false;
            zerar();
          }
        });
      }, { threshold: [0, 0.4] }).observe(visual);
    }
  }

  // dúvidas: abre uma por vez
  var faq = document.getElementById('faq');

  if (faq) {
    faq.addEventListener('click', function (e) {
      var botao = e.target.closest('.faq__pergunta');
      if (!botao) return;

      var item = botao.parentElement;
      var jaAberto = item.classList.contains('aberto');

      faq.querySelectorAll('.faq__item').forEach(function (outro) {
        outro.classList.remove('aberto');
        var b = outro.querySelector('.faq__pergunta');
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      if (!jaAberto) {
        item.classList.add('aberto');
        botao.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // simulador: imposto sobre o resultado real x imposto sobre 20% da receita
  var ALIQUOTA = 0.275;  // faixa máxima do IRPF
  var TETO_PRESUMIDO = 0.20;

  var reais = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  });

  var campos = {
    hectares: document.getElementById('hectares'),
    produtividade: document.getElementById('produtividade'),
    preco: document.getElementById('preco'),
    margem: document.getElementById('margem')
  };

  var saidas = {
    margemValor: document.getElementById('margemValor'),
    receita: document.getElementById('saidaReceita'),
    real: document.getElementById('saidaReal'),
    teto: document.getElementById('saidaTeto'),
    diferenca: document.getElementById('saidaDiferenca'),
    barraReal: document.getElementById('barraReal'),
    barraTeto: document.getElementById('barraTeto'),
    rotulo: document.getElementById('saidaRotulo'),
    aviso: document.getElementById('simuladorAviso')
  };

  function numero(campo, padrao) {
    if (!campo) return padrao;
    var v = parseFloat(campo.value);
    return isFinite(v) && v > 0 ? v : padrao;
  }

  // o valor corre até o novo número em vez de trocar de uma vez
  function animarValor(el, valor) {
    if (poucoMovimento || el._valor === undefined) {
      el._valor = valor;
      el.textContent = reais.format(valor);
      return;
    }
    var inicio = el._valor;
    var duracao = inicio === 0 ? 1200 : 400;
    var t0 = performance.now();
    cancelAnimationFrame(el._quadro);
    (function quadro(t) {
      var k = Math.min(1, (t - t0) / duracao);
      k = 1 - Math.pow(1 - k, 3);
      el._valor = inicio + (valor - inicio) * k;
      el.textContent = reais.format(el._valor);
      if (k < 1) el._quadro = requestAnimationFrame(quadro);
    })(t0);
  }

  function calcular() {
    if (!saidas.receita) return;

    var ha = numero(campos.hectares, 500);
    var sacas = numero(campos.produtividade, 53);
    var preco = numero(campos.preco, 120);
    var margem = numero(campos.margem, 15) / 100;

    var receita = ha * sacas * preco;
    var real = receita * margem;
    var teto = receita * TETO_PRESUMIDO;
    var diferenca = (teto - real) * ALIQUOTA;

    if (saidas.margemValor) saidas.margemValor.textContent = Math.round(margem * 100) + '%';
    if (campos.margem) {
      var min = +campos.margem.min, max = +campos.margem.max;
      campos.margem.style.setProperty('--pct', ((margem * 100 - min) / (max - min) * 100) + '%');
    }
    animarValor(saidas.receita, receita);
    animarValor(saidas.real, real);
    animarValor(saidas.teto, teto);
    animarValor(saidas.diferenca, Math.abs(diferenca));
    saidas.barraReal.style.width = (real / Math.max(real, teto) * 100) + '%';
    saidas.barraTeto.style.width = (teto / Math.max(real, teto) * 100) + '%';

    // com margem acima de 20%, os 20% presumidos saem mais baratos
    if (diferenca >= 0) {
      saidas.rotulo.textContent = 'Imposto pago a mais por ano';
      saidas.aviso.textContent =
        'Esse valor sai do bolso todo ano em que as despesas não são ' +
        'comprovadas, mesmo que elas tenham acontecido.';
    } else {
      saidas.rotulo.textContent = 'Economia declarando pelos 20%';
      saidas.aviso.textContent =
        'Com margem acima de 20%, declarar pelos 20% sai mais barato neste ano. ' +
        'Só que essa opção apaga o prejuízo acumulado dos anos anteriores e não ' +
        'tem volta, então converse com o seu contador antes.';
    }
  }

  Object.keys(campos).forEach(function (chave) {
    var campo = campos[chave];
    if (!campo) return;
    campo.addEventListener('input', calcular);
    campo.addEventListener('change', calcular);
  });

  var formSimulador = document.getElementById('formSimulador');
  if (formSimulador) {
    formSimulador.addEventListener('submit', function (e) { e.preventDefault(); });
  }

  calcular();

  // quando o resultado aparece na tela, os números sobem do zero e as barras crescem
  var saida = document.querySelector('.simulador__saida');
  if (saida && saidas.receita && !poucoMovimento && temObservador) {
    var obsSaida = new IntersectionObserver(function (entradas) {
      if (!entradas[0].isIntersecting) return;
      obsSaida.disconnect();
      [saidas.receita, saidas.real, saidas.teto, saidas.diferenca].forEach(function (el) { el._valor = 0; });
      saidas.barraReal.style.width = '0';
      saidas.barraTeto.style.width = '0';
      void saida.offsetWidth;
      calcular();
    }, { threshold: 0.4 });
    obsSaida.observe(saida);
  }

  // calendário: marca o mês e a janela de agora, e liga a faixa do ano aos cartões
  var meses = document.querySelectorAll('#meses span');
  var mesAtual = new Date().getMonth() + 1;
  if (meses.length === 12) meses[mesAtual - 1].classList.add('agora');

  var janelas = document.getElementById('janelas');
  var cartoes = document.querySelectorAll('.janela[data-janela]');
  var faixas = document.querySelectorAll('.ano__faixas [data-janela]');

  // no celular os cartões viram um carrossel de arrastar
  function ehCarrossel() {
    return janelas && janelas.scrollWidth > janelas.clientWidth + 2;
  }

  function marcarAtiva(indice) {
    cartoes.forEach(function (c) { c.classList.toggle('ativa', c.getAttribute('data-janela') === indice); });
    faixas.forEach(function (f) { f.classList.toggle('ativa', f.getAttribute('data-janela') === indice); });
  }

  function irPara(indice, suave) {
    var cartao = janelas.querySelector('.janela[data-janela="' + indice + '"]');
    if (!cartao || !ehCarrossel()) return;
    janelas.scrollTo({
      left: cartao.offsetLeft - cartoes[0].offsetLeft,
      behavior: suave && !poucoMovimento ? 'smooth' : 'auto'
    });
  }

  if (janelas) {
    cartoes.forEach(function (c) {
      var m = c.getAttribute('data-meses').split('-');
      if (mesAtual >= +m[0] && mesAtual <= +m[1]) {
        var indice = c.getAttribute('data-janela');
        c.classList.add('agora');
        faixas.forEach(function (f) { if (f.getAttribute('data-janela') === indice) f.classList.add('agora'); });
        irPara(indice, false);
      }
    });

    // no desktop, passar o mouse num cartão acende o trecho do ano (e vice-versa)
    [].concat(Array.prototype.slice.call(cartoes), Array.prototype.slice.call(faixas)).forEach(function (el) {
      el.addEventListener('mouseenter', function () { if (!ehCarrossel()) marcarAtiva(el.getAttribute('data-janela')); });
      el.addEventListener('mouseleave', function () { if (!ehCarrossel()) marcarAtiva(null); });
    });

    // no celular, tocar num trecho do ano leva ao cartão
    faixas.forEach(function (f) {
      f.addEventListener('click', function () { irPara(f.getAttribute('data-janela'), true); });
    });

    if (temObservador) {
      var obsJanelas = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting && ehCarrossel()) marcarAtiva(entrada.target.getAttribute('data-janela'));
        });
      }, { root: janelas, threshold: 0.6 });
      cartoes.forEach(function (c) { obsJanelas.observe(c); });
    }
  }

  // botão de WhatsApp: aparece depois do topo e some perto do contato e do rodapé
  var flutuante = document.getElementById('flutuante');

  if (flutuante) {
    if (!temObservador) {
      flutuante.classList.add('visivel');
    } else {
      var alvos = [
        document.getElementById('inicio'),
        document.getElementById('contato'),
        document.querySelector('.rodape')
      ].filter(Boolean);
      var vendo = alvos.map(function () { return true; });

      var obsFlutuante = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          vendo[alvos.indexOf(entrada.target)] = entrada.isIntersecting;
        });
        flutuante.classList.toggle('visivel', vendo.indexOf(true) === -1);
      });
      alvos.forEach(function (alvo) { obsFlutuante.observe(alvo); });
    }
  }

  // ano do rodapé
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

})();
