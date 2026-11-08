/* ==========================================================================
   LAVANDERIA SANTO ANTÔNIO — LÓGICA DA PÁGINA
   --------------------------------------------------------------------------
   Este arquivo lê os dados de js/config.js e monta a página.
   Para mudar textos, preços, horários ou telefone: edite APENAS config.js.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 0. SEGURANÇA: se o config.js não carregou, avisa e não quebra a página.
   * ------------------------------------------------------------------ */
  if (typeof CONFIG === 'undefined') {
    console.error(
      '[Lavanderia] config.js não foi encontrado. Verifique se a pasta js/ e o arquivo config.js existem.'
    );
    return;
  }

  var cfg = CONFIG;

  /* ------------------------------------------------------------------ *
   * 1. UTILITÁRIOS
   * ------------------------------------------------------------------ */

  /** Formata um valor em reais: 45 -> "R$ 45,00" */
  var formatadorMoeda =
    typeof Intl !== 'undefined' && Intl.NumberFormat
      ? new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      : null;

  function formatarMoeda(valor) {
    if (formatadorMoeda) return formatadorMoeda.format(valor);
    return 'R$ ' + Number(valor).toFixed(2).replace('.', ',');
  }

  /** Converte reais em centavos (evita erros de ponto flutuante). */
  function paraCentavos(valor) {
    return Math.round((Number(valor) || 0) * 100);
  }

  /** Converte centavos em reais. */
  function deCentavos(centavos) {
    return Math.round(centavos) / 100;
  }

  /** "08:30" -> 510 (minutos desde a meia-noite). Retorna null se inválido. */
  function horaParaMinutos(texto) {
    if (!texto || typeof texto !== 'string') return null;
    var partes = texto.trim().split(':');
    if (partes.length < 2) return null;
    var h = parseInt(partes[0], 10);
    var m = parseInt(partes[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  /** Cria um elemento com classe e conteúdo, de forma segura. */
  function elemento(tag, classe, texto) {
    var el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined && texto !== null) el.textContent = String(texto);
    return el;
  }

  /** Só dígitos do número do WhatsApp. */
  function numeroWhatsApp() {
    return String(cfg.whatsapp || '').replace(/\D/g, '');
  }

  /** Link wa.me com mensagem codificada. */
  function linkWhatsApp(mensagem) {
    var numero = numeroWhatsApp();
    var texto = encodeURIComponent(mensagem || '');
    return 'https://wa.me/' + numero + (texto ? '?text=' + texto : '');
  }

  /**
   * Nome do perfil do Instagram, já limpo (sem "@", sem URL, sem barra).
   * Devolve string vazio se o campo não estiver preenchido ou se for apenas
   * o texto de exemplo.
   */
  function usuarioInstagram() {
    var bruto = String(cfg.instagram == null ? '' : cfg.instagram).trim();

    // Aceita tanto "usuario" quanto "@usuario" ou a URL completa colada por engano
    bruto = bruto
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/^@/, '')
      .replace(/^\/+|\/+$/g, '')
      .trim();

    if (!bruto || bruto === '[usuario_sem_arroba]') return '';
    return bruto;
  }

  /** Link do perfil do Instagram, ou '' se não houver perfil configurado. */
  function linkInstagram() {
    var usuario = usuarioInstagram();
    return usuario ? 'https://www.instagram.com/' + encodeURIComponent(usuario) + '/' : '';
  }

  /** URL base do site (ignora file:// para não gerar JSON-LD inválido). */
  function urlDoSite() {
    if (location.protocol !== 'http:' && location.protocol !== 'https:') {
      return '';
    }

    // Remove o "index.html" do final para usar a URL "limpa" do site
    // (ex.: https://exemplo.com/index.html -> https://exemplo.com/)
    return location.origin + location.pathname.replace(/(^|\/)index\.html$/i, '$1');
  }

  /**
   * Converte um caminho relativo da página (ex.: "assets/logo.png") em URL
   * absoluta. Resolve o caminho a partir da PASTA que contém a página, e
   * não a partir do arquivo — senão ".../index.html" + "assets/logo.png"
   * geraria ".../index.htmlassets/logo.png", que é uma URL inválida.
   * Devolve string vazio quando não há como montar uma URL http(s).
   */
  function urlAbsoluta(caminho) {
    if (!caminho) return '';

    // Já é uma URL absoluta (http, https, etc.)
    if (/^https?:\/\//i.test(caminho)) return caminho;

    var base = document.baseURI || location.href;
    try {
      var resolvida = new URL(caminho, base).href;
      return /^https?:/i.test(resolvida) ? resolvida : '';
    } catch (erro) {
      return '';
    }
  }

  /* ------------------------------------------------------------------ *
   * 2. ÍCONES (SVG inline, sem dependências externas)
   * ------------------------------------------------------------------ */
  var ICONES = {
    cuidado:
      '<path d="M12 20.2s-7.2-4.4-7.2-9.4a4.2 4.2 0 0 1 7.2-3 4.2 4.2 0 0 1 7.2 3c0 5-7.2 9.4-7.2 9.4z"/>',
    qualidade:
      '<path d="M10.2 14.6c-2.6-2.2-4.6-4.4-4.6-6.6a4.6 4.6 0 0 1 9.2 0c0 2.2-2 4.4-4.6 6.6z"/>' +
      '<path d="M17.8 12.8l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z"/>',
    brilho:
      '<path d="M11 3l1.7 4.6L17.3 9.3l-4.6 1.7L11 15.6 9.3 11 4.7 9.3 9.3 7.6z"/>' +
      '<path d="M17.6 14.4l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/>',
    escudo:
      '<path d="M12 3.2l7.2 2.7v5.3c0 4.1-2.9 7.7-7.2 9-4.3-1.3-7.2-4.9-7.2-9V5.9z"/>' +
      '<path d="M9 12l2.2 2.2 4-4"/>',
    bolha:
      '<circle cx="12" cy="12" r="8.2"/>' +
      '<circle cx="9.4" cy="9.6" r="2.2"/>',
  };

  function svgIcone(nome) {
    var interno = ICONES[nome] || ICONES.brilho;
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' +
      interno +
      '</svg>'
    );
  }

  /* ------------------------------------------------------------------ *
   * 3. SERVIÇOS E PREÇOS (formato válido mesmo se o config falhar)
   * ------------------------------------------------------------------ */
  var servicos = Array.isArray(cfg.servicos) ? cfg.servicos.filter(Boolean) : [];

  servicos.forEach(function (s, indice) {
    if (!s.id) s.id = 'servico-' + indice;
    s.id = String(s.id);
    if (!s.nome) s.nome = s.id;
    s.nome = String(s.nome);
    s.descricao = s.descricao == null ? '' : String(s.descricao);

    var preco = Number(s.preco);
    s.preco = isNaN(preco) || preco < 0 ? 0 : preco;
  });

  var precos = Array.isArray(cfg.precos) ? cfg.precos.filter(Boolean) : [];

  precos.forEach(function (p, indice) {
    if (!p.id) p.id = 'peca-' + indice;
    p.id = String(p.id);
    if (!p.nome) p.nome = p.id;

    // Peça sem "grupo" cai em "Outros" (nunca quebra a montagem da página).
    p.grupo = p.grupo == null ? '' : String(p.grupo).trim();
    if (!p.grupo) p.grupo = 'Outros';

    // "valores" = { idDoServico: preço }. Mantém apenas números válidos.
    var valores = {};
    if (p.valores && typeof p.valores === 'object') {
      Object.keys(p.valores).forEach(function (chave) {
        var valor = Number(p.valores[chave]);
        if (!isNaN(valor) && valor >= 0) valores[chave] = valor;
      });
    }

    // Compatibilidade com configs antigos que usavam um único "preco".
    if (!Object.keys(valores).length) {
      var legado = Number(p.preco);
      if (!isNaN(legado) && legado >= 0) {
        valores[servicos.length ? servicos[0].id : 'preco'] = legado;
      }
    }

    p.valores = valores;
  });

  /** Serviço escolhido no simulador (id) ou null. */
  var servicoEscolhido = null;

  /** Quantidades do pedido: { idDaPeca: inteiro >= 0 }. */
  var quantidades = {};

  /**
   * Agrupa as peças pelo campo "grupo", mantendo a ordem em que cada grupo
   * aparece no config.js. Peça sem grupo cai em "Outros" (garantido na
   * normalização acima e repetido aqui por segurança).
   * Devolve [{ nome: 'Casa e cama', itens: [...] }, ...].
   */
  function agruparPorGrupo(itens) {
    var ordem = [];
    var mapa = Object.create(null);

    itens.forEach(function (item) {
      var nome = item.grupo || 'Outros';
      if (!(nome in mapa)) {
        mapa[nome] = { nome: nome, itens: [] };
        ordem.push(mapa[nome]);
      }
      mapa[nome].itens.push(item);
    });

    return ordem;
  }

  var gruposPrecos = agruparPorGrupo(precos);

  /** Nome de um serviço pelo id (ou '' se não existir). */
  function nomeServico(idServico) {
    for (var i = 0; i < servicos.length; i++) {
      if (servicos[i].id === idServico) return servicos[i].nome;
    }
    return '';
  }

  /**
   * Preço de uma peça em um serviço específico.
   * Devolve null quando o item não tem preço nesse serviço.
   */
  function precoDoItem(item, idServico) {
    if (!item || !item.valores || idServico == null || idServico === '') {
      return null;
    }
    if (!Object.prototype.hasOwnProperty.call(item.valores, idServico)) {
      return null;
    }
    var valor = Number(item.valores[idServico]);
    return isNaN(valor) ? null : valor;
  }

  /** Primeiro preço disponível da peça (usado quando não há serviços). */
  function primeiroPrecoDoItem(item) {
    if (!item || !item.valores) return null;
    var chaves = Object.keys(item.valores);
    if (!chaves.length) return null;
    var valor = Number(item.valores[chaves[0]]);
    return isNaN(valor) ? null : valor;
  }

  /**
   * Preço que a peça deve exibir agora.
   * Com serviços configurados, usa o serviço escolhido. Sem serviços
   * (config ausente), usa o primeiro preço disponível de cada peça.
   */
  function precoAtualDoItem(item) {
    var preco = precoDoItem(item, servicoEscolhido);
    if (preco !== null) return preco;
    if (!servicos.length) return primeiroPrecoDoItem(item);
    return null;
  }

  /**
   * Menor preço disponível de uma peça entre todos os serviços.
   * Usado como critério de ordenação da tabela de preços.
   */
  function menorPrecoDoItem(item) {
    var menor = Infinity;
    if (!item || !item.valores) return menor;

    Object.keys(item.valores).forEach(function (chave) {
      var valor = Number(item.valores[chave]);
      if (!isNaN(valor) && valor < menor) menor = valor;
    });

    return menor;
  }

  /**
   * Ordena uma CÓPIA dos itens (o array original nunca é alterado):
   * 1º) preço, do menor para o maior;
   * 2º) em caso de empate, nome em português, ignorando acentos e
   *     maiúsculas (localeCompare com sensitivity "base").
   *
   * "precoDe" devolve o preço a usar na comparação. Itens sem preço
   * (null/undefined) vão para o fim.
   */
  function ordenarItens(itens, precoDe) {
    return itens.slice().sort(function (a, b) {
      var precoA = precoDe(a);
      var precoB = precoDe(b);

      if (precoA == null) precoA = Infinity;
      if (precoB == null) precoB = Infinity;

      if (precoA !== precoB) {
        return precoA < precoB ? -1 : 1;
      }

      return String(a.nome).localeCompare(String(b.nome), 'pt-BR', {
        sensitivity: 'base',
      });
    });
  }

  var horarios = Array.isArray(cfg.horarios) ? cfg.horarios.filter(Boolean) : [];
  var diferenciais = Array.isArray(cfg.diferenciais)
    ? cfg.diferenciais.filter(Boolean)
    : [];

  /* ------------------------------------------------------------------ *
   * 4. CABEÇALHO, HERO E RODAPÉ (dados vindos do config.js)
   * ------------------------------------------------------------------ */
  function aplicarIdentidade() {
    var nome = cfg.nome || 'Lavanderia Santo Antônio';

    document.title = nome + ' | Lavanderia';

    // Textos marcados com data-campo="nome"
    var camposNome = document.querySelectorAll('[data-campo="nome"]');
    for (var i = 0; i < camposNome.length; i++) {
      camposNome[i].textContent = nome;
    }

    var slogan = document.querySelector('[data-campo="slogan"]');
    if (slogan) slogan.textContent = cfg.slogan || '';

    // Descrição do site: <meta name="description"> e og:description
    if (cfg.descricaoSite) {
      var metaDescricao = document.querySelector('meta[name="description"]');
      if (metaDescricao) metaDescricao.setAttribute('content', cfg.descricaoSite);

      var ogDescricao = document.querySelector('meta[property="og:description"]');
      if (ogDescricao) ogDescricao.setAttribute('content', cfg.descricaoSite);
    }

    // Texto introdutório da seção de preços
    var textoPrecos = document.getElementById('texto-precos');
    if (textoPrecos) textoPrecos.textContent = cfg.textoPrecos || '';

    // Logomarca: topo, hero, rodapé e favicon
    if (cfg.logo) {
      var imagens = document.querySelectorAll(
        '.marca__logo, .hero__logo, .rodape__logo'
      );
      for (var j = 0; j < imagens.length; j++) {
        imagens[j].setAttribute('src', cfg.logo);
      }
      var favicon = document.querySelector('link[rel="icon"]');
      if (favicon) favicon.setAttribute('href', cfg.logo);

      // og:image precisa de URL ABSOLUTA (WhatsApp, Facebook etc. não
      // resolvem caminho relativo). urlAbsoluta() devolve '' em file://,
      // caso em que mantemos o valor absoluto já escrito no index.html.
      var ogImage = document.querySelector('meta[property="og:image"]');
      var logoAbsoluta = urlAbsoluta(cfg.logo);
      if (ogImage && logoAbsoluta) ogImage.setAttribute('content', logoAbsoluta);
    }

    var ano = document.getElementById('ano-atual');
    if (ano) ano.textContent = String(new Date().getFullYear());
  }

  function aplicarContato() {
    var endereco = cfg.endereco || '';
    var linkBase = linkWhatsApp(
      'Olá! Vim pelo site da ' + (cfg.nome || 'lavanderia') + '. Gostaria de mais informações.'
    );

    // Endereço no texto, no rodapé e na tag <address>
    var alvosEndereco = document.querySelectorAll(
      '#endereco, #rodape-endereco'
    );
    for (var i = 0; i < alvosEndereco.length; i++) {
      alvosEndereco[i].textContent = endereco;
    }

    // Referência (ponto de referência opcional): aparece logo abaixo do
    // endereço na seção "Onde estamos" e no rodapé.
    // Se CONFIG.referencia estiver vazio, os blocos ficam escondidos.
    // Não entra no mapa, na rota nem no JSON-LD.
    var referencia = String(cfg.referencia == null ? '' : cfg.referencia).trim();
    var alvosReferencia = document.querySelectorAll(
      '#referencia-local, #rodape-referencia'
    );
    var textosReferencia = document.querySelectorAll(
      '#referencia-texto, #rodape-referencia-texto'
    );
    for (var r = 0; r < alvosReferencia.length; r++) {
      if (referencia) {
        alvosReferencia[r].removeAttribute('hidden');
      } else {
        alvosReferencia[r].setAttribute('hidden', 'hidden');
      }
    }
    for (var t = 0; t < textosReferencia.length; t++) {
      textosReferencia[t].textContent = referencia;
    }

    // Links de WhatsApp (rodapé e botão flutuante)
    var linksWhatsApp = document.querySelectorAll(
      '#rodape-whatsapp, #whatsapp-flutuante'
    );
    for (var j = 0; j < linksWhatsApp.length; j++) {
      linksWhatsApp[j].setAttribute('href', linkBase);
    }

    // Instagram: se CONFIG.instagram estiver vazio, nenhum elemento
    // do Instagram aparece na página (nem o botão, nem o JSON-LD).
    var linkInsta = linkInstagram();

    // (1) O bloco do botão "Siga no Instagram" aparece ou some.
    var blocoInsta = document.getElementById('rodape-bloco-instagram');
    if (blocoInsta) {
      if (linkInsta) {
        blocoInsta.removeAttribute('hidden');
      } else {
        blocoInsta.setAttribute('hidden', 'hidden');
      }
    }

    // (2) O link (<a>) recebe o endereço do perfil.
    var linkInstaEl = document.getElementById('rodape-instagram');
    if (linkInstaEl) {
      if (linkInsta) {
        linkInstaEl.setAttribute('href', linkInsta);
      } else {
        linkInstaEl.removeAttribute('href');
      }
    }

    // "Como chegar": usa CONFIG.linkRota ou monta a rota pelo endereço
    var rota =
      cfg.linkRota ||
      'https://www.google.com/maps/dir/?api=1&destination=' +
        encodeURIComponent(endereco);
    var btnRota = document.getElementById('btn-rota');
    if (btnRota) btnRota.setAttribute('href', rota);

    // Mapa incorporado
    var mapa = document.getElementById('mapa');
    if (mapa && cfg.linkMapa) {
      mapa.setAttribute('src', cfg.linkMapa);
    }
  }

  /**
   * Crédito do desenvolvedor no fim do rodapé.
   * Usa CONFIG.desenvolvedor.nome e CONFIG.desenvolvedor.link.
   * Nome vazio = o bloco inteiro fica oculto. Link vazio = texto simples.
   */
  function aplicarCreditoDesenvolvedor() {
    var alvo = document.getElementById('rodape-credito');
    if (!alvo) return;

    var dados = cfg.desenvolvedor || {};
    var nome = String(dados.nome == null ? '' : dados.nome).trim();
    var link = String(dados.link == null ? '' : dados.link).trim();

    alvo.textContent = '';

    if (!nome) {
      alvo.setAttribute('hidden', 'hidden');
      return;
    }

    alvo.appendChild(document.createTextNode('Desenvolvido por '));

    if (link) {
      var ancora = elemento('a', null, nome);
      ancora.href = link;
      ancora.target = '_blank';
      ancora.rel = 'noopener';
      alvo.appendChild(ancora);
    } else {
      alvo.appendChild(document.createTextNode(nome));
    }

    alvo.removeAttribute('hidden');
  }

  /* ------------------------------------------------------------------ *
   * 5. SEÇÃO "SOBRE" — descrição e diferenciais
   * ------------------------------------------------------------------ */
  function montarSobre() {
    var textoSobre = document.getElementById('sobre-texto');
    if (textoSobre) textoSobre.textContent = cfg.descricao || '';

    var lista = document.getElementById('diferenciais');
    if (!lista) return;

    lista.textContent = '';

    diferenciais.forEach(function (d) {
      var li = elemento('li', 'diferencial');

      var icone = elemento('span', 'diferencial__icone');
      icone.innerHTML = svgIcone(d.icone);
      li.appendChild(icone);

      li.appendChild(elemento('h3', 'diferencial__titulo', d.titulo || ''));
      li.appendChild(elemento('p', 'diferencial__texto', d.texto || ''));

      lista.appendChild(li);
    });
  }

  /* ------------------------------------------------------------------ *
   * 6. TABELA DE PREÇOS E CARDS "NOSSOS SERVIÇOS"
   * ------------------------------------------------------------------ */
  /**
   * Cards "Nossos serviços" (acima da tabela).
   * O bloco inteiro some quando CONFIG.servicos está vazio ou ausente.
   */
  function montarServicosPrecos() {
    var bloco = document.getElementById('nossos-servicos');
    var lista = document.getElementById('lista-servicos-precos');
    var texto = document.getElementById('texto-servicos');
    if (!lista) return;

    lista.textContent = '';

    if (!servicos.length) {
      if (bloco) bloco.setAttribute('hidden', 'hidden');
      return;
    }
    if (bloco) bloco.removeAttribute('hidden');

    servicos.forEach(function (s) {
      var li = elemento('li', 'servico-card');

      li.appendChild(elemento('h4', 'servico-card__nome', s.nome));

      var linhaPreco = elemento('p', 'servico-card__preco');
      linhaPreco.appendChild(
        elemento('span', 'servico-card__valor', formatarMoeda(s.preco))
      );
      linhaPreco.appendChild(
        elemento('span', 'servico-card__por', 'por peça comum')
      );
      li.appendChild(linhaPreco);

      li.appendChild(elemento('p', 'servico-card__descricao', s.descricao));

      lista.appendChild(li);
    });

    if (texto) texto.textContent = cfg.textoServicos || '';
  }

  /** Colunas da tabela: uma por serviço (ou uma única, sem serviços). */
  function colunasDaTabela() {
    if (servicos.length) {
      return servicos.map(function (s) {
        return { id: s.id, nome: s.nome };
      });
    }
    return [{ id: null, nome: 'Preço por peça' }];
  }

  function montarTabelaPrecos() {
    var corpo = document.getElementById('tabela-precos');
    var cabecalho = document.getElementById('tabela-precos-cabecalho');
    if (!corpo) return;

    corpo.textContent = '';
    if (cabecalho) cabecalho.textContent = '';

    var colunas = colunasDaTabela();

    // Cabeçalho: "Peça" + uma coluna por serviço, na ordem do config.
    if (cabecalho) {
      var thPeca = elemento('th', null, 'Peça');
      thPeca.setAttribute('scope', 'col');
      cabecalho.appendChild(thPeca);

      colunas.forEach(function (coluna) {
        var th = elemento('th', 'tabela__valor', coluna.nome);
        th.setAttribute('scope', 'col');
        cabecalho.appendChild(th);
      });
    }

    gruposPrecos.forEach(function (grupo) {
      // Linha de título do grupo (só quando o grupo tem nome)
      if (grupo.nome) {
        var linhaGrupo = elemento('tr', 'tabela__grupo');
        var tituloGrupo = elemento('th', null, grupo.nome);
        tituloGrupo.setAttribute('colspan', String(colunas.length + 1));
        tituloGrupo.setAttribute('scope', 'rowgroup');
        linhaGrupo.appendChild(tituloGrupo);
        corpo.appendChild(linhaGrupo);
      }

      // Cópia ordenada: menor preço do item entre os serviços; empate = nome.
      // A ordem dos grupos (gruposPrecos) não é alterada.
      ordenarItens(grupo.itens, menorPrecoDoItem).forEach(function (p) {
        var tr = elemento('tr');
        var th = elemento('th', null, p.nome);
        th.setAttribute('scope', 'row');
        tr.appendChild(th);

        colunas.forEach(function (coluna) {
          var preco = coluna.id
            ? precoDoItem(p, coluna.id)
            : primeiroPrecoDoItem(p);

          var td = elemento(
            'td',
            'tabela__valor',
            preco === null ? '—' : formatarMoeda(preco)
          );
          tr.appendChild(td);
        });

        corpo.appendChild(tr);
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 7. HORÁRIOS + INDICADOR "ABERTO AGORA"
   * ------------------------------------------------------------------ */
  function montarTabelaHorarios() {
    var corpo = document.getElementById('tabela-horarios');
    if (!corpo) return;

    corpo.textContent = '';

    horarios.forEach(function (h) {
      var tr = elemento('tr');
      var th = elemento('th', null, h.dia || '');
      th.setAttribute('scope', 'row');
      th.style.textAlign = 'left';
      tr.appendChild(th);

      var td = elemento('td', null, h.horario || '');
      var ehFolga = !h.inicio || !h.fim || (h.dias && h.dias.length === 0);
      if (ehFolga) td.className = 'linha-fechada';
      tr.appendChild(td);

      corpo.appendChild(tr);
    });
  }

  /** Descobre se a lavanderia está aberta agora (com base no relógio do navegador). */
  function estaAbertoAgora(agora) {
    var diaSemana = agora.getDay();
    var minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    var faixa = null;
    for (var i = 0; i < horarios.length; i++) {
      var h = horarios[i];
      var dias = Array.isArray(h.dias) ? h.dias : [];
      if (dias.indexOf(diaSemana) !== -1) {
        faixa = h;
        break;
      }
    }

    if (!faixa) return false;

    var inicio = horaParaMinutos(faixa.inicio);
    var fim = horaParaMinutos(faixa.fim);
    if (inicio === null || fim === null) return false;

    //-atendimento que vira a meia-noite (ex.: 20:00 às 02:00)
    if (fim < inicio) return minutosAgora >= inicio || minutosAgora <= fim;

    return minutosAgora >= inicio && minutosAgora <= fim;
  }

  function atualizarStatus() {
    var caixa = document.getElementById('status-aberto');
    var texto = document.getElementById('status-texto');
    if (!caixa || !texto) return;

    var aberto = estaAbertoAgora(new Date());

    caixa.classList.toggle('status--aberto', aberto);
    caixa.classList.toggle('status--fechado', !aberto);
    texto.textContent = aberto ? 'Aberto agora' : 'Fechado agora';
  }

  /* ------------------------------------------------------------------ *
     * 7.5 AVISO DE ATENDIMENTO (avisoAtendimento)
     * ------------------------------------------------------------------ */
  // Preenche os avisos abaixo da tabela de preços e abaixo do resumo do
  // simulador. Se CONFIG.avisoAtendimento estiver vazio, nada é exibido.
  function aplicarAvisosAtendimento() {
    var avisos = document.querySelectorAll('[data-aviso-atendimento]');

    for (var i = 0; i < avisos.length; i++) {
      var alvo = avisos[i];
      var texto = String(
        cfg.avisoAtendimento == null ? '' : cfg.avisoAtendimento
      ).trim();

      if (!texto) {
        alvo.setAttribute('hidden', 'hidden');
        alvo.textContent = '';
        continue;
      }

      alvo.textContent = texto;
      alvo.removeAttribute('hidden');
    }
  }

  /* ------------------------------------------------------------------ *
   * 8. SIMULADOR DE SERVIÇO
   * ------------------------------------------------------------------ */
  function quantidadeDe(id) {
    var q = quantidades[id];
    return typeof q === 'number' && isFinite(q) && q > 0 ? Math.floor(q) : 0;
  }

  /** Grupos exibidos no passo 2 para o serviço escolhido. */
  var gruposVisiveis = [];

  /**
   * Grupos com apenas os itens que têm preço para o serviço atual,
   * ordenados pelo preço do serviço escolhido e, em caso de empate,
   * pelo nome (pt-BR, sem acentos/maiúsculas). Categorias sem nenhum
   * item disponível ficam de fora (ocultas). A ordem dos grupos não muda.
   */
  function gruposDoServico() {
    return gruposPrecos
      .map(function (grupo) {
        var itensDisponiveis = grupo.itens.filter(function (p) {
          return precoAtualDoItem(p) !== null;
        });

        return {
          nome: grupo.nome,
          itens: ordenarItens(itensDisponiveis, precoAtualDoItem),
        };
      })
      .filter(function (grupo) {
        return grupo.itens.length > 0;
      });
  }

  /** Esconde o aviso de itens removidos (some a cada nova alteração). */
  function esconderAvisoItens() {
    var aviso = document.getElementById('aviso-itens');
    if (!aviso) return;
    aviso.textContent = '';
    aviso.hidden = true;
  }

  /** Recalcula tudo e atualiza o resumo na tela. */
  function atualizarResumo() {
    var listaItens = document.getElementById('resumo-itens');
    var vazio = document.getElementById('resumo-vazio');
    var totalPecas = document.getElementById('resumo-total-pecas');
    var totalValor = document.getElementById('resumo-total-valor');
    var botao = document.getElementById('btn-confirmar');
    var aviso = document.getElementById('aviso-pedido');
    var rotuloServico = document.getElementById('resumo-servico');

    var somaPecas = 0;
    var somaCentavos = 0;

    if (rotuloServico) {
      rotuloServico.textContent = nomeServico(servicoEscolhido) || 'não escolhido';
    }

    if (listaItens) listaItens.textContent = '';

    precos.forEach(function (p) {
      var qtd = quantidadeDe(p.id);
      var preco = precoAtualDoItem(p);

      // Realça o cartão da peça que já tem quantidade.
      // Precisa vir ANTES do "return" para que o destaque também seja
      // removido quando a quantidade volta a zero.
      var cartao = document.querySelector('[data-item="' + p.id + '"]');
      if (cartao) cartao.classList.toggle('ativo', qtd > 0);

      if (preco === null || qtd <= 0) return;

      var subtotalCentavos = paraCentavos(preco) * qtd;
      somaPecas += qtd;
      somaCentavos += subtotalCentavos;

      if (listaItens) {
        var li = elemento('li', 'resumo__item');

        var esquerda = elemento('span', 'resumo__item-nome');
        esquerda.textContent = qtd + 'x ' + p.nome;
        li.appendChild(esquerda);

        li.appendChild(
          elemento('span', 'resumo__item-valor', formatarMoeda(deCentavos(subtotalCentavos)))
        );

        listaItens.appendChild(li);
      }
    });

    var valorTotal = deCentavos(somaCentavos);

    if (vazio) vazio.classList.toggle('oculto', somaPecas > 0);
    if (totalPecas) totalPecas.textContent = String(somaPecas);
    if (totalValor) totalValor.textContent = formatarMoeda(valorTotal);

    // Só confirma com serviço escolhido E ao menos uma peça.
    // Sem "servicos" no config, basta ter peças (não há passo 1).
    var temServico = servicos.length ? servicoEscolhido !== null : true;
    var podeConfirmar = temServico && somaPecas > 0;
    if (botao) botao.disabled = !podeConfirmar;

    if (aviso) {
      if (podeConfirmar) {
        aviso.textContent = '';
      } else {
        aviso.textContent = servicos.length
          ? 'Escolha o serviço e informe ao menos uma peça.'
          : 'Informe ao menos uma peça para continuar.';
      }
    }

    // Nome do grupo + quantidade escolhida, e abre os grupos em uso.
    atualizarContagensDosGrupos();

    return { totalPecas: somaPecas, valorTotal: valorTotal };
  }

  /** Cria o cartão de uma peça: nome, preço unitário e contador − | campo | +. */
  function criarItem(p) {
    var div = elemento('div', 'item');
    div.setAttribute('data-item', p.id);

    /* --- nome e preço unitário (preço do serviço escolhido) --- */
    var info = elemento('div', 'item__info');
    info.appendChild(elemento('span', 'item__nome', p.nome));

    var preco = elemento('span', 'item__preco');
    var valorAtual = precoAtualDoItem(p);
    preco.appendChild(
      elemento('strong', null, formatarMoeda(valorAtual === null ? 0 : valorAtual))
    );
    preco.appendChild(document.createTextNode(' por peça'));
    info.appendChild(preco);

    div.appendChild(info);

    /* --- contador: − | campo | + --- */
    var contador = elemento('div', 'contador');

    var idInput = 'qtd-' + p.id;
    var rotuloId = 'rotulo-' + p.id;

    // Botão "menos"
    var btnMenos = elemento('button', 'contador__botao', '−');
    btnMenos.type = 'button';
    btnMenos.setAttribute('data-acao', 'diminuir');
    btnMenos.setAttribute('aria-label', 'Diminuir quantidade de ' + p.nome);

    // Campo numérico
    var wrapper = elemento('div', 'contador__wrapper');

    var rotulo = elemento('label', 'contador__rotulo', p.nome);
    rotulo.setAttribute('for', idInput);
    rotulo.setAttribute('id', rotuloId);
    rotulo.className = 'visualmente-oculto';

    var input = document.createElement('input');
    input.className = 'contador__campo';
    input.type = 'number';
    input.id = idInput;
    input.name = idInput;
    input.value = String(quantidadeDe(p.id));
    input.min = '0';
    input.step = '1';
    input.inputMode = 'numeric';
    input.setAttribute('aria-labelledby', rotuloId);
    input.setAttribute('data-id', p.id);
    input.setAttribute('aria-label', 'Quantidade de ' + p.nome);

    // Botão "mais"
    var btnMais = elemento('button', 'contador__botao', '+');
    btnMais.type = 'button';
    btnMais.setAttribute('data-acao', 'aumentar');
    btnMais.setAttribute('aria-label', 'Aumentar quantidade de ' + p.nome);

    wrapper.appendChild(rotulo);
    wrapper.appendChild(input);
    contador.appendChild(btnMenos);
    contador.appendChild(wrapper);
    contador.appendChild(btnMais);

    div.appendChild(contador);

    return div;
  }

  /** Monta o passo 1: um cartão com botão de rádio para cada serviço. */
  function montarServicos() {
    var bloco = document.getElementById('passo-servico');
    var container = document.getElementById('lista-servicos');
    if (!container) return;

    container.textContent = '';

    // Sem serviços configurados, o passo 1 nem aparece.
    if (!servicos.length) {
      if (bloco) bloco.hidden = true;
      return;
    }
    if (bloco) bloco.hidden = false;

    servicos.forEach(function (s) {
      var idRadio = 'servico-' + s.id;

      var label = elemento('label', 'servico-opcao');
      label.setAttribute('for', idRadio);

      var input = document.createElement('input');
      input.type = 'radio';
      input.className = 'servico-opcao__radio visualmente-oculto';
      input.name = 'servico';
      input.id = idRadio;
      input.value = s.id;
      input.checked = servicoEscolhido === s.id;
      input.setAttribute('data-servico', s.id);

      var corpo = elemento('span', 'servico-opcao__corpo');

      // Indicador visual de rádio (o input nativo continua sendo o controle
      // acessível; este círculo com o visto é apenas decoração).
      var indicador = elemento('span', 'servico-opcao__indicador');
      indicador.setAttribute('aria-hidden', 'true');
      indicador.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" ' +
        'focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
      corpo.appendChild(indicador);

      corpo.appendChild(elemento('span', 'servico-opcao__nome', s.nome));

      var linhaPreco = elemento('span', 'servico-opcao__preco');
      linhaPreco.appendChild(
        elemento('strong', 'servico-opcao__valor', formatarMoeda(s.preco))
      );
      linhaPreco.appendChild(
        elemento('span', 'servico-opcao__por', ' por peça comum')
      );
      corpo.appendChild(linhaPreco);

      corpo.appendChild(
        elemento('span', 'servico-opcao__descricao', s.descricao)
      );

      label.appendChild(input);
      label.appendChild(corpo);
      container.appendChild(label);
    });

    // Delegação: um único ouvinte para todos os cartões de serviço.
    container.addEventListener('change', function (evento) {
      var alvo = evento.target;
      if (!alvo || alvo.name !== 'servico') return;
      selecionarServico(alvo.value);
    });
  }

  /**
   * Troca o serviço escolhido. Itens que não têm preço no novo serviço saem
   * do pedido (quantidade volta a 0) e um aviso discreto é exibido.
   */
  function selecionarServico(idServico) {
    servicoEscolhido = idServico;

    var removidos = false;
    precos.forEach(function (p) {
      if (quantidadeDe(p.id) > 0 && precoDoItem(p, idServico) === null) {
        quantidades[p.id] = 0;
        removidos = true;
      }
    });

    var aviso = document.getElementById('aviso-itens');
    if (aviso) {
      if (removidos) {
        aviso.textContent =
          'Alguns itens não estão disponíveis em \'' +
          (nomeServico(idServico) || idServico) +
          '\' e foram removidos do pedido.';
        aviso.hidden = false;
      } else {
        aviso.textContent = '';
        aviso.hidden = true;
      }
    }

    montarSimulador();
    atualizarResumo();
  }

  /**
   * Monta o passo 2: contadores das peças disponíveis no serviço escolhido,
   * um bloco recolhível (<details>) por grupo.
   */
  function montarSimulador() {
    var form = document.getElementById('lista-itens');
    var dica = document.getElementById('pecas-vazio');
    if (!form) return;

    // Sem "servicos" no config, não há passo 1: mostra as peças direto,
    // usando o primeiro preço disponível de cada item.
    var temServicos = servicos.length > 0;
    var servicoDefinido = !temServicos || servicoEscolhido !== null;

    if (dica) dica.hidden = servicoDefinido;
    form.hidden = !servicoDefinido;

    form.textContent = '';
    gruposVisiveis = [];

    // Enquanto nenhum serviço estiver escolhido, só a dica aparece.
    if (!servicoDefinido) return;

    gruposVisiveis = gruposDoServico();

    gruposVisiveis.forEach(function (grupo, indice) {
      var bloco = document.createElement('details');
      bloco.className = 'grupo-itens';
      bloco.setAttribute('data-grupo', String(indice));

      // Só o primeiro grupo começa aberto: a lista ficaria enorme no
      // celular se todos abrissem de uma vez.
      if (indice === 0) bloco.open = true;

      var titulo = document.createElement('summary');
      titulo.className = 'grupo-itens__titulo';

      titulo.appendChild(elemento('span', 'grupo-itens__nome', grupo.nome));

      // Quantidade escolhida no grupo, ex.: "(2)". Fica vazio quando zero.
      var contagem = elemento('span', 'grupo-itens__contagem', '');
      titulo.appendChild(contagem);

      var lista = elemento('div', 'grupo-itens__lista');

      grupo.itens.forEach(function (p) {
        lista.appendChild(criarItem(p));
      });

      bloco.appendChild(titulo);
      bloco.appendChild(lista);
      form.appendChild(bloco);
    });
  }

  /** Eventos do passo 2 (ligados uma única vez, por delegação). */
  function ligarEventosSimulador() {
    var form = document.getElementById('lista-itens');
    if (!form) return;

    /* --- Enter no campo de quantidade NÃO deve recarregar a página ---
       O formulário não tem botão "enviar" (o botão de confirmação fica
       fora dele), mas navegadores diferentes podem disparar o envio
       implícito ao pressionar Enter. Bloqueamos de forma explícita. */
    form.addEventListener('submit', function (evento) {
      evento.preventDefault();
      return false;
    });

    /* --- eventos dos botões − e + (delegação de eventos) --- */
    form.addEventListener('click', function (evento) {
      var botao = evento.target.closest('[data-acao]');
      if (!botao) return;

      var item = botao.closest('[data-item]');
      if (!item) return;

      var id = item.getAttribute('data-item');
      var campo = item.querySelector('.contador__campo');
      var acao = botao.getAttribute('data-acao');

      var atual = quantidadeDe(id);
      var nova = acao === 'aumentar' ? atual + 1 : Math.max(0, atual - 1);

      quantidades[id] = nova;
      if (campo) campo.value = String(nova);
      esconderAvisoItens();
      atualizarResumo();
    });

    /* --- eventos do campo numérico --- */
    form.addEventListener('input', function (evento) {
      var campo = evento.target;
      if (!campo.matches || !campo.matches('.contador__campo')) return;

      var id = campo.getAttribute('data-id');
      var bruto = campo.value.trim();

      if (bruto === '') {
        // Digitando: o campo fica vazio, mas o total já zera na hora
        quantidades[id] = 0;
      } else {
        var n = parseInt(bruto, 10);
        var inteiro = isNaN(n) ? 0 : Math.max(0, n);
        quantidades[id] = inteiro;

        // O campo é de números inteiros: corrige na hora o que não for
        // inteiro ou for negativo (ex.: "2.7" -> "2", "-5" -> "0"),
        // para que o que aparece na tela seja sempre o que foi calculado.
        if (String(inteiro) !== bruto) campo.value = String(inteiro);
      }

      esconderAvisoItens();
      atualizarResumo();
    });

    // Ao sair do campo: normaliza para inteiro (ex.: "2.7" vira "2")
    form.addEventListener('blur', function (evento) {
      var campo = evento.target;
      if (!campo.matches || !campo.matches('.contador__campo')) return;

      var id = campo.getAttribute('data-id');
      var n = quantidadeDe(id);
      quantidades[id] = n;
      campo.value = String(n);
      esconderAvisoItens();
      atualizarResumo();
    }, true);

    form.addEventListener(
      'keydown',
      function (evento) {
        var campo = evento.target;
        if (!campo.matches || !campo.matches('.contador__campo')) return;

        // Setas para cima/baixo ajustam em 1 (ótimo para teclado)
        if (evento.key === 'ArrowUp') {
          evento.preventDefault();
          aumentar(campo);
        } else if (evento.key === 'ArrowDown') {
          evento.preventDefault();
          diminuir(campo);
        }
      },
      true
    );

    function aumentar(campo) {
      var id = campo.getAttribute('data-id');
      var nova = quantidadeDe(id) + 1;
      quantidades[id] = nova;
      campo.value = String(nova);
      esconderAvisoItens();
      atualizarResumo();
    }

    function diminuir(campo) {
      var id = campo.getAttribute('data-id');
      var nova = Math.max(0, quantidadeDe(id) - 1);
      quantidades[id] = nova;
      campo.value = String(nova);
      esconderAvisoItens();
      atualizarResumo();
    }
  }

  /**
   * Escreve a quantidade escolhida no título de cada grupo (ex.: "(2)") e
   * mantém aberto todo grupo que já tenha peças selecionadas.
   */
  function atualizarContagensDosGrupos() {
    var blocos = document.querySelectorAll('#lista-itens .grupo-itens');

    for (var i = 0; i < blocos.length && i < gruposVisiveis.length; i++) {
      var grupo = gruposVisiveis[i];
      var soma = 0;

      for (var j = 0; j < grupo.itens.length; j++) {
        soma += quantidadeDe(grupo.itens[j].id);
      }

      var contagem = blocos[i].querySelector('.grupo-itens__contagem');
      if (contagem) {
        contagem.textContent = '';

        if (soma > 0) {
          contagem.appendChild(document.createTextNode('(' + soma));
          contagem.appendChild(
            elemento(
              'span',
              'visualmente-oculto',
              soma === 1 ? ' peça selecionada' : ' peças selecionadas'
            )
          );
          contagem.appendChild(document.createTextNode(')'));
        }
      }

      // Grupo com peças escolhidas não pode ficar recolhido
      if (soma > 0) blocos[i].open = true;
    }
  }

  /** Monta a mensagem do WhatsApp e abre o chat em nova aba. */
  function confirmarServico() {
    var resultado = atualizarResumo();

    // Só envia com serviço escolhido (quando há serviços) e peças no pedido.
    var temServico = servicos.length ? servicoEscolhido !== null : true;
    if (!temServico || resultado.totalPecas === 0) return;

    // Uma linha por peça com quantidade > 0, na MESMA ordem em que os itens
    // aparecem no simulador (já ordenados por preço e nome). Os grupos são
    // só organização da tela: a mensagem não mostra os nomes dos grupos.
    var linhas = [];
    gruposVisiveis.forEach(function (grupo) {
      grupo.itens.forEach(function (p) {
        var qtd = quantidadeDe(p.id);
        if (qtd > 0) linhas.push('- ' + qtd + 'x ' + p.nome);
      });
    });

    var mensagem = [
      cfg.mensagemWhatsApp || '',
      '',
      'Serviço: ' + (nomeServico(servicoEscolhido) || 'não escolhido'),
      '',
      'Peças:',
      linhas.join('\n'),
      '',
      'Total de peças: ' + resultado.totalPecas,
      'Valor total estimado: ' + formatarMoeda(resultado.valorTotal),
      '',
      cfg.mensagemWhatsAppFinal || '',
    ].join('\n');

    var link = linkWhatsApp(mensagem);

    // Abre em nova aba com rel="noopener" (criado dinamicamente para
    // garantir a proteção contra acesso à janela original).
    var ancora = document.createElement('a');
    ancora.href = link;
    ancora.target = '_blank';
    ancora.rel = 'noopener noreferrer';
    ancora.setAttribute('aria-hidden', 'true');
    ancora.style.display = 'none';

    document.body.appendChild(ancora);
    ancora.click();
    document.body.removeChild(ancora);
  }

  /* ------------------------------------------------------------------ *
   * 9. MENU RESPONSIVO
   * ------------------------------------------------------------------ */
  function montarMenu() {
    var botao = document.getElementById('menu-hamburguer');
    var menu = document.getElementById('menu');
    if (!botao || !menu) return;

    function estaAberto() {
      return menu.classList.contains('aberto');
    }

    function abrir(valor) {
      menu.classList.toggle('aberto', valor);
      botao.setAttribute('aria-expanded', valor ? 'true' : 'false');
      botao.setAttribute(
        'aria-label',
        valor ? 'Fechar menu de navegação' : 'Abrir menu de navegação'
      );
    }

    botao.addEventListener('click', function () {
      abrir(!estaAberto());
    });

    // Fecha ao clicar em um link do menu
    menu.addEventListener('click', function (evento) {
      if (evento.target.closest('a')) abrir(false);
    });

    // Fecha com a tecla Esc
    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && estaAberto()) {
        abrir(false);
        botao.focus();
      }
    });

    // Fecha ao clicar fora do menu
    document.addEventListener('click', function (evento) {
      if (!estaAberto()) return;
      if (menu.contains(evento.target) || botao.contains(evento.target)) return;
      abrir(false);
    });

    // Garante estado correto ao voltar para o tamanho de desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 960) abrir(false);
    });
  }

  /* ------------------------------------------------------------------ *
   * 10. SEO — dados estruturados (JSON-LD) a partir do config.js
   * ------------------------------------------------------------------ */
  function montarJsonLd() {
    if (!cfg.nome) return;

    var abertura = [];
    horarios.forEach(function (h) {
      if (!h.inicio || !h.fim) return;
      if (!Array.isArray(h.dias) || h.dias.length === 0) return;

      var nomes = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      h.dias.forEach(function (dia) {
        if (typeof nomes[dia] === 'undefined') return;
        abertura.push({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'https://schema.org/' + nomes[dia],
          opens: h.inicio,
          closes: h.fim,
        });
      });
    });

    // "priceRange": intervalo curto do menor para o maior preço de todos os
    // "valores" da tabela (ex.: "R$ 1,00 - R$ 70,00"). Montado a partir do
    // config, sem valor fixo.
    var valoresPrecos = [];
    precos.forEach(function (p) {
      var valores = p.valores || {};
      Object.keys(valores).forEach(function (chave) {
        var valor = Number(valores[chave]);
        if (!isNaN(valor) && valor >= 0) valoresPrecos.push(valor);
      });
    });

    // Sem preços em "valores", usa o preço de referência dos serviços.
    if (!valoresPrecos.length) {
      servicos.forEach(function (s) {
        if (typeof s.preco === 'number') valoresPrecos.push(s.preco);
      });
    }

    var precosOrdenados = valoresPrecos.sort(function (a, b) {
      return a - b;
    });

    var intervaloPrecos = '';
    if (precosOrdenados.length === 1) {
      intervaloPrecos = formatarMoeda(precosOrdenados[0]);
    } else if (precosOrdenados.length > 1) {
      intervaloPrecos =
        formatarMoeda(precosOrdenados[0]) +
        ' - ' +
        formatarMoeda(precosOrdenados[precosOrdenados.length - 1]);
    }

    var url = urlDoSite();
    var endereco = cfg.endereco || '';
    var partes = endereco.split(',').map(function (p) {
      return p.trim();
    });

    // Endereço no formato "Rua, numero - Bairro, Cidade - UF".
    //   partes[0] = "Av. Maria Amélia Machado"
    //   partes[1] = "55 - Emaús"
    //   partes[2] = "Parnamirim - RN"
    var streetAddress = partes[0] || endereco;
    if (partes.length > 1) {
      var numero = String(partes[1]).trim().split(/\s+/)[0];
      if (/^\d+$/.test(numero)) streetAddress = streetAddress + ', ' + numero;
    }
    var localUltima = (partes.length > 1 ? partes[partes.length - 1] : endereco).trim();
    var cidadeEndereco = localUltima.split('-')[0].trim();
    var ufEndereco = localUltima.split('-')[1]
      ? localUltima.split('-')[1].trim()
      : '';

    var dadosEndereco = {
      '@type': 'PostalAddress',
      streetAddress: streetAddress,
      addressLocality: cidadeEndereco,
      addressCountry: 'BR',
    };
    if (ufEndereco) dadosEndereco.addressRegion = ufEndereco;

    // Perfis externos do negócio. O array é montado apenas com o que
    // estiver realmente configurado, para não gerar "sameAs": [] vazio.
    var perfis = [];
    if (linkInstagram()) perfis.push(linkInstagram());

    var dados = {
      '@context': 'https://schema.org',
      '@type': 'LaundryOrDryCleaner',
      name: cfg.nome,
      description: cfg.descricao || '',
      image: urlAbsoluta(cfg.logo) || undefined,
      telephone: numeroWhatsApp() ? '+' + numeroWhatsApp() : '',
      address: dadosEndereco,
      openingHoursSpecification: abertura,
      priceRange: intervaloPrecos || undefined,
      currenciesAccepted: 'BRL',
      hasMap: cfg.linkMapa || undefined,
      sameAs: perfis.length ? perfis : undefined,
      url: url || undefined,
    };

    // Remove chaves vazias para manter o JSON-LD limpo
    Object.keys(dados).forEach(function (chave) {
      if (dados[chave] === undefined || dados[chave] === '') {
        delete dados[chave];
      }
    });

    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(dados, null, 2);
    document.head.appendChild(script);
  }

  /* ------------------------------------------------------------------ *
   * 11. INICIALIZAÇÃO
   * ------------------------------------------------------------------ */
  function iniciar() {
    aplicarIdentidade();
    aplicarContato();
    aplicarCreditoDesenvolvedor();
    aplicarAvisosAtendimento();
    montarSobre();
    montarServicosPrecos();
    montarTabelaPrecos();
    montarTabelaHorarios();
    montarServicos();
    montarSimulador();
    ligarEventosSimulador();
    atualizarResumo();
    atualizarStatus();
    montarMenu();
    montarJsonLd();

    // O status "Aberto/Fechado agora" é reavaliado a cada minuto
    window.setInterval(atualizarStatus, 60000);

    var botaoConfirmar = document.getElementById('btn-confirmar');
    if (botaoConfirmar) {
      botaoConfirmar.addEventListener('click', confirmarServico);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();