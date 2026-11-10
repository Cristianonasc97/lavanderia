#!/usr/bin/env node
/* ==========================================================================
   GERADOR DO CONTEÚDO ESTÁTICO
   --------------------------------------------------------------------------
   Lê js/config.js com o módulo vm do Node e reescreve o conteúdo do
   index.html que fica entre os pares de marcadores:

       <!--ESTATICO:nome-->
       ...
       <!--/ESTATICO:nome-->

   Tudo o que está fora dos marcadores permanece intacto.

   Uso:
     node scripts/gerar-estatico.js             grava o index.html
     node scripts/gerar-estatico.js --verificar  só confere, não grava

   Sem dependências externas: usa apenas módulos padrão do Node.js.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.resolve(__dirname, '..');
const CAMINHO_CONFIG = path.join(RAIZ, 'js', 'config.js');
const CAMINHO_HTML = path.join(RAIZ, 'index.html');

const MARCADORES_INLINE = [
  'nome-topo',
  'nome-hero',
  'slogan',
  'sobre-texto',
  'texto-precos',
  'endereco',
  'rodape-endereco',
  'nome-rodape',
];

const MARCADORES_BLOCO = [
  'seo',
  'json-ld',
  'logo-topo',
  'cta-menu',
  'logo-hero',
  'cta-hero',
  'diferenciais',
  'nossos-servicos',
  'tabela-cabecalho',
  'tabela-precos',
  'aviso-precos',
  'noscript',
  'aviso-simulador',
  'tabela-horarios',
  'referencia-local',
  'mapa',
  'btn-rota',
  'logo-rodape',
  'rodape-referencia',
  'rodape-whatsapp',
  'rodape-instagram',
  'direitos',
  'credito',
  'whatsapp-flutuante',
];

const TODOS_OS_MARCADORES = MARCADORES_INLINE.concat(MARCADORES_BLOCO);

/* --------------------------------------------------------------------------
   Utilidades
   -------------------------------------------------------------------------- */

function falhar(mensagem) {
  console.error('Erro: ' + mensagem);
  process.exit(1);
}

/** Escapa texto para uso seguro em HTML (texto e atributos). */
function escapar(valor) {
  return String(valor == null ? '' : valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatarMoeda(valor) {
  return formatadorMoeda.format(valor);
}

function urlAbsoluta(caminho, urlSite) {
  if (!caminho) return '';
  try {
    return new URL(String(caminho), urlSite).href;
  } catch (erro) {
    return '';
  }
}

function numeroWhatsApp(cfg) {
  return String(cfg.whatsapp || '').replace(/\D/g, '');
}

function linkWhatsApp(cfg, mensagem) {
  const numero = numeroWhatsApp(cfg);
  const texto = encodeURIComponent(mensagem || '');
  return 'https://wa.me/' + numero + (texto ? '?text=' + texto : '');
}

function mensagemContato(cfg) {
  return (
    'Olá! Vim pelo site da ' +
    (cfg.nome || 'lavanderia') +
    '. Gostaria de mais informações.'
  );
}

function usuarioInstagram(cfg) {
  let bruto = String(cfg.instagram == null ? '' : cfg.instagram).trim();

  bruto = bruto
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/^\/+|\/+$/g, '')
    .trim();

  if (!bruto || bruto === '[usuario_sem_arroba]') return '';
  return bruto;
}

function linkInstagram(cfg) {
  const usuario = usuarioInstagram(cfg);
  return usuario
    ? 'https://www.instagram.com/' + encodeURIComponent(usuario) + '/'
    : '';
}

/* --------------------------------------------------------------------------
   Leitura e normalização do config (mesmas regras do js/app.js)
   -------------------------------------------------------------------------- */

function carregarConfig() {
  let codigo;
  try {
    codigo = fs.readFileSync(CAMINHO_CONFIG, 'utf8');
  } catch (erro) {
    falhar(
      'não foi possível ler js/config.js (' + erro.message + '). ' +
        'Verifique se o arquivo existe.'
    );
  }

  let config;
  try {
    const contexto = vm.createContext({});
    config = vm.runInContext(codigo + '\n; CONFIG;', contexto, {
      filename: CAMINHO_CONFIG,
      timeout: 1000,
    });
  } catch (erro) {
    falhar(
      'não foi possível executar js/config.js. Verifique a sintaxe do arquivo: ' +
        erro.message
    );
  }

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    falhar(
      'o js/config.js não declarou um objeto CONFIG válido. ' +
        'Confira se o arquivo termina com "const CONFIG = { ... };".'
    );
  }

  if (!config.nome || typeof config.nome !== 'string') {
    falhar('CONFIG.nome está vazio ou não é um texto.');
  }

  if (!config.urlSite || typeof config.urlSite !== 'string') {
    falhar(
      'CONFIG.urlSite não está definido. Use o endereço final do site, ' +
        'com https:// e barra no fim.'
    );
  }

  try {
    const url = new URL(config.urlSite);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      falhar('CONFIG.urlSite precisa começar com https:// (ou http://).');
    }
  } catch (erro) {
    falhar('CONFIG.urlSite não é uma URL válida: ' + config.urlSite);
  }

  return config;
}

