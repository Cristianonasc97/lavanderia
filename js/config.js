/* ==========================================================================
   LAVANDERIA SANTO ANTÔNIO — CONFIGURAÇÃO
   --------------------------------------------------------------------------
   ESTE É O ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR.
   Tudo o que aparece no site (nome, telefone, endereço, horários, preços,
   slogans, diferenciais e a mensagem do WhatsApp) sai daqui.

   Salve o arquivo e atualize a página: as mudanças aparecem na hora.
   ========================================================================== */

/* ------------------------------------------------------------------------
   PREÇO DAS PEÇAS COMUNS
   ------------------------------------------------------------------------
   ESTE É O ÚNICO LUGAR PARA ALTERAR O PREÇO DAS PEÇAS COMUNS.
   A chave é o "id" de um serviço (veja "servicos" logo abaixo) e o valor é
   o preço por peça, em REAIS, como número (ex.: 1.5 = R$ 1,50).
   ------------------------------------------------------------------------ */
const PECA_COMUM = { 'lavar-passar': 1.5, passar: 1.0 };

const CONFIG = {
  /* ----------------------------------------------------------------------
     IDENTIDADE
     ---------------------------------------------------------------------- */
  nome: 'Lavanderia Santo Antônio',

  // Caminho da logomarca usada na página. Use sempre a versão otimizada.
  logo: 'assets/logo-otimizada.png',

  // Frase curta que aparece no topo da página (hero).
  slogan: 'Suas roupas limpas e bem cuidadas',

  // Descrição do site usada no Google e nas redes sociais (tag <meta
  // name="description"> e og:description). Até ~155 caracteres.
  descricaoSite:
    'Lavanderia Santo Antônio: lavagem de roupas. Confira a tabela de preços, ' +
    'simule seu pedido e finalize pelo WhatsApp.',

  // Texto que aparece logo abaixo do título da seção "Tabela de preços".
  textoPrecos: 'Valores por peça, organizados por categoria.',

  // Texto pequeno exibido abaixo dos cards "Nossos serviços".
  textoServicos:
    'Valores por peça comum: camiseta, calça, bermuda, vestido, meia, lençol fino, ' +
    'fronha, saia, sutiã e toalha. Os demais itens têm preço próprio, na tabela abaixo.',

  // Texto da seção "Sobre a lavanderia".
  //
  // IMPORTANTE: o texto abaixo fala APENAS em lavagem de roupas e cuidado
  // com as peças. Não são afirmados serviços de entrega, passagem, retirada
  // nem tempo de experiência.
  // Se a lavanderia passar a oferecer esses serviços, este é o lugar para
  // mencioná-los: acrescente uma frase ao final do texto, por exemplo
  //   + ' Também fazemos entrega, passagem e retirada no endereço.'
  // e adicione um card em "diferenciais" (abaixo) com o ícone desejado.
  descricao:
    'Cuidamos da lavagem das suas roupas com atenção a cada detalhe. ' +
    'Usamos produtos próprios para roupa e tratamos cada peça individualmente, ' +
    'preservando as cores, os tecidos e o brilho de cada roupa.',

  /* ----------------------------------------------------------------------
     CONTATO
     ---------------------------------------------------------------------- */
  // Formato: código do país + DDD + número, SÓ DÍGITOS. Ex.: 5584999999999
  whatsapp: '5584988067964',

  // Instagram da lavanderia.
  // Coloque APENAS o nome do perfil, sem "@" e sem link:
  // Ex.: 'lavanderia_santoantonio'
  //
  // O site monta tudo sozinho a partir deste campo:
  //   - o texto exibido vira "@lavanderia_santoantonio"
  //   - o link vira https://www.instagram.com/lavanderia_santoantonio/
  //
  // Deixe como '' (aspas vazias) se a lavanderia não tiver Instagram:
  // nesse caso nada do Instagram aparece na página (nem o @usuário no
  // rodapé, nem o botão "Siga no Instagram", nem o campo sameAs do JSON-LD).
  instagram: 'lavanderia_santoantonio',

  // Aviso exibido em destaque discreto logo abaixo da tabela de preços e
  // logo abaixo do resumo do simulador. Se vazio (''), nada é exibido.
  avisoAtendimento: 'Atendimento na lavanderia: não realizamos busca e entrega. Traga suas peças até nós.',

  // Endereço completo (Rua, número, bairro, cidade - UF).
  endereco: 'Av. Maria Amélia Machado, 55 - Emaús, Parnamirim - RN',

  // (Opcional) Ponto de referência para quem não conhece a região.
  // Aparece em letra menor logo abaixo do endereço, na seção "Onde estamos"
  // e no rodapé.
  // Deixe como '' (aspas vazias) se não quiser mostrar: o bloco some sozinho.
  //
  // IMPORTANTE: a referência serve só para orientar a pessoa. Ela NÃO entra no
  // mapa, nem no link "Como chegar" e nem nos dados estruturados (JSON-LD) do
  // Google — para isso use os campos "endereco" e "linkMapa".
  referencia: 'Ao lado da Igreja Universal',

  // URL de incorporação (embed) do Google Maps.
  // Como obter: Google Maps > Compartilhar > Incorporar mapa > copiar
  // apenas o trecho que está dentro de "src=" da tag <iframe>.
  linkMapa:
    'https://www.google.com/maps?q=Av.+Maria+Am%C3%A9lia+Machado,+55,+Ema%C3%BAs,+Parnamirim,+RN&output=embed',

  // (Opcional) Link direto da rota no Google Maps.
  // Deixe vazio ('') e o botão "Como chegar" é montado automaticamente
  // a partir do campo "endereco" acima.
  linkRota:
    'https://www.google.com/maps/dir/?api=1&destination=Av.+Maria+Am%C3%A9lia+Machado,+55,+Ema%C3%BAs,+Parnamirim,+RN',

  /* ----------------------------------------------------------------------
     HORÁRIOS DE FUNCIONAMENTO
     ----------------------------------------------------------------------
     "dia"     -> texto que aparece na primeira coluna da tabela.
     "horario" -> texto que aparece na segunda coluna.
     "dias"    -> números do dia da semana (0 = Domingo ... 6 = Sábado).
                  Use [] no dia de folga.
     "inicio"  -> horário de abertura "HH:MM" (usado no indicador
                  "Aberto agora"). Só o que está entre "inicio" e "fim"
                  conta como aberto.
     "fim"     -> horário de fechamento "HH:MM".
     ---------------------------------------------------------------------- */
  horarios: [
    {
      dia: 'Segunda a Sexta',
      horario: '07:30 às 18:00',
      dias: [1, 2, 3, 4, 5],
      inicio: '07:30',
      fim: '18:00',
    },
    {
      dia: 'Sábado',
      horario: '07:30 às 13:00',
      dias: [6],
      inicio: '07:30',
      fim: '13:00',
    },
    {
      dia: 'Domingo',
      horario: 'Fechado',
      dias: [0],
      inicio: null,
      fim: null,
    },
  ],

  /* ----------------------------------------------------------------------
     DIFERENCIAIS (cards da seção "Sobre a lavanderia")
     ----------------------------------------------------------------------
     "icone" -> nome de um dos ícones disponíveis em js/app.js:
     cuidado | qualidade | escudo | brilho | bolha

     Os cards abaixo falam apenas de lavagem e cuidado com as peças.
     Se a lavanderia passar a oferecer outros serviços (entrega, passagem,
     retirada, etc.), ADICIONE novos cards neste array — um objeto por
     serviço, com { icone, titulo, texto }.
     ---------------------------------------------------------------------- */
  diferenciais: [
    {
      icone: 'cuidado',
      titulo: 'Cuidado com as peças',
      texto: 'Cada peça recebe atenção individual durante a lavagem.',
    },
    {
      icone: 'qualidade',
      titulo: 'Produtos de qualidade',
      texto: 'Produtos profissionais que preservam as fibras e as cores.',
    },
    {
      icone: 'escudo',
      titulo: 'Roupas limpas e cheirosas',
      texto: 'Lavagem caprichada, que deixa suas roupas limpas e cheirosas.',
    },
    {
      icone: 'brilho',
      titulo: 'Cuidado com as cores',
      texto: 'Procuramos preservar a tonalidade e o brilho das suas roupas.',
    },
  ],

  /* ----------------------------------------------------------------------
     SERVIÇOS OFERECIDOS
     ----------------------------------------------------------------------
     Cada serviço tem:
     - "id"        : identificador curto (sem acento, sem espaço). É a chave
                     usada em "precos[].valores" e nos botões do simulador.
     - "nome"      : nome exibido nos cards, na tabela e no resumo do pedido.
     - "preco"     : preço de referência da peça comum, em REAIS, como número.
                     Para as peças comuns, use sempre PECA_COMUM (acima).
     - "descricao" : texto curto exibido no card do serviço.

     A ordem desta lista é a ordem dos cards, das colunas da tabela e dos
     botões do simulador. Pode adicionar ou remover serviços à vontade.
     ---------------------------------------------------------------------- */
  servicos: [
    {
      id: 'passar',
      nome: 'Apenas passar',
      preco: PECA_COMUM.passar,
      descricao: 'Passamos as suas peças.',
    },
    {
      id: 'lavar-passar',
      nome: 'Lavar e passar',
      preco: PECA_COMUM['lavar-passar'],
      descricao: 'Lavamos e passamos as suas peças.',
    },
  ],

  /* ----------------------------------------------------------------------
     TABELA DE PREÇOS
     ----------------------------------------------------------------------
     Valores reais da Lavanderia Santo Antônio, organizados por grupo.
     - "id"     : identificador único e curto (sem acento, sem espaço).
     - "grupo"  : categoria em que o item aparece na tabela e no simulador.
     - "nome"   : nome que aparece na tabela e na mensagem do WhatsApp.
     - "valores": preço por serviço, em REAIS, como número (ex.: 1.5 = R$ 1,50).
                  A chave é o "id" de um serviço (campo "servicos").
                  Ex.: { 'lavar-passar': 1.5, passar: 1.0 }
                  Item sem preço em um serviço não aparece no simulador desse
                  serviço e, na tabela, mostra "—" na coluna correspondente.

     As peças comuns usam PECA_COMUM (o único lugar onde o preço delas é
     definido). Pode ADICIONAR ou REMOVER itens à vontade.
     ---------------------------------------------------------------------- */
  precos: [
    // --- Peças comuns (preço definido em PECA_COMUM) ---
    { id: 'camiseta', grupo: 'Peças comuns', nome: 'Camiseta', valores: PECA_COMUM },
    { id: 'calca', grupo: 'Peças comuns', nome: 'Calça', valores: PECA_COMUM },
    { id: 'bermuda', grupo: 'Peças comuns', nome: 'Bermuda', valores: PECA_COMUM },
    { id: 'vestido', grupo: 'Peças comuns', nome: 'Vestido', valores: PECA_COMUM },
    { id: 'meia', grupo: 'Peças comuns', nome: 'Meia', valores: PECA_COMUM },
    { id: 'lencol-fino', grupo: 'Peças comuns', nome: 'Lençol fino', valores: PECA_COMUM },
    { id: 'fronha', grupo: 'Peças comuns', nome: 'Fronha', valores: PECA_COMUM },
    { id: 'saia', grupo: 'Peças comuns', nome: 'Saia', valores: PECA_COMUM },
    { id: 'sutia', grupo: 'Peças comuns', nome: 'Sutiã', valores: PECA_COMUM },
    { id: 'toalha', grupo: 'Peças comuns', nome: 'Toalha', valores: PECA_COMUM },

    // --- Outras roupas (somente lavar e passar) ---
    { id: 'cueca', grupo: 'Outras roupas', nome: 'Cueca', valores: { 'lavar-passar': 2.0 } },
    { id: 'calcinha', grupo: 'Outras roupas', nome: 'Calcinha', valores: { 'lavar-passar': 2.0 } },
    { id: 'camisa-social', grupo: 'Outras roupas', nome: 'Camisa social', valores: { 'lavar-passar': 2.0 } },
    { id: 'paleto', grupo: 'Outras roupas', nome: 'Paletó completo', valores: { 'lavar-passar': 20.0 } },
    { id: 'casaco', grupo: 'Outras roupas', nome: 'Casaco', valores: { 'lavar-passar': 3.0 } },

    // --- Casa e cama (somente lavar e passar) ---
    { id: 'edredom-solteiro', grupo: 'Casa e cama', nome: 'Edredom de solteiro', valores: { 'lavar-passar': 10.0 } },
    { id: 'edredom-casal', grupo: 'Casa e cama', nome: 'Edredom de casal', valores: { 'lavar-passar': 20.0 } },
    { id: 'coberta', grupo: 'Casa e cama', nome: 'Coberta', valores: { 'lavar-passar': 10.0 } },
    { id: 'cortina-quarto', grupo: 'Casa e cama', nome: 'Cortina de quarto (pequena)', valores: { 'lavar-passar': 30.0 } },
    { id: 'cortina-sala', grupo: 'Casa e cama', nome: 'Cortina de sala (grande)', valores: { 'lavar-passar': 70.0 } },
    { id: 'rede-pequena', grupo: 'Casa e cama', nome: 'Rede pequena', valores: { 'lavar-passar': 15.0 } },
    { id: 'rede-grande', grupo: 'Casa e cama', nome: 'Rede grande', valores: { 'lavar-passar': 20.0 } },

    // --- Calçados e conforto (somente lavar e passar) ---
    { id: 'tenis', grupo: 'Calçados e conforto', nome: 'Tênis', valores: { 'lavar-passar': 15.0 } },
    { id: 'travesseiro', grupo: 'Calçados e conforto', nome: 'Travesseiro', valores: { 'lavar-passar': 15.0 } },
    { id: 'almofada-pequena', grupo: 'Calçados e conforto', nome: 'Almofada pequena', valores: { 'lavar-passar': 5.0 } },
    { id: 'almofada-grande', grupo: 'Calçados e conforto', nome: 'Almofada grande', valores: { 'lavar-passar': 15.0 } },
    { id: 'urso', grupo: 'Calçados e conforto', nome: 'Urso de pelúcia', valores: { 'lavar-passar': 5.0 } },
  ],

  /* ----------------------------------------------------------------------
     CRÉDITO DO DESENVOLVEDOR (rodapé)
     ---------------------------------------------------------------------- */
  // Crédito do desenvolvedor, exibido de forma discreta no fim do rodapé.
  // "nome" vazio ('') = o crédito não aparece.
  // "link" é opcional: com link, o nome vira clicável (abre em nova aba);
  // vazio ('') = texto simples, sem link.
  desenvolvedor: {
    nome: 'Cristiano Santos',
    link: '',
  },

  /* ----------------------------------------------------------------------
     MENSAGEM DO WHATSAPP
     ----------------------------------------------------------------------
     A mensagem enviada ao clicar em "Confirmar Serviço" é montada assim:
       1. "mensagemWhatsApp"          (texto de abertura)
       2. A lista "Peças:"            (montada a partir do simulador)
       3. O total de peças e o valor estimado
       4. "mensagemWhatsAppFinal"     (pedido de atendimento)
     ---------------------------------------------------------------------- */
  mensagemWhatsApp: 'Olá! Gostaria de solicitar um serviço de lavanderia.',
  mensagemWhatsAppFinal: 'Poderiam me atender, por favor?',
};