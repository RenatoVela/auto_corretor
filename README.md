# Auto Corretor Ortográfico Inteligente (Extensão para Chrome)

Uma extensão avançada para o Google Chrome que atua como o seu revisor pessoal. Ela sugere correções para erros de digitação, falta de acentuação e vícios de linguagem em tempo real enquanto você digita, funcionando perfeitamente em sites complexos como **WhatsApp Web, Outlook e Gmail**.

## ✨ Principais Funcionalidades

* **Sugestões Inteligentes (Tecla TAB):** A extensão não substitui a palavra à força e não tira o seu foco. Ela exibe uma notificação flutuante e sutil sugerindo a correção. Se quiser corrigir, basta apertar a tecla **TAB**. Se não, é só ignorar.
* **Inteligência de Aproximação (Fuzzy Matching):** Equipado com o algoritmo de *Distância de Levenshtein*, o corretor percebe quando você esbarra em uma tecla ou inverte letras (ex: `princpiio`) e sugere a palavra correta mesmo que aquele erro exato não esteja cadastrado.
* **Sincronização em Nuvem:** As palavras não ficam presas no seu computador. A extensão baixa e atualiza o dicionário diretamente do GitHub em segundo plano!
* **Compatibilidade Máxima:** Usa injeção de eventos nativos (`ContentEditable`), o que permite que funcione dentro do WhatsApp Web e editores de e-mail sem perder o foco do cursor.

## 📥 Como instalar no Chrome

O jeito mais fácil de instalar a versão sempre atualizada é baixando direto deste repositório:

1. [Clique aqui para baixar o arquivo ZIP da extensão](https://github.com/RenatoVela/auto_corretor/archive/refs/heads/main.zip) e extraia (descompacte) a pasta no seu computador.
2. Abra o Google Chrome.
3. Na barra de endereços, digite `chrome://extensions/` e pressione **Enter**.
4. No canto superior direito, ative o **"Modo do desenvolvedor"** (Developer mode).
5. Clique no botão **"Carregar sem compactação"** (Load unpacked) que aparecerá no canto superior esquerdo.
6. Selecione a pasta que você acabou de extrair.
7. A extensão será instalada e já estará ativa!

## ⚙️ Como adicionar mais palavras ao Dicionário

Você não precisa editar os arquivos no seu computador! Sendo dono do repositório, você pode atualizar para todos os usuários ao mesmo tempo:

1. Acesse este repositório no seu GitHub.
2. Abra o arquivo `dictionary.json` e clique no ícone de editar (lápis).
3. Adicione a sua nova regra de correção no formato `"palavra_errada": "palavra_correta",` (lembre-se da vírgula no final, exceto na última linha).
4. Salve a alteração (Commit).

Pronto! A sua extensão e a de quem você compartilhou farão o download dessa palavra nova automaticamente em até uma hora, graças ao sistema de sincronização. Caso queira forçar a atualização imediata, basta ir em `chrome://extensions/` e clicar no ícone de "Atualizar" da extensão.
