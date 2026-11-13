# ContAgro

**Site:** https://echavez404.github.io/ContAgro/

O ContAgro liga o produtor rural ao escritório de contabilidade num ponto que hoje se
perde: saber para qual fazenda foi cada nota de insumo. A ideia é perguntar isso ao
produtor pelo WhatsApp no momento em que a nota chega, enquanto ele ainda lembra.

Este repositório guarda o site de apresentação do projeto.

## O problema

No tempo da nota de papel, quem recebia o caminhão na fazenda anotava atrás do papel
alguma coisa como "Boa Vista, talhão 3", e o contador sabia onde lançar. Com a NF-e,
o XML chega no escritório poucas horas depois da emissão, sem passar pela mão de
ninguém que viu a carga, e essa anotação deixou de existir.

O layout do LCDPR pede o código do imóvel em cada lançamento, mas o XML da NF-e não tem
esse campo (nem depois da Nota Técnica 2024.003, que criou o grupo de informações do
agro). Na hora de fechar o ano, o contador tem centenas de notas sem saber de qual
fazenda é cada uma. O que não dá para atribuir fica fora do livro caixa, e o produtor
pode acabar declarando pelos 20% presumidos da receita bruta e pagando imposto sobre
um lucro que não teve.

## Como funciona

1. **A nota chega no escritório.** O ContAgro lê os XMLs que o escritório já recebe
   (fornecedor, valor, data e chave de acesso). Não precisa do certificado digital do
   cliente.
2. **O produtor recebe uma pergunta no WhatsApp.** Uma mensagem curta, com fornecedor,
   valor e um botão para cada fazenda dele. Como a nota é emitida antes de o caminhão
   sair, a pergunta costuma chegar com a carga ainda na estrada.
3. **O lançamento já entra com a fazenda.** A resposta fica ligada à chave da nota. O
   contador vê o lançamento com imóvel e safra, e o que falta responder aparece numa
   lista de pendências.

O produtor não instala nada nem precisa de login. Se o sinal estiver ruim, a mensagem
espera no celular e a resposta vai quando a conexão voltar. A análise, o lançamento
final e a assinatura continuam com o contador.

## O site

Página única com:

- a conversa no WhatsApp encenada no topo, do aviso da nota ao lançamento no escritório;
- a comparação entre a nota de papel anotada à mão e o XML sem o campo da fazenda;
- um simulador que compara o imposto sobre o resultado real com o imposto sobre os 20%
  presumidos (alíquota de 27,5%, só ilustrativo);
- um calendário com os prazos fiscais do ano (Funrural, IRPF e LCDPR, ITR e ADA,
  investimento), que destaca o mês atual;
- dúvidas frequentes e contato.

É HTML, CSS e JavaScript puros, sem dependências nem etapa de build. As animações
respeitam a opção de reduzir movimento do sistema.

### Rodar localmente

Abra o `index.html` no navegador. Não precisa de servidor.

### Arquivos

| Arquivo | O que é |
| --- | --- |
| `index.html` | conteúdo da página |
| `style.css` | estilos e animações |
| `script.js` | menu, animações, simulador e calendário |
| `favicon.svg`, `favicon.ico` | ícone da aba |
| `apple-touch-icon.png` | ícone para a tela inicial do celular |

### Publicação

O site é publicado pelo GitHub Pages a partir da raiz da branch `main`. Cada commit na
`main` atualiza o site em poucos minutos.

## O evento

O ContAgro nasceu num hackathon.

## Contato

Balsas (MA), atendendo todo o MATOPIBA.

- WhatsApp: [(99) 98503-0310](https://wa.me/5599985030310)
- E-mail: dev.echavez@gmail.com

---

Conteúdo informativo. Não substitui a orientação contábil ou tributária de um contador.
A base legal citada no site é a Lei 8.023/1990, a Lei 9.393/1996 e a IN RFB 2.110/2022.
