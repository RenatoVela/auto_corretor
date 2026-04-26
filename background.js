// background.js - Responsável por manter a extensão conectada na internet

// Link direto para o nosso dicionário secreto no seu GitHub
const DICTIONARY_URL = "https://raw.githubusercontent.com/RenatoVela/auto_corretor/main/dictionary.json";

async function fetchDictionary() {
    try {
        let response = await fetch(DICTIONARY_URL);
        if (response.ok) {
            let text = await response.text();
            // Precisamos ter certeza que o texto lido é um JSON válido
            let json = JSON.parse(text);
            
            // Salva na memória interna da extensão
            chrome.storage.local.set({ "cloudDictionary": json });
            console.log("Dicionário na nuvem baixado com sucesso! Palavras:", Object.keys(json).length);
        }
    } catch (e) {
        console.error("Erro ao buscar o dicionário na nuvem. Usando versão offline.", e);
    }
}

// Quando a extensão é instalada no computador novo
chrome.runtime.onInstalled.addListener(() => {
    fetchDictionary();
    // Programa o Chrome para ir na internet checar se você mudou algo a cada 30 minutos
    chrome.alarms.create("fetchDictionaryAlarm", { periodInMinutes: 30 });
});

// Quando o navegador abre
chrome.runtime.onStartup.addListener(() => {
    fetchDictionary();
});

// Quando o alarme dispara
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "fetchDictionaryAlarm") {
        fetchDictionary();
    }
});
