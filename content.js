// content.js - Modo de Sugestões Sincronizadas na Nuvem

// Puxa o dicionário mais recente da memória (baixado da nuvem pelo background.js)
chrome.storage.local.get("cloudDictionary", function(data) {
    if (data.cloudDictionary && Object.keys(data.cloudDictionary).length > 0) {
        autoCorrectMap = data.cloudDictionary; // Substitui o arquivo local pelo da nuvem
    }
});

// Se o dicionário for atualizado enquanto a pessoa estiver usando, muda na hora
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local' && changes.cloudDictionary && changes.cloudDictionary.newValue) {
        autoCorrectMap = changes.cloudDictionary.newValue;
    }
});

let pendingSuggestion = null;

// Escuta a tecla TAB para aceitar a sugestão
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab' && pendingSuggestion) {
        e.preventDefault(); // Evita que o TAB pule para o próximo campo nativamente
        e.stopPropagation(); // Impede o WhatsApp Web de reagir ao TAB
        e.stopImmediatePropagation(); // Impede outros scripts de reagir
        applySuggestion();
    }
}, true);

document.addEventListener('keyup', function(e) {
    // Só verifica palavras após espaço, enter ou pontuações
    if (e.key !== ' ' && e.key !== 'Enter' && !/^[.,!?;&]$/.test(e.key)) {
        return;
    }

    const target = e.target;
    
    if (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search'))) {
        checkStandardInput(target);
    } 
    else if (target.isContentEditable) {
        checkContentEditable();
    }
}, true);

function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    let matrix = [];
    let i, j;
    for (i = 0; i <= b.length; i++) matrix[i] = [i];
    for (j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i-1) == a.charAt(j-1)) {
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}

function getReplacement(wordToReplace) {
    let lowerWord = wordToReplace.toLowerCase();
    let replacement = null;

    if (typeof autoCorrectMap !== 'undefined') {
        // 1. Busca exata no dicionário
        if (autoCorrectMap[lowerWord]) {
            replacement = autoCorrectMap[lowerWord];
        } 
        // 2. Busca por aproximação (Fuzzy Matching / Levenshtein)
        else if (lowerWord.length >= 4) {
            let correctWords = [...new Set(Object.values(autoCorrectMap))];
            
            // Se a palavra digitada já for uma palavra certa do nosso dicionário, ignora
            if (!correctWords.includes(lowerWord)) {
                let minDistance = Infinity;
                let closestWord = null;
                // Permite errar 1 letra para palavras curtas, e 2 letras para palavras maiores que 5
                let maxDistanceAllowed = lowerWord.length > 5 ? 2 : 1;
                
                for (let word of correctWords) {
                    let dist = levenshtein(lowerWord, word);
                    if (dist < minDistance && dist <= maxDistanceAllowed) {
                        minDistance = dist;
                        closestWord = word;
                    }
                }
                if (closestWord) {
                    replacement = closestWord;
                }
            }
        }
    }

    if (replacement) {
        if (wordToReplace[0] === wordToReplace[0].toUpperCase()) {
            replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
    }
    return null;
}

// Mostra um aviso flutuante na tela com a sugestão
function showSuggestionUI(wrongWord, correctWord) {
    let ui = document.getElementById('autocorrect-suggestion-ui');
    if (!ui) {
        ui = document.createElement('div');
        ui.id = 'autocorrect-suggestion-ui';
        ui.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #2c3e50;
            color: #fff;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: 'Segoe UI', sans-serif;
            font-size: 15px;
            z-index: 2147483647;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        document.body.appendChild(ui);
    }
    ui.innerHTML = `Sugestão: <strong>${correctWord}</strong> <span style="opacity:0.7; font-size:13px; margin-left:12px; border-left: 1px solid #555; padding-left: 12px;">Aperte <b>TAB</b> para corrigir</span>`;
    ui.style.display = 'block';
    ui.style.opacity = '1';

    // Esconde a sugestão após 6 segundos se o usuário ignorar
    clearTimeout(window.suggestionTimeout);
    window.suggestionTimeout = setTimeout(() => {
        if (ui) ui.style.opacity = '0';
        pendingSuggestion = null;
    }, 6000);
}

function hideSuggestionUI() {
    let ui = document.getElementById('autocorrect-suggestion-ui');
    if (ui) {
        ui.style.opacity = '0';
        pendingSuggestion = null;
    }
}

function checkStandardInput(target) {
    let cursorPosition = target.selectionStart;
    if (cursorPosition === null) return;

    let text = target.value;
    let lastChar = text.charAt(cursorPosition - 1);
    
    if (!/[\s.,!?;&\n\u00A0]/.test(lastChar)) return;

    let i = cursorPosition - 2;
    while (i >= 0 && !/[\s.,!?;&\n\u00A0]/.test(text.charAt(i))) {
        i--;
    }
    let wordStart = i + 1;
    let wordEnd = cursorPosition - 1;
    
    if (wordStart >= wordEnd) return;

    let wordToReplace = text.substring(wordStart, wordEnd);
    let replacement = getReplacement(wordToReplace);

    if (replacement) {
        pendingSuggestion = {
            type: 'standard',
            target: target,
            wordStart: wordStart,
            wordEnd: wordEnd,
            wordToReplace: wordToReplace,
            replacement: replacement
        };
        showSuggestionUI(wordToReplace, replacement);
    }
}

function checkContentEditable() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (!range.collapsed) return;

    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return;

    let cursorPosition = range.startOffset;
    let text = node.textContent;

    if (cursorPosition === 0) return;

    let lastChar = text.charAt(cursorPosition - 1);
    if (!/[\s.,!?;&\n\u00A0]/.test(lastChar)) return;

    let i = cursorPosition - 2;
    while (i >= 0 && !/[\s.,!?;&\n\u00A0]/.test(text.charAt(i))) {
        i--;
    }
    let wordStart = i + 1;
    let wordEnd = cursorPosition - 1;

    if (wordStart >= wordEnd) return;

    let wordToReplace = text.substring(wordStart, wordEnd);
    let replacement = getReplacement(wordToReplace);

    if (replacement) {
        pendingSuggestion = {
            type: 'contenteditable',
            node: node,
            wordStart: wordStart,
            wordEnd: wordEnd, // Pegamos até ANTES do espaço
            wordToReplace: wordToReplace,
            replacement: replacement
        };
        showSuggestionUI(wordToReplace, replacement);
    }
}

