// ===== Starter Decks =====
const starterDecks = {
    "cerulean": ["sea", "sadness", "fathom", "cyclical", "azure", "tranquil", "glass", "translucent", "depths"],
    "ashes": ["despair", "fade", "shadow", "dark", "grim", "grief", "mortal", "grey", "bone"],
    "opal": ["light", "dazzle", "prism", "euphoria", "shimmer", "fae", "gleam", "wink", "angel"],
    "garnet": ["angst", "fire", "fury", "knife", "daemon", "teeth", "love", "burn", "carnal"],
    "lace": ["ethereal", "intricate", "eyelash", "delicacy", "graze", "sheer", "entangle", "innocence", "repetition"],
    "viridian": ["oxygen", "moss", "magic", "serpentine", "thrum", "expanse", "wood", "again", "root"],
};

let hand = [];
let discard = [];
let cueIndex = 0;
let selectedCards = [];
let currentAction = null;

const cues = [
  "Add a word.",
  "Add a word.",
  "Add a word.",
  "Discard a card.",
  "Discard a card.",
  "Discard a card.",
  "Destroy a card.",
  "Destroy a card.",
  "Destroy a card.",
  "Return a card from the discard pile to your hand.",
  "Return a card from the discard pile to your hand.",
  "Add a word you love.",
  "Add a word you hate.",
  "Add a word that speaks to you.",
  "Add a word that reminds you of heaven.",
  "Add a word that reminds you of hell.",
  "Add a word that you see.",
  "Add the last word you said aloud.",
  "Add the last word you heard.",
  "Add a word that doesn't exist yet.",
  "Add a metaphor.",
  "Add a word that starts with the same letter as your name.",
  "Pick your favorite two cards. Discard one.",
  "Pick your least favorite card. Make it your favorite.", 
  "Pick a card. Change it to another tongue.",
  "Pick a card. Change its type (e.g. noun to adjective).",
  "Pick a card. Make it past tense.",
  "Pick a card. Make it plural.",
  "Pick a card. Make it past tense.",
  "Pick a card. Replace it with an onomotopoeia.",
  "Pick a card. Replace it with a metaphor.",
  "Pick a card. Replace it with its sister.",
  "Pick a card. Replace it with its mirror.",
  "Pick a card. Replace it with its shadow.",
  "Pick a card. Replace it with its polar opposite.",
  "Pick a card. Replace it with its dream.",
  "Pick a card. Replace it with its fear.",
  "Pick a card. Replace it with the first other word that comes to you upon seeing it.",
  "Pick a card. Replace the card on the left with a new word starting with the same letter.",
];

// ===== DOM Elements =====
const cueEl = document.getElementById("cue");
const starterEl = document.getElementById("starter-decks");
const starterScreen = document.getElementById("starter-screen");
const gameUI = document.getElementById("game-ui");
const handEl = document.getElementById("hand");
const discardEl = document.getElementById("discard");
const nextTurnBtn = document.getElementById("next-turn");
const addCardBtn = document.getElementById("add-card");
const confirmBtn = document.getElementById("confirm-action");

// Modal
const modal = document.getElementById("modal");
const modalInput = document.getElementById("modal-input");
const modalConfirm = document.getElementById("modal-confirm");
const modalCancel = document.getElementById("modal-cancel");

// ===== Rendering =====
function render() {
  renderPile(hand, handEl, "hand");
  renderPile(discard, discardEl, "discard");
}

