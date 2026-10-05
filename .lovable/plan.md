# Tornar a cópia do relatório rica e semântica

## Objetivo
Manter todo o conteúdo atual do relatório e alterar apenas o HTML enviado ao botão **COPIAR**, para que editores de texto rico preservem a apresentação e continuem permitindo edição.

## Implementação
- Reorganizar a representação compartilhada da cópia em blocos semânticos, sem mudar textos, valores, ordem ou regras de seleção do relatório.
- Gerar HTML completo para área de transferência com:
  - títulos em `h1` e `h2`;
  - rótulos e valores tabulares em tabelas editáveis;
  - listas reais (`ul`/`ol`) para alimentos, achados, estratégias, foco e acompanhamento;
  - negritos com `strong`;
  - parágrafos e espaçamentos próprios, com estilos compatíveis com Rich Text Editors.
- Preservar a alternativa em texto puro para destinos que não aceitem HTML.
- Manter o botão **COPIAR** e o conteúdo visual exibido no aplicativo sem mudanças.

## Verificação
- Validar o HTML gerado quanto à semântica, conteúdo e ausência de dados alterados.
- Testar a cópia pelo botão e confirmar que o navegador oferece simultaneamente `text/html` e `text/plain`.
- Conferir a prévia e o estado da compilação após a alteração.
