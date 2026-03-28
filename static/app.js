// Age verification
const ageModal = document.getElementById('age-modal');
const ageCheckbox = document.getElementById('age-checkbox');
const ageConfirmBtn = document.getElementById('age-confirm-btn');
const ageDeclineBtn = document.getElementById('age-decline-btn');
const mainContent = document.getElementById('main-content');

if (localStorage.getItem('ageVerified') === 'true') {
    ageModal.style.display = 'none';
    mainContent.style.display = 'block';
}

ageCheckbox.addEventListener('change', () => {
    ageConfirmBtn.disabled = !ageCheckbox.checked;
});

ageConfirmBtn.addEventListener('click', () => {
    localStorage.setItem('ageVerified', 'true');
    ageModal.style.display = 'none';
    mainContent.style.display = 'block';
});

ageDeclineBtn.addEventListener('click', () => {
    window.location.href = 'https://www.google.com';
});

// App State
let currentScenario = '';
let currentSuggestions = [];
let currentApprovedSuggestions = []; // Store approved suggestions for display
let currentCards = [];
let currentCardIndex = 0;

// Elements
const stepPrompt = document.getElementById('step-prompt');
const stepSuggestions = document.getElementById('step-suggestions');
const stepCards = document.getElementById('step-cards');
const loadingOverlay = document.getElementById('loading-overlay');

const scenarioInput = document.getElementById('scenario');
const getSuggestionsBtn = document.getElementById('getSuggestionsBtn');
const suggestionsContainer = document.getElementById('suggestions-container');
const backToPromptBtn = document.getElementById('backToPromptBtn');
const generateGameBtn = document.getElementById('generateGameBtn');

