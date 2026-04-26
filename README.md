# Auto Corretor Ortográfico (Extensão para Chrome)

Uma extensão simples para Google Chrome que corrige automaticamente erros de digitação comuns e abreviações enquanto você digita em campos de texto de qualquer site.

## Como instalar no Chrome

1. Abra o Google Chrome.
2. Na barra de endereços, digite `chrome://extensions/` e pressione Enter.
3. No canto superior direito, ative o **"Modo do desenvolvedor"** (Developer mode).
4. Clique no botão **"Carregar sem compactação"** (Load unpacked) que aparecerá no canto superior esquerdo.
5. Selecione a pasta `auto_corretor` que contém estes arquivos (`manifest.json`, `content.js`, etc.).
6. A extensão será instalada e já estará ativa!

## Como funciona
A extensão monitora campos de texto (`<input type="text">` e `<textarea>`). Quando você termina de digitar uma palavra (apertando espaço ou alguma pontuação), ela verifica se a palavra está na lista do dicionário e a substitui instantaneamente, mantendo a posição do seu cursor para não atrapalhar a digitação.

## Como adicionar mais palavras
Para adicionar ou modificar as correções, basta abrir o arquivo `dictionary.js` num editor de texto e adicionar novas linhas ao mapa `autoCorrectMap` no formato:
`"palavra_errada": "palavra_correta",`

Lembre-se de recarregar a extensão no `chrome://extensions/` (clicando no botão de atualizar no card da extensão) após fazer qualquer alteração nos arquivos!