function normalizarConfig(config) {
  const servicos = (Array.isArray(config.servicos) ? config.servicos : [])
    .filter(Boolean)
    .map(function (servico, indice) {
      const s = Object.assign({}, servico);
      if (!s.id) s.id = 'servico-' + indice;
      s.id = String(s.id);
      if (!s.nome) s.nome = s.id;
      s.nome = String(s.nome);
      s.descricao = s.descricao == null ? '' : String(s.descricao);

      const preco = Number(s.preco);
      s.preco = isNaN(preco) || preco < 0 ? 0 : preco;
      return s;
    });

  const precos = (Array.isArray(config.precos) ? config.precos : [])
    .filter(Boolean)
    .map(function (item, indice) {
      const p = Object.assign({}, item);
      if (!p.id) p.id = 'peca-' + indice;
      p.id = String(p.id);
      if (!p.nome) p.nome = p.id;
      p.nome = String(p.nome);

      p.grupo = p.grupo == null ? '' : String(p.grupo).trim();
      if (!p.grupo) p.grupo = 'Outros';

      const valores = {};
      if (p.valores && typeof p.valores === 'object') {
        Object.keys(p.valores).forEach(function (chave) {
          const valor = Number(p.valores[chave]);
          if (!isNaN(valor) && valor >= 0) valores[chave] = valor;
        });
      }

      if (!Object.keys(valores).length) {
        const legado = Number(p.preco);
        if (!isNaN(legado) && legado >= 0) {
          valores[servicos.length ? servicos[0].id : 'preco'] = legado;
        }
      }

      p.valores = valores;
      return p;
    });

  return {
    config: config,
    servicos: servicos,
    precos: precos,
    horarios: (Array.isArray(config.horarios) ? config.horarios : []).filter(
      Boolean
    ),
    diferenciais: (
      Array.isArray(config.diferenciais) ? config.diferenciais : []
    ).filter(Boolean),
  };
}

/* --------------------------------------------------------------------------
   Regras de preços e ordenação (idênticas às do js/app.js)
   -------------------------------------------------------------------------- */

function agruparPorGrupo(itens) {
  const ordem = [];
  const mapa = Object.create(null);

  itens.forEach(function (item) {
    const nome = item.grupo || 'Outros';
    if (!(nome in mapa)) {
      mapa[nome] = { nome: nome, itens: [] };
      ordem.push(mapa[nome]);
    }
    mapa[nome].itens.push(item);
  });

  return ordem;
}

function precoDoItem(item, idServico) {
  if (!item || !item.valores || idServico == null || idServico === '') {
    return null;
  }
  if (!Object.prototype.hasOwnProperty.call(item.valores, idServico)) {
    return null;
  }
  const valor = Number(item.valores[idServico]);
  return isNaN(valor) ? null : valor;
}

function primeiroPrecoDoItem(item) {
  if (!item || !item.valores) return null;
  const chaves = Object.keys(item.valores);
  if (!chaves.length) return null;
  const valor = Number(item.valores[chaves[0]]);
  return isNaN(valor) ? null : valor;
}