const cardDeck = document.getElementById('card-deck');
const currentCardSpan = document.getElementById('current-card');
const totalCardsSpan = document.getElementById('total-cards');
const prevCardBtn = document.getElementById('prevCardBtn');
const nextCardBtn = document.getElementById('nextCardBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const newGameBtn = document.getElementById('newGameBtn');
const backToSuggestionsBtn = document.getElementById('backToSuggestionsBtn');
const menuToggleBtn = document.getElementById('menuToggleBtn');
const exportMenu = document.getElementById('export-menu');
const saveCardsJsonBtn = document.getElementById('saveCardsJsonBtn');
const saveCardsXmlBtn = document.getElementById('saveCardsXmlBtn');
const loadCardsFile = document.getElementById('loadCardsFile');

// Navigation
function showStep(step) {
    [stepPrompt, stepSuggestions, stepCards].forEach(s => s.classList.remove('active'));
    step.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLoading(show) {
    loadingOverlay.classList.toggle('hidden', !show);
}

// Step 1: Get Suggestions
getSuggestionsBtn.addEventListener('click', async () => {
    const scenario = scenarioInput.value.trim();
    if (!scenario) {
        alert('Bitte beschreibe zuerst deine Spielidee!');
        return;
    }

    currentScenario = scenario;
    showLoading(true);

    try {
        const response = await fetch('/generate_suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenario })
        });

        const data = await response.json();
        if (data.error) {
            alert('Fehler: ' + data.error);
            return;
        }

        let suggestions = JSON.parse(data.suggestions);
        currentSuggestions = suggestions;
        renderSuggestions(suggestions);
        showStep(stepSuggestions);
    } catch (error) {
        alert('Fehler: ' + error.message);
    } finally {
        showLoading(false);
    }
});

// Render Suggestions
function renderSuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';

    suggestions.forEach((sug, index) => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
            <div class="suggestion-header">
                <div class="suggestion-title">${sug.title}</div>
            </div>
            <div class="suggestion-description">${sug.description}</div>
            <input type="text" class="suggestion-input" data-index="${index}" value="${sug.default}" placeholder="Enter your value...">
            <label class="approve-checkbox">
                <input type="checkbox" data-index="${index}" checked>
                <span>Einbeziehen</span>
            </label>
        `;
        suggestionsContainer.appendChild(div);
    });
}

backToPromptBtn.addEventListener('click', () => showStep(stepPrompt));

// Generate Cards
generateGameBtn.addEventListener('click', async () => {
    const checkboxes = suggestionsContainer.querySelectorAll('input[type="checkbox"]');
    const inputs = suggestionsContainer.querySelectorAll('.suggestion-input');

    const approvedSuggestions = [];
    checkboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            approvedSuggestions.push({
                title: currentSuggestions[index].title,
                value: inputs[index].value
            });
        }
    });

    // Save approved suggestions for later display
    currentApprovedSuggestions = approvedSuggestions;

    showLoading(true);

    try {
        const response = await fetch('/generate_game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scenario: currentScenario,
                suggestions: approvedSuggestions
            })
        });

        const data = await response.json();
        if (data.error) {
            alert('Fehler: ' + data.error);
            return;
        }

        currentCards = JSON.parse(data.cards);
        currentCardIndex = 0;
        renderCards();
        // Enable email button now that cards exist
        sendEmailBtn.disabled = false;
        displayGameRules(); // Display rules when cards are shown
        showStep(stepCards);
    } catch (error) {
        alert('Fehler: ' + error.message);
    } finally {
        showLoading(false);
    }
});

// Render Cards
function renderCards() {
    if (currentCards.length === 0) return;

    totalCardsSpan.textContent = currentCards.length;
    showCard(currentCardIndex);
}

function showCard(index) {
    if (index < 0 || index >= currentCards.length) return;

    currentCardIndex = index;
    currentCardSpan.textContent = index + 1;

    const card = currentCards[index];
    const typeColors = {
        'Task': '#ff6b35',
        'Dare': '#f7931e',
        'Talk': '#4ecdc4',
        'Question': '#95e1d3'
    };

    cardDeck.innerHTML = `
        <div class="game-card" style="border-color: ${typeColors[card.type] || '#ff6b35'}">
            <div class="card-type" style="background: ${typeColors[card.type] || '#ff6b35'}">${card.type}</div>
            <h2 class="card-title">${card.title}</h2>
            <p class="card-content">${card.content}</p>
            <div class="card-duration">⏱️ ${card.duration}</div>
        </div>
    `;

    prevCardBtn.disabled = index === 0;
    nextCardBtn.disabled = index === currentCards.length - 1;
}

prevCardBtn.addEventListener('click', () => showCard(currentCardIndex - 1));
nextCardBtn.addEventListener('click', () => showCard(currentCardIndex + 1));

// Shuffle Cards
shuffleBtn.addEventListener('click', () => {
    currentCards = currentCards.sort(() => Math.random() - 0.5);
    currentCardIndex = 0;
    showCard(0);
});

// New Game
newGameBtn.addEventListener('click', () => {
    scenarioInput.value = '';
    currentScenario = '';
    currentSuggestions = [];
    currentCards = [];
    // Disable email button when starting a new game
    sendEmailBtn.disabled = true;
    showStep(stepPrompt);
});

backToSuggestionsBtn.addEventListener('click', () => showStep(stepSuggestions));

// Menu Toggle
menuToggleBtn.addEventListener('click', () => {
    exportMenu.classList.toggle('hidden');
});

// Email Modal Elements
const emailModal = document.getElementById('email-modal');
const sendEmailBtn = document.getElementById('sendEmailBtn');
sendEmailBtn.disabled = true; // initially disabled until cards are generated
const cancelEmailBtn = document.getElementById('cancel-email-btn');
const sendEmailConfirmBtn = document.getElementById('send-email-confirm-btn');
const partnerEmailInput = document.getElementById('partner-email');

// Email Modal Logic
sendEmailBtn.addEventListener('click', () => {
    emailModal.classList.remove('hidden');
    exportMenu.classList.add('hidden');
});

cancelEmailBtn.addEventListener('click', () => {
    emailModal.classList.add('hidden');
});

sendEmailConfirmBtn.addEventListener('click', () => {
    const email = partnerEmailInput.value.trim();
    if (!email) {
        alert('Bitte gib eine gültige E-Mail-Adresse ein.');
        return;
    }

    if (currentCards.length === 0) {
        alert('Keine Karten zum Senden vorhanden.');
        return;
    }

    // Create email body with cards
    const subject = `Kinky Foxes: ${currentScenario.substring(0, 50)}...`;
    let body = `Hallo!\n\nHier sind die Karten für unser Spiel:\n\n📋 ${currentScenario}\n\n`;

    currentCards.forEach((card, index) => {
        body += `\n━━━━━━━━━━━━━━━━\n`;
        body += `${index + 1}. ${card.title} [${card.type}]\n`;
        body += `${card.content}\n`;
        body += `⏱️ ${card.duration}\n`;
    });

    body += `\n━━━━━━━━━━━━━━━━\n`;
    body += `\nGeneriert mit 🦊 Kinky Foxes\n`;

    // Create mailto link
    const mailtoLink = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open default mail app
    window.location.href = mailtoLink;

    // Close modal and clear input
    emailModal.classList.add('hidden');
    partnerEmailInput.value = '';
});

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === emailModal) {
        emailModal.classList.add('hidden');
    }
    if (event.target === ageModal) {
        // Do not close age modal on outside click if not verified
        if (localStorage.getItem('ageVerified') === 'true') {
            // ageModal.style.display = 'none'; // Actually age modal should stay closed
        }
    }
});

// Export Functions
saveCardsJsonBtn.addEventListener('click', () => {
    if (currentCards.length === 0) return;
    const gameData = {
        prompt: currentScenario,
        cards: currentCards,
        timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(gameData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kinky-foxes-cards-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    exportMenu.classList.add('hidden');
});

saveCardsXmlBtn.addEventListener('click', () => {
    if (currentCards.length === 0) return;
    let cardsXml = '';
    currentCards.forEach(card => {
        cardsXml += `
    <card>
        <title><![CDATA[${card.title}]]></title>
        <type>${card.type}</type>
        <content><![CDATA[${card.content}]]></content>
        <duration>${card.duration}</duration>
    </card>`;
    });

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<game>
    <prompt><![CDATA[${currentScenario}]]></prompt>
    <timestamp>${new Date().toISOString()}</timestamp>${cardsXml}
</game>`;
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kinky-foxes-cards-${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    exportMenu.classList.add('hidden');
});

loadCardsFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const content = event.target.result;

            if (file.name.endsWith('.json')) {
                const gameData = JSON.parse(content);
                currentScenario = gameData.prompt;
                currentCards = gameData.cards;
            } else if (file.name.endsWith('.xml')) {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(content, 'text/xml');
                currentScenario = xmlDoc.querySelector('prompt').textContent;

                const cardNodes = xmlDoc.querySelectorAll('card');
                currentCards = Array.from(cardNodes).map(node => ({
                    title: node.querySelector('title').textContent,
                    type: node.querySelector('type').textContent,
                    content: node.querySelector('content').textContent,
                    duration: node.querySelector('duration').textContent
                }));
            }

            currentCardIndex = 0;
            renderCards();
            showStep(stepCards);
            exportMenu.classList.add('hidden');
            // Enable email button now that cards are loaded
            sendEmailBtn.disabled = false;

            // Reset rules display
            toggleRulesBtn.textContent = ' Spielregeln anzeigen';
            const rulesContent = document.getElementById('rules-content');
            if (rulesContent) rulesContent.classList.add('hidden');

        } catch (error) {
            alert('Fehler beim Laden: ' + error.message);
        }
    };
    reader.readAsText(file);
});

