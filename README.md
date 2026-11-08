# 🧺 Lavanderia Santo Antônio

Landing page responsiva (mobile-first) da Lavanderia Santo Antônio.
HTML, CSS e JavaScript puros — **sem framework, sem build, sem backend**.
Basta abrir o `index.html` no navegador.

```
projeto lavanderia/
├── index.html              estrutura da página
├── css/style.css           estilos e identidade visual
├── js/config.js            ⭐ TODOS OS DADOS EDITÁVEIS
├── js/app.js               lógica (preços, simulador, horários, WhatsApp)
└── assets/
    ├── logo.png            logomarca original (1,5 MB)
    ├── logo-otimizada.png  versão leve usada no site (600 px, ~200 KB)
    └── favicon.png         ícone do navegador
```

---

## ✏️ Como editar

**Tudo o que é conteúdo fica em um único arquivo: [`js/config.js`](js/config.js).**
Preço, horário, endereço, telefone, slogan… altere lá, salve e atualize o navegador.
Não é preciso mexer em `index.html` nem em `css/style.css`.

| Campo | Para que serve |
| --- | --- |
| `nome` | Nome exibido no topo, no rodapé e no título da aba |
| `logo` | Caminho da logomarca (`assets/logo-otimizada.png`) |
| `slogan` | Frase curta do topo da página (hero) |
| `descricaoSite` | Descrição do site: `<meta description>` e `og:description` |
| `textoPrecos` | Frase abaixo do título da seção "Tabela de preços" |
| `descricao` | Texto da seção "Sobre a lavanderia" |
| `whatsapp` | **Número com DDI + DDD, só dígitos.** Ex.: `5584999999999` |
| `instagram` | Nome do perfil no Instagram, só o usuário (sem `@` e sem link). Vazio (`''`) = nada do Instagram aparece na página. |
| `avisoAtendimento` | Aviso exibido abaixo da tabela de preços e abaixo do resumo do simulador. Vazio (`''`) = nada é exibido. |
| `endereco` | Endereço completo, em uma linha |
| `referencia` | Opcional. Ponto de referência, em letra menor abaixo do endereço |
| `linkMapa` | URL de incorporação do Google Maps |
| `linkRota` | Opcional. Vazio = o botão "Como chegar" é montado pelo endereço |
| `horarios` | Lista de dias e horários (controla também o "Aberto agora") |
| `diferenciais` | Cards da seção "Sobre" |
| `servicos` | Serviços oferecidos: cards, colunas da tabela e passo 1 do simulador |
| `textoServicos` | Texto pequeno exibido abaixo dos cards "Nossos serviços" |
| `precos` | Itens e preços por serviço (`valores`) da tabela e do simulador |
| `mensagemWhatsApp` | Texto de abertura da mensagem no WhatsApp |
| `mensagemWhatsAppFinal` | Frase final da mensagem |
| `desenvolvedor` | Crédito no rodapé: `nome` (vazio = não aparece) e `link` opcional do desenvolvedor |

### Antes de publicar (importante!)

Checklist final:

1. **Nº do WhatsApp** — conferir em `whatsapp` (somente dígitos, com `55`).
2. **Preços** — conferir `PECA_COMUM` (peças comuns), `servicos` e `precos`.
3. **Horários** — conferir em `horarios` (o indicador "Aberto agora" usa `inicio` e `fim`).
4. **Endereço e mapa** — conferir em `endereco`, `linkMapa` e `linkRota`.
5. **Instagram** — conferir em `instagram`.
6. **Aviso de atendimento** — conferir em `avisoAtendimento`.
7. **SEO** — `canonical`, `og:url` e `og:image` já apontam para
   `https://lavanderiasantoantonio.vercel.app/`. Se o endereço mudar
   (domínio próprio, por exemplo), atualize os três no `index.html`.

### Exemplos

**Serviços** — a ordem de `servicos` define a ordem dos cards "Nossos
serviços", das colunas da tabela e dos botões do passo 1 do simulador.
O `id` é a chave usada em `precos[].valores`:

```js
servicos: [
  { id: 'passar',       nome: 'Apenas passar',  preco: PECA_COMUM.passar,           descricao: 'Passamos as suas peças.' },
  { id: 'lavar-passar', nome: 'Lavar e passar', preco: PECA_COMUM['lavar-passar'], descricao: 'Lavamos e passamos as suas peças.' },
],
```