function menorPrecoDoItem(item) {
  let menor = Infinity;
  if (!item || !item.valores) return menor;

  Object.keys(item.valores).forEach(function (chave) {
    const valor = Number(item.valores[chave]);
    if (!isNaN(valor) && valor < menor) menor = valor;
  });

  return menor;
}

function ordenarItens(itens, precoDe) {
  return itens.slice().sort(function (a, b) {
    let precoA = precoDe(a);
    let precoB = precoDe(b);

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

function colunasDaTabela(dados) {
  if (dados.servicos.length) {
    return dados.servicos.map(function (servico) {
      return { id: servico.id, nome: servico.nome };
    });
  }
  return [{ id: null, nome: 'Preço por peça' }];
}

/* --------------------------------------------------------------------------
   Blocos gerados
   -------------------------------------------------------------------------- */

function gerarSeo(dados) {
  const cfg = dados.config;
  const descricao = cfg.descricaoSite || '';
  const imagem = urlAbsoluta(cfg.logo, cfg.urlSite);
  const altImagem = 'Logomarca ' + cfg.nome;

  const linhas = [
    '<title>' + escapar(cfg.nome + ' | Lavanderia') + '</title>',
    '<meta',
    '  name="description"',
    '  content="' + escapar(descricao) + '"',
    '/>',
    '<meta name="theme-color" content="#0B3A7E" />',
    '<meta name="author" content="' + escapar(cfg.nome) + '" />',
    '<link',
    '  rel="canonical"',
    '  href="' + escapar(cfg.urlSite) + '"',
    '/>',
    '',
    '<!-- Open Graph -->',
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="pt_BR" />',
    '<meta property="og:site_name" content="' + escapar(cfg.nome) + '" />',
    '<meta property="og:title" content="' + escapar(cfg.nome) + '" />',
    '<meta',
    '  property="og:description"',
    '  content="' + escapar(descricao) + '"',
    '/>',
    '<!-- URL absoluta: Open Graph/WhatsApp não resolve caminhos relativos -->',
    '<meta',
    '  property="og:url"',
    '  content="' + escapar(cfg.urlSite) + '"',
    '/>',
  ];

  if (imagem) {
    linhas.push(
      '<meta',
      '  property="og:image"',
      '  content="' + escapar(imagem) + '"',
      '/>'
    );
  }

  linhas.push(
    '<meta property="og:image:type" content="image/png" />',
    '<meta property="og:image:width" content="600" />',
    '<meta property="og:image:height" content="600" />',
    '<meta property="og:image:alt" content="' + escapar(altImagem) + '" />'
  );

  return linhas.join('\n');
}

function gerarJsonLd(dados) {
  const cfg = dados.config;

  const abertura = [];
  dados.horarios.forEach(function (horario) {
    if (!horario.inicio || !horario.fim) return;
    if (!Array.isArray(horario.dias) || horario.dias.length === 0) return;

    const nomes = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    horario.dias.forEach(function (dia) {
      if (typeof nomes[dia] === 'undefined') return;
      abertura.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'https://schema.org/' + nomes[dia],
        opens: horario.inicio,
        closes: horario.fim,
      });
    });
  });

  const valoresPrecos = [];
  dados.precos.forEach(function (item) {
    const valores = item.valores || {};
    Object.keys(valores).forEach(function (chave) {
      const valor = Number(valores[chave]);
      if (!isNaN(valor) && valor >= 0) valoresPrecos.push(valor);
    });
  });

  if (!valoresPrecos.length) {
    dados.servicos.forEach(function (servico) {
      if (typeof servico.preco === 'number') valoresPrecos.push(servico.preco);
    });
  }

  const precosOrdenados = valoresPrecos.sort(function (a, b) {
    return a - b;
  });

  let intervaloPrecos = '';
  if (precosOrdenados.length === 1) {
    intervaloPrecos = formatarMoeda(precosOrdenados[0]);
  } else if (precosOrdenados.length > 1) {
    intervaloPrecos =
      formatarMoeda(precosOrdenados[0]) +
      ' - ' +
      formatarMoeda(precosOrdenados[precosOrdenados.length - 1]);
  }

  const endereco = cfg.endereco || '';
  const partes = endereco.split(',').map(function (parte) {
    return parte.trim();
  });

  let streetAddress = partes[0] || endereco;
  if (partes.length > 1) {
    const numero = String(partes[1]).trim().split(/\s+/)[0];
    if (/^\d+$/.test(numero)) streetAddress = streetAddress + ', ' + numero;
  }

  const localUltima = (
    partes.length > 1 ? partes[partes.length - 1] : endereco
  ).trim();
  const cidadeEndereco = localUltima.split('-')[0].trim();
  const ufEndereco = localUltima.split('-')[1]
    ? localUltima.split('-')[1].trim()
    : '';

  const dadosEndereco = {
    '@type': 'PostalAddress',
    streetAddress: streetAddress,
    addressLocality: cidadeEndereco,
    addressCountry: 'BR',
  };
  if (ufEndereco) dadosEndereco.addressRegion = ufEndereco;

  const perfis = [];
  if (linkInstagram(cfg)) perfis.push(linkInstagram(cfg));

  const dadosJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LaundryOrDryCleaner',
    name: cfg.nome,
    description: cfg.descricao || '',
    image: urlAbsoluta(cfg.logo, cfg.urlSite) || undefined,
    telephone: numeroWhatsApp(cfg) ? '+' + numeroWhatsApp(cfg) : '',
    address: dadosEndereco,
    openingHoursSpecification: abertura,
    priceRange: intervaloPrecos || undefined,
    currenciesAccepted: 'BRL',
    hasMap: cfg.linkMapa || undefined,
    sameAs: perfis.length ? perfis : undefined,
    url: cfg.urlSite || undefined,
  };

  Object.keys(dadosJsonLd).forEach(function (chave) {
    if (dadosJsonLd[chave] === undefined || dadosJsonLd[chave] === '') {
      delete dadosJsonLd[chave];
    }
  });

  const json = JSON.stringify(dadosJsonLd, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  return (
    '<script type="application/ld+json" id="dados-estruturados">\n' +
    json +
    '\n</script>'
  );
}

function gerarLogo(dados, id, classe, largura, altura, lazy) {
  const cfg = dados.config;
  const linhas = [
    '<img',
    id ? '  id="' + escapar(id) + '"' : null,
    '  class="' + escapar(classe) + '"',
    '  src="' + escapar(cfg.logo || '') + '"',
    '  alt="' + escapar('Logomarca ' + cfg.nome) + '"',
    '  width="' + largura + '"',
    '  height="' + altura + '"',
  ].filter(Boolean);

  if (lazy) linhas.push('  loading="lazy"');
  linhas.push('/>');

  return linhas.join('\n');
}

function gerarCtaSimulador(dados, tipo) {
  const cfg = dados.config;
  const classe =
    tipo === 'menu'
      ? 'botao botao--rosa botao--bloco menu__acao'
      : 'botao botao--rosa botao--grande';
  const link = linkWhatsApp(cfg, mensagemContato(cfg));

  return [
    '<a',
    '  class="' + classe + '"',
    '  href="' + escapar(link) + '"',
    '  target="_blank"',
    '  rel="noopener"',
    '  data-cta-simulador',
    '  >Solicitar Orçamento</a',
    '>',
  ].join('\n');
}

function gerarDiferenciais(dados) {
  return dados.diferenciais
    .map(function (diferencial) {
      return [
        '<li class="diferencial">',
        '  <h3 class="diferencial__titulo">' +
          escapar(diferencial.titulo || '') +
          '</h3>',
        '  <p class="diferencial__texto">' +
          escapar(diferencial.texto || '') +
          '</p>',
        '</li>',
      ].join('\n');
    })
    .join('\n');
}

function gerarNossosServicos(dados) {
  const cfg = dados.config;
  const linhas = [];

  linhas.push(
    '<div class="servicos" id="nossos-servicos"' +
      (dados.servicos.length ? '' : ' hidden') +
      '>',
    '  <h3 class="servicos__titulo">Nossos serviços</h3>',
    '  <ul class="servicos__lista" id="lista-servicos-precos">'
  );

  dados.servicos.forEach(function (servico) {
    linhas.push(
      '    <li class="servico-card">',
      '      <h4 class="servico-card__nome">' +
        escapar(servico.nome) +
        '</h4>',
      '      <p class="servico-card__preco">' +
        '<span class="servico-card__valor">' +
        escapar(formatarMoeda(servico.preco)) +
        '</span>' +
        '<span class="servico-card__por">por peça comum</span>' +
        '</p>',
      '      <p class="servico-card__descricao">' +
        escapar(servico.descricao) +
        '</p>',
      '    </li>'
    );
  });

  linhas.push(
    '  </ul>',
    '  <p class="servicos__texto" id="texto-servicos">' +
      escapar(cfg.textoServicos || '') +
      '</p>',
    '</div>'
  );

  return linhas.join('\n');
}

function gerarTabelaCabecalho(dados) {
  const colunas = colunasDaTabela(dados);
  const linhas = ['<th scope="col">Peça</th>'];

  colunas.forEach(function (coluna) {
    linhas.push(
      '<th class="tabela__valor" scope="col">' +
        escapar(coluna.nome) +
        '</th>'
    );
  });

  return linhas.join('\n');
}

function gerarTabelaPrecos(dados) {
  const colunas = colunasDaTabela(dados);
  const grupos = agruparPorGrupo(dados.precos);
  const linhas = [];

  grupos.forEach(function (grupo) {
    linhas.push(
      '<tr class="tabela__grupo">',
      '  <th colspan="' +
        (colunas.length + 1) +
        '" scope="rowgroup">' +
        escapar(grupo.nome) +
        '</th>',
      '</tr>'
    );

    ordenarItens(grupo.itens, menorPrecoDoItem).forEach(function (item) {
      const celulas = [
        '<tr>',
        '  <th scope="row">' + escapar(item.nome) + '</th>',
      ];

      colunas.forEach(function (coluna) {
        const preco = coluna.id
          ? precoDoItem(item, coluna.id)
          : primeiroPrecoDoItem(item);

        celulas.push(
          '  <td class="tabela__valor">' +
            (preco === null ? '—' : escapar(formatarMoeda(preco))) +
            '</td>'
        );
      });

      celulas.push('</tr>');
      linhas.push(celulas.join('\n'));
    });
  });

  return linhas.join('\n');
}

function gerarAviso(dados, id) {
  const texto = String(
    dados.config.avisoAtendimento == null
      ? ''
      : dados.config.avisoAtendimento
  ).trim();

  if (!texto) {
    return (
      '<div class="aviso" id="' +
      id +
      '" data-aviso-atendimento hidden></div>'
    );
  }

  return (
    '<div class="aviso" id="' +
    id +
    '" data-aviso-atendimento>' +
    escapar(texto) +
    '</div>'
  );
}

function gerarNoscript(dados) {
  const cfg = dados.config;
  const link = linkWhatsApp(cfg, mensagemContato(cfg));

  return [
    '<noscript>',
    '  <p class="simulador__dica">',
    '    Para usar o simulador, ative o JavaScript ou fale com a gente pelo WhatsApp.',
    '    <a href="' + escapar(link) + '" target="_blank" rel="noopener"',
    '      >Falar no WhatsApp</a',
    '    >',
    '  </p>',
    '</noscript>',
  ].join('\n');
}

function gerarTabelaHorarios(dados) {
  const linhas = [];

  dados.horarios.forEach(function (horario) {
    const ehFolga =
      !horario.inicio ||
      !horario.fim ||
      (Array.isArray(horario.dias) && horario.dias.length === 0);

    linhas.push(
      '<tr>',
      '  <th scope="row" style="text-align: left">' +
        escapar(horario.dia || '') +
        '</th>',
      '  <td' +
        (ehFolga ? ' class="linha-fechada"' : '') +
        '>' +
        escapar(horario.horario || '') +
        '</td>',
      '</tr>'
    );
  });

  return linhas.join('\n');
}

function gerarReferencia(dados, id, classe, idTexto) {
  const referencia = String(
    dados.config.referencia == null ? '' : dados.config.referencia
  ).trim();

  const linhas = [
    '<p class="' +
      classe +
      '" id="' +
      id +
      '"' +
      (referencia ? '' : ' hidden') +
      '>',
    '  <span class="referencia__rotulo">Referência:</span>',
    '  <span id="' + idTexto + '">' + escapar(referencia) + '</span>',
    '</p>',
  ];

  return linhas.join('\n');
}

function gerarMapa(dados) {
  const cfg = dados.config;
  const linhas = [
    '<iframe',
    '  id="mapa"',
    '  class="mapa"',
    '  title="' + escapar('Mapa da localização da ' + cfg.nome) + '"',
  ];

  if (cfg.linkMapa) {
    linhas.push('  src="' + escapar(cfg.linkMapa) + '"');
  }

  linhas.push(
    '  loading="lazy"',
    '  referrerpolicy="no-referrer-when-downgrade"',
    '  allowfullscreen',
    '></iframe>'
  );

  return linhas.join('\n');
}

function gerarBtnRota(dados) {
  const cfg = dados.config;
  const rota =
    cfg.linkRota ||
    'https://www.google.com/maps/dir/?api=1&destination=' +
      encodeURIComponent(cfg.endereco || '');

  return [
    '<a',
    '  class="botao botao--marinho"',
    '  id="btn-rota"',
    '  href="' + escapar(rota) + '"',
    '  target="_blank"',
    '  rel="noopener"',
    '  >Como chegar</a',
    '>',
  ].join('\n');
}

function gerarRodapeWhatsapp(dados) {
  const cfg = dados.config;
  const link = linkWhatsApp(cfg, mensagemContato(cfg));

  return [
    '<a id="rodape-whatsapp" href="' + escapar(link) + '" target="_blank" rel="noopener">',
    '  <svg class="rodape__social-icone" aria-hidden="true" focusable="false">',
    '    <use href="#ico-whatsapp"></use>',
    '  </svg>',
    '  <span>Falar no WhatsApp</span>',
    '</a>',
  ].join('\n');
}

function gerarRodapeInstagram(dados) {
  const cfg = dados.config;
  const link = linkInstagram(cfg);
  const href = link ? ' href="' + escapar(link) + '"' : '';

  return [
    '<p class="rodape__social" id="rodape-bloco-instagram"' +
      (link ? '' : ' hidden') +
      '>',
    '  <a',
    '    id="rodape-instagram"' + href,
    '    target="_blank"',
    '    rel="noopener"',
    '    aria-label="' + escapar('Instagram da ' + cfg.nome) + '"',
    '  >',
    '    <svg class="rodape__social-icone" aria-hidden="true" focusable="false">',
    '      <use href="#ico-instagram"></use>',
    '    </svg>',
    '    <span>Siga no Instagram</span>',
    '  </a>',
    '</p>',
  ].join('\n');
}

function gerarDireitos(dados) {
  const cfg = dados.config;
  const ano = new Date().getFullYear();

  return [
    '<p class="rodape__direitos">',
    '  &copy; <span id="ano-atual">' + ano + '</span>',
    '  <span data-campo="nome">' + escapar(cfg.nome) + '</span>. Todos os direitos',
    '  reservados.',
    '</p>',
  ].join('\n');
}

function gerarCredito(dados) {
  const cfg = dados.config;
  const desenvolvedor = cfg.desenvolvedor || {};
  const nome = String(
    desenvolvedor.nome == null ? '' : desenvolvedor.nome
  ).trim();
  const link = String(
    desenvolvedor.link == null ? '' : desenvolvedor.link
  ).trim();

  if (!nome) {
    return '<p class="rodape__credito" id="rodape-credito" hidden></p>';
  }

  const conteudo = link
    ? 'Desenvolvido por <a href="' +
      escapar(link) +
      '" target="_blank" rel="noopener">' +
      escapar(nome) +
      '</a>'
    : 'Desenvolvido por ' + escapar(nome);

  return (
    '<p class="rodape__credito" id="rodape-credito">' + conteudo + '</p>'
  );
}

function gerarWhatsappFlutuante(dados) {
  const cfg = dados.config;
  const link = linkWhatsApp(cfg, mensagemContato(cfg));

  return [
    '<a',
    '  class="whatsapp-flutuante"',
    '  id="whatsapp-flutuante"',
    '  href="' + escapar(link) + '"',
    '  target="_blank"',
    '  rel="noopener"',
    '  aria-label="' + escapar('Falar com a ' + cfg.nome + ' no WhatsApp') + '"',
    '  title="Chamar no WhatsApp"',
    '>',
    '  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
    '    <use href="#ico-whatsapp"></use>',
    '  </svg>',
    '  <span class="whatsapp-flutuante__texto">Chamar no WhatsApp</span>',
    '</a>',
  ].join('\n');
}

function gerarConteudos(dados) {
  const cfg = dados.config;

  return {
    seo: gerarSeo(dados),
    'json-ld': gerarJsonLd(dados),
    'logo-topo': gerarLogo(dados, 'logo-topo', 'marca__logo', 48, 48, false),
    'nome-topo': escapar(cfg.nome),
    'cta-menu': gerarCtaSimulador(dados, 'menu'),
    'logo-hero': gerarLogo(dados, '', 'hero__logo', 600, 600, false),
    'nome-hero': escapar(cfg.nome),
    slogan: escapar(cfg.slogan || ''),
    'cta-hero': gerarCtaSimulador(dados, 'hero'),
    'sobre-texto': escapar(cfg.descricao || ''),
    diferenciais: gerarDiferenciais(dados),
    'texto-precos': escapar(cfg.textoPrecos || ''),
    'nossos-servicos': gerarNossosServicos(dados),
    'tabela-cabecalho': gerarTabelaCabecalho(dados),
    'tabela-precos': gerarTabelaPrecos(dados),
    'aviso-precos': gerarAviso(dados, 'aviso-atendimento-precos'),
    noscript: gerarNoscript(dados),
    'aviso-simulador': gerarAviso(dados, 'aviso-atendimento-simulador'),
    'tabela-horarios': gerarTabelaHorarios(dados),
    endereco: escapar(cfg.endereco || ''),
    'referencia-local': gerarReferencia(
      dados,
      'referencia-local',
      'referencia',
      'referencia-texto'
    ),
    mapa: gerarMapa(dados),
    'btn-rota': gerarBtnRota(dados),
    'logo-rodape': gerarLogo(
      dados,
      '',
      'rodape__logo',
      72,
      72,
      true
    ),
    'nome-rodape': escapar(cfg.nome),
    'rodape-endereco': escapar(cfg.endereco || ''),
    'rodape-referencia': gerarReferencia(
      dados,
      'rodape-referencia',
      'rodape__referencia',
      'rodape-referencia-texto'
    ),
    'rodape-whatsapp': gerarRodapeWhatsapp(dados),
    'rodape-instagram': gerarRodapeInstagram(dados),
    direitos: gerarDireitos(dados),
    credito: gerarCredito(dados),
    'whatsapp-flutuante': gerarWhatsappFlutuante(dados),
  };
}

/* --------------------------------------------------------------------------
   Substituição dos marcadores
   -------------------------------------------------------------------------- */

function contarOcorrencias(texto, procurado) {
  return texto.split(procurado).length - 1;
}

function validarMarcadores(html) {
  const problemas = [];

  TODOS_OS_MARCADORES.forEach(function (nome) {
    const inicio = '<!--ESTATICO:' + nome + '-->';
    const fim = '<!--/ESTATICO:' + nome + '-->';
    const totalInicio = contarOcorrencias(html, inicio);
    const totalFim = contarOcorrencias(html, fim);

    if (totalInicio !== 1 || totalFim !== 1) {
      problemas.push(
        '  ' +
          nome +
          ': ' +
          totalInicio +
          ' marcador(es) de abertura e ' +
          totalFim +
          ' de fechamento (esperado 1 de cada).'
      );
    }
  });

  if (problemas.length) {
    falhar(
      'o index.html tem marcadores ausentes ou duplicados:\n' +
        problemas.join('\n') +
        '\nConfira os pares <!--ESTATICO:nome--> e <!--/ESTATICO:nome-->.'
    );
  }
}

function indentar(texto, indentacao) {
  return String(texto)
    .split('\n')
    .map(function (linha) {
      return linha ? indentacao + linha : '';
    })
    .join('\n');
}

function substituirInline(html, nome, conteudo) {
  const inicio = '<!--ESTATICO:' + nome + '-->';
  const fim = '<!--/ESTATICO:' + nome + '-->';
  const posicaoInicio = html.indexOf(inicio);
  const posicaoFim = html.indexOf(fim, posicaoInicio + inicio.length);

  if (posicaoInicio === -1 || posicaoFim === -1) {
    falhar('marcador não encontrado ou fora de ordem: ' + nome);
  }

  return (
    html.slice(0, posicaoInicio + inicio.length) +
    conteudo +
    html.slice(posicaoFim)
  );
}

function substituirBloco(html, nome, conteudo) {
  const inicio = '<!--ESTATICO:' + nome + '-->';
  const fim = '<!--/ESTATICO:' + nome + '-->';
  const posicaoInicio = html.indexOf(inicio);
  const posicaoFim = html.indexOf(fim, posicaoInicio + inicio.length);

  if (posicaoInicio === -1 || posicaoFim === -1) {
    falhar('marcador não encontrado ou fora de ordem: ' + nome);
  }

  const inicioDaLinha = html.lastIndexOf('\n', posicaoInicio) + 1;
  const indentacao = html.slice(inicioDaLinha, posicaoInicio);

  if (!/^[ \t]*$/.test(indentacao)) {
    falhar(
      'o marcador ' +
        nome +
        ' precisa ficar sozinho em uma linha, sem texto antes dele.'
    );
  }

  const novoBloco =
    inicio +
    '\n' +
    indentar(conteudo, indentacao) +
    '\n' +
    indentacao +
    fim;

  return html.slice(0, posicaoInicio) + novoBloco + html.slice(posicaoFim + fim.length);
}

function gerarHtml(htmlOriginal, dados) {
  const conteudos = gerarConteudos(dados);
  let html = htmlOriginal;

  MARCADORES_INLINE.forEach(function (nome) {
    if (!Object.prototype.hasOwnProperty.call(conteudos, nome)) {
      falhar('conteúdo não gerado para o marcador inline: ' + nome);
    }
    html = substituirInline(html, nome, conteudos[nome]);
  });

  MARCADORES_BLOCO.forEach(function (nome) {
    if (!Object.prototype.hasOwnProperty.call(conteudos, nome)) {
      falhar('conteúdo não gerado para o marcador: ' + nome);
    }
    html = substituirBloco(html, nome, conteudos[nome]);
  });

  return html;
}

/* --------------------------------------------------------------------------
   Programa principal
   -------------------------------------------------------------------------- */

function principal() {
  const argumentos = process.argv.slice(2);
  const verificar = argumentos.indexOf('--verificar') !== -1;
  const desconhecidos = argumentos.filter(function (argumento) {
    return argumento !== '--verificar';
  });

  if (desconhecidos.length) {
    falhar(
      'opção desconhecida: ' +
        desconhecidos.join(' ') +
        '. Use apenas --verificar.'
    );
  }

  const config = carregarConfig();
  const dados = normalizarConfig(config);

  let htmlOriginal;
  try {
    htmlOriginal = fs.readFileSync(CAMINHO_HTML, 'utf8');
  } catch (erro) {
    falhar('não foi possível ler o index.html (' + erro.message + ').');
  }

  validarMarcadores(htmlOriginal);
  const htmlGerado = gerarHtml(htmlOriginal, dados);

  if (verificar) {
    if (htmlGerado === htmlOriginal) {
      console.log('index.html está atualizado em relação ao js/config.js.');
      return;
    }

    console.error(
      'index.html está desatualizado em relação ao js/config.js.\n' +
        'Rode: node scripts/gerar-estatico.js'
    );
    process.exit(1);
  }

  if (htmlGerado === htmlOriginal) {
    console.log('index.html já estava atualizado; nada foi alterado.');
    return;
  }

  try {
    fs.writeFileSync(CAMINHO_HTML, htmlGerado, 'utf8');
  } catch (erro) {
    falhar('não foi possível gravar o index.html (' + erro.message + ').');
  }

  console.log('index.html atualizado a partir do js/config.js.');
}

principal();