toggleRulesBtn.addEventListener('click', () => {
    const rulesContent = document.getElementById('rules-content');
    const isHidden = rulesContent.classList.contains('hidden');
    if (isHidden) {
        rulesContent.classList.remove('hidden');
        toggleRulesBtn.textContent = ' Spielregeln ausblenden';
        if (typeof displayGameRules === 'function') {
            displayGameRules();
        }
    } else {
        rulesContent.classList.add('hidden');
        toggleRulesBtn.textContent = ' Spielregeln anzeigen';
    }
});

function displayGameRules() {
    const displayScenario = document.getElementById('display-scenario');
    const displaySuggestions = document.getElementById('display-suggestions');

    // Display scenario
    if (displayScenario) {
        displayScenario.textContent = currentScenario;
    }

    // Display approved suggestions
    if (displaySuggestions) {
        displaySuggestions.innerHTML = '';
        if (currentApprovedSuggestions.length > 0) {
            const header = document.createElement('strong');
            header.style.color = 'var(--secondary)';
            header.textContent = 'Einstellungen:';
            displaySuggestions.appendChild(header);
            currentApprovedSuggestions.forEach(sug => {
                const ruleItem = document.createElement('div');
                ruleItem.className = 'rule-item';
                ruleItem.innerHTML = `<strong>${sug.title}</strong>: <span>${sug.value}</span>`;
                displaySuggestions.appendChild(ruleItem);
            });
        }
    }
}