**Preços das peças comuns** — definidos em um único lugar, `PECA_COMUM`.
A chave é o `id` do serviço e o valor é o preço por peça:

```js
// Único lugar para alterar o preço das peças comuns
const PECA_COMUM = { 'lavar-passar': 1.5, passar: 1.0 };
```

**Preços** — cada item tem `id`, `grupo`, `nome` e `valores`. Em `valores`,
a chave é o `id` de um serviço e o valor é o preço por peça. O campo `grupo` é
**opcional** e serve só para organizar a tela:

- Peças com o **mesmo texto** de `grupo` aparecem juntas, na ordem em que o
  grupo aparece pela primeira vez no arquivo.
- Um texto de `grupo` novo cria uma seção nova. A tabela de preços ganha uma
  linha de título; no simulador o grupo vira um bloco recolhível.
- Peça **sem** `grupo` (ou com `grupo` vazio) vai para um grupo chamado
  **"Outros"** — nada quebra.
- Item **sem preço** em um serviço (`valores` sem aquela chave) não aparece no
  simulador desse serviço e, na tabela, mostra **"—"** na coluna dele.
- Os itens de cada grupo são ordenados automaticamente pelo **preço** (do menor
  para o maior) e, em caso de empate, pelo **nome** em ordem alfabética,
  ignorando acentos e maiúsculas: no simulador vale o preço do serviço escolhido
  e, na tabela, o menor preço disponível do item entre os serviços.
- Categorias sem nenhum item disponível para o serviço escolhido ficam ocultas.
- O simulador abre só o primeiro grupo; os demais começam fechados, para a
  lista não ficar enorme no celular. Ao escolher uma peça, o grupo abre e o
  título mostra a quantidade, ex.: `Casa e cama (2)`.
- Os grupos **não** aparecem na mensagem do WhatsApp: ela continua com uma
  linha por peça.

```js
precos: [
  // Peças comuns: usam PECA_COMUM (mesmo preço em todos os itens do grupo)
  { id: 'camiseta', grupo: 'Peças comuns', nome: 'Camiseta', valores: PECA_COMUM },

  // Outras roupas: só têm preço em "lavar-passar"
  { id: 'paleto', grupo: 'Outras roupas', nome: 'Paletó completo', valores: { 'lavar-passar': 20.0 } },

  // Casa e cama
  { id: 'edredom-casal', grupo: 'Casa e cama', nome: 'Edredom de casal', valores: { 'lavar-passar': 20.0 } },

  // Sem "grupo": aparece no grupo "Outros"
  { id: 'item-avulso', nome: 'Peça avulsa', valores: { 'lavar-passar': 5.0 } },
],
```

O `id` do item precisa ser único (é usado nos campos do simulador) e o `id`
do serviço precisa bater com as chaves de `valores`. A ordem dos grupos é a
ordem de primeira aparição no arquivo — para mudar a ordem, mova as linhas.

**Horários** — `dias` usa `0 = Domingo … 6 = Sábado`:

```js
horarios: [
  { dia: 'Segunda a Sexta', horario: '07:30 às 18:00', dias: [1,2,3,4,5], inicio: '07:30', fim: '18:00' },
  { dia: 'Sábado',          horario: '07:30 às 13:00', dias: [6],       inicio: '07:30', fim: '13:00' },
  { dia: 'Domingo',         horario: 'Fechado',        dias: [0],       inicio: null,      fim: null },
],
```

**Mensagem do WhatsApp** — montada automaticamente assim (só as peças com
quantidade maior que zero, sem os nomes dos grupos):

```
Olá! Gostaria de solicitar um serviço de lavanderia.

Serviço: Lavar e passar

Peças:
- 3x Camiseta
- 1x Paletó completo

Total de peças: 4
Valor total estimado: R$ 24,50

Poderiam me atender, por favor?
```

---

## 🚀 Publicar gratuitamente

### Opção 1 — Vercel (usada hoje)

O site está publicado em **https://lavanderiasantoantonio.vercel.app/**.
O projeto `lavanderia` está conectado ao repositório do GitHub e o deploy é
automático: todo `push` na branch `main` gera uma nova publicação.