function renderPile(pile, container, pileName) {
  container.innerHTML = "";
  pile.forEach((word, idx) => {
    const card = document.createElement("div");
    card.className = `card ${selectedDeckName}`;
    if (selectedCards.some(sel => sel.pile === pileName && sel.idx === idx)) {
      card.classList.add("selected");
    }

    const span = document.createElement("span");
    span.textContent = word;
    card.appendChild(span);

    // double click to edit
    card.ondblclick = () => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = word;
      card.innerHTML = ""; // clear
      card.appendChild(input);
      input.focus();

      input.onblur = () => {
        pile[idx] = input.value.trim() || word;
        render(); // re-render after saving
      };

      input.onkeydown = (e) => {
        if (e.key === "Enter") input.blur();
      };
    };

    // selection still works on single click
    card.onclick = (e) => {
      // prevent selection toggle if double clicking (editing)
      if (e.detail === 1 && !card.querySelector("input")) {
        toggleSelect(pileName, idx);
        render();
      }
    };

    container.appendChild(card);
  });
}

function setCue(text) {
  cueEl.textContent = text;
}

// ===== Game Logic =====
function chooseStarter(deckName, deck) {
  selectedDeckName = deckName;
  hand = [...deck];
  starterScreen.style.display = "none";
  gameUI.style.display = "block";
  cueIndex = -1; // so first call to nextTurn starts at 0
  nextTurn(); // start immediately
  
  // update selected deck
  const headerEl = document.getElementById("deck-header");
  headerEl.textContent = `${deckName} deck`;
}

function toggleSelect(pile, idx) {
  const action = currentAction;
  if (!action) return;

  if (action === "Discard a card." && pile === "hand") {
    toggleSelection(pile, idx, 1);
  } else if (action === "Return a card from the discard pile to your hand." && pile === "discard") {
    toggleSelection(pile, idx, 1);
  } else if (action === "Destroy a card." && pile === "hand") {
    toggleSelection(pile, idx, 1);
  } else if (action === "Pick your favorite two cards. Discard one." && pile === "hand") {
    toggleSelection(pile, idx, 1);
  }
  render();
}

function toggleSelection(pile, idx, maxSelect) {
  const found = selectedCards.findIndex(sel => sel.pile === pile && sel.idx === idx);
  if (found >= 0) {
    selectedCards.splice(found, 1);
  } else {
    if (selectedCards.length < maxSelect) {
      selectedCards.push({ pile, idx });
    }
  }
}

function executeAction() {
  const action = currentAction;
  if (!action) return;

  if (action === "Discard a card.") {
    selectedCards.forEach(sel => {
      discard.push(hand.splice(sel.idx, 1)[0]);
    });
  } else if (action === "Return a card from the discard pile to your hand.") {
    selectedCards.forEach(sel => {
      hand.push(discard.splice(sel.idx, 1)[0]);
    });
  } else if (action === "Destroy a card.") {
    selectedCards.forEach(sel => {
      hand.splice(sel.idx, 1);
    });
  } else if (action === "Pick your favorite two cards. Discard one.") {
    selectedCards.forEach(sel => {
      discard.push(hand.splice(sel.idx, 1)[0]);
    });
  }


  selectedCards = [];
  currentAction = null;
  render();
}

function nextTurn() {
  cueIndex++;
  const action = cues[Math.floor(Math.random() * cues.length)];
  setCue(action);
  currentAction = action;
  selectedCards = [];


  render();
}

// ===== Custom Card Modal =====
function openModal() {
  modal.style.display = "flex";
  modalInput.value = "";
  modalInput.focus();
  modalInput.setAttribute('autocomplete', 'off');
}

function closeModal() {
  modal.style.display = "none";
}

modalConfirm.onclick = () => {
  const word = modalInput.value.trim();
  if (word) {
    hand.push(word);
    render();
  }
  closeModal();
};
modalCancel.onclick = closeModal;

// ===== Init =====
function init() {
  let selectedDeckName = ""

  // show starter deck choices
  for (const [key, value] of Object.entries(starterDecks)) {
    const btn = document.createElement("button");
    btn.className = `card ${key}`;
    btn.textContent = key;
    btn.onclick = () => chooseStarter(key, value);
    starterEl.appendChild(btn);
  };
}

nextTurnBtn.onclick = nextTurn;
addCardBtn.onclick = openModal;
confirmBtn.onclick = executeAction;

init();