function applySuggestion() {
    if (!pendingSuggestion) return;
    
    let ps = pendingSuggestion;
    
    if (ps.type === 'standard') {
        let text = ps.target.value;
        // Verifica se a palavra ainda está no mesmo lugar
        if (text.substring(ps.wordStart, ps.wordEnd) === ps.wordToReplace) {
            let cursorPosition = ps.target.selectionStart;
            let newText = text.substring(0, ps.wordStart) + ps.replacement + text.substring(ps.wordEnd);
            ps.target.value = newText;
            
            // Ajusta o cursor
            let diff = ps.replacement.length - ps.wordToReplace.length;
            if (cursorPosition >= ps.wordEnd) {
                ps.target.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
            }
            ps.target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    } 
    else if (ps.type === 'contenteditable') {
        let text = ps.node.textContent;
        if (text.substring(ps.wordStart, ps.wordEnd) === ps.wordToReplace) {
            const selection = window.getSelection();
            
            // Cria um range selecionando A PALAVRA INTEIRA + O ESPAÇO para evitar dor de cabeça com o cursor
            // Assumimos que o cursor está logo após a palavra e o espaço
            const replaceRange = document.createRange();
            replaceRange.setStart(ps.node, ps.wordStart);
            // Pegamos 1 caractere a mais (o espaço/pontuação)
            replaceRange.setEnd(ps.node, ps.wordEnd + 1); 
            
            selection.removeAllRanges();
            selection.addRange(replaceRange);
            
            // Substitui a palavra errada + espaço pela palavra certa + espaço
            let charAfter = text.substring(ps.wordEnd, ps.wordEnd + 1);
            document.execCommand('insertText', false, ps.replacement + charAfter);
        }
    }
    
    hideSuggestionUI();
}