Para publicar manualmente pela primeira vez:

1. Instale a CLI: `npm i -g vercel` (ou use `npx vercel`).
2. Na pasta do projeto, rode `vercel` e faça login.
3. Confirme as opções: **framework** `Other`, **build command** vazio,
   **output directory** `.` (a raiz do projeto).
4. Rode `vercel --prod` para publicar em produção.

O arquivo [`vercel.json`](vercel.json) já define `cleanUrls`, remove a barra
final das URLs e adiciona cabeçalhos de segurança.

Para atualizar o site, basta "commitar" e enviar para o GitHub — a Vercel
publica sozinha. Também dá para arrastar a pasta do projeto em
[vercel.com/new](https://vercel.com/new).

### Opção 2 — GitHub Pages

1. Crie uma conta em [github.com](https://github.com) e um repositório novo (pode ser privado… o Pages exige plano gratuito com repositório **público**).
2. Suba os arquivos (`index.html`, `css/`, `js/`, `assets/`) para o repositório.
3. O GitHub Pages gratuito exige repositório público.
4. Em 1–2 minutos o site fica no ar em `https://seu-usuario.github.io/nome-do-repo/`.
   Se for usar esse endereço, atualize `canonical`, `og:url` e `og:image` no
   `index.html`.

### Opção 3 — Netlify (arrastar e soltar)

1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop).
2. **Arraste a pasta inteira** do projeto para a página.
3. Pronto: o site já está publicado com endereço do tipo `https://aleatorio-1234.netlify.app`.

Para atualizar, arraste a pasta de novo. Para usar seu próprio domínio:
**Site settings → Domain management → Add a domain**.

---

## 📊 Visitantes e visualizações de página

O site usa o **Vercel Web Analytics**, já habilitado no projeto. Ele conta
visitantes únicos e visualizações de página sem usar cookies.

- **Painel:** [vercel.com](https://vercel.com) → projeto `lavanderiasantoantonio` → **Analytics**
- Mostra visitantes, page views, páginas mais vistas, origem do acesso, país,
  navegador e dispositivo, com filtro de período.
- O script fica no fim do `index.html`:

  ```html
  <script>
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  </script>
  <script defer src="/_vercel/insights/script.js"></script>
  ```

- Por não usar cookies nem dados pessoais, não precisa de banner de consentimento.
- Os números só existem a partir da data em que o Analytics foi habilitado; não
  há dados retroativos do GitHub Pages.

## 🧪 Como testar o simulador

1. Abra o `index.html` (funciona direto do disco, sem servidor).
2. Vá até **Simulador de serviço**.
3. Em **1. Escolha o serviço**, selecione "Apenas passar" ou "Lavar e passar".
4. Em **2. Informe as peças**, abra uma categoria (só a primeira começa aberta)
   e use os botões **−** e **+** ou digite a quantidade (o total atualiza na hora).
5. O título do grupo mostra quantas peças já foram escolhidas nele, ex.: `Casa e cama (2)`.
6. O resumo mostra o serviço escolhido; o botão **Confirmar Serviço** só libera
   com um serviço escolhido e pelo menos uma peça.
7. Ao confirmar, o WhatsApp abre em nova aba com o pedido já escrito.

## ♿ Acessibilidade e desempenho

- HTML semântico (`header`, `nav`, `main`, `section`, `address`, `footer`), `label` em todos os campos.
- Navegação por teclado, foco visível, link "Pular para o conteúdo" e menu que fecha com `Esc`.
- Respeita `prefers-reduced-motion` e cores com bom contraste.
- Ícones em SVG inline (sem biblioteca externa), imagens leves e `loading="lazy"` no mapa e no rodapé.
- Fonte Nunito via Google Fonts, com fallback do sistema caso esteja offline.
- Dados estruturados **JSON-LD** (`LaundryOrDryCleaner`) gerados a partir do `config.js` — bom para o Google.

## 🖼️ Sobre a logomarca

O arquivo original (`assets/logo.png`, 1,5 MB) foi mantido intacto.
A versão usada na página é `assets/logo-otimizada.png` (600 px, ~200 KB, 7× menor),
gerada a partir da original — é a que o site carrega para ser rápido.