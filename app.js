/*
 *	FILE			    :app.js
 *	PROJECT			  :JS Blackjack
 *	PROGRAMMER		:Jaydan Zabar
 *	FIRST VERSION	:2021-05-10
 *	DESCRIPTION		:The purpose of this file is to house the functionality for the game "blackjack". More specifically, it contains a betting system, the abilities
 *                    to hit, stand and double down, the functions to construct and randomize the deck of cards, and a function to adjust the value of an ace card in
 *                    a hand.
 */

// Returns a Promise that resolves after "ms" Milliseconds
const timer = (ms) => new Promise((res) => setTimeout(res, ms));
var playerWallet = 1000;
var userBet = 0;
var playerBust = false;
var dealerBust = false;
var playerBlackJack = false;
var dealerBlackJack = false;
var curPlayerValue = 0;
var curDealerValue = 0;
var curPlayerHand = new Array();
var curDealerHand = new Array();
var cardDeck = new Array();

// Buttons
const hitBtn = document.getElementById("hitBTN");
const standBtn = document.getElementById("standBTN");
const ddBtn = document.getElementById("ddBTN");

class card {
  constructor(cValue, cSuit, cWeight) {
    this.value = cValue;
    this.suit = cSuit;
    this.weight = cWeight;
  }
}

function createDeck() {
  // Wipe previous contents of the deck
  cardDeck.splice(0, cardDeck.length);

  for (i = 1; i < 5; i++) {
    // Set card suit
    var suit;

    if (i === 1) {
      suit = "C";
    } else if (i === 2) {
      suit = "D";
    } else if (i === 3) {
      suit = "H";
    } else {
      suit = "S";
    }

    for (j = 1; j < 14; j++) {
      // Set card value
      var value;
      var weight;

      if (j === 1) {
        value = "A";
        weight = 11;
      } else if (j >= 10) {
        if (j === 11) {
          value = "J";
        } else if (j === 12) {
          value = "Q";
        } else if (j === 13) {
          value = "K";
        } else {
          value = 10;
        }
        weight = 10;
      } else {
        value = j;
        weight = j;
      }

      // Create card
      var tempCard = new card(value, suit, weight);

      // Add card to deck
      cardDeck.push(tempCard);
    }
  }
}

function disableGameBTNs() {
  // Disable Buttons
  hitBtn.disabled = true;
  standBtn.disabled = true;
  ddBtn.disabled = true;
}

function enableGameBTNs() {
  // Enable Buttons
  hitBtn.disabled = false;
  standBtn.disabled = false;
  ddBtn.disabled = false;
}

function updateUIbalance() {
  var ui = document.getElementById("playerBalance");
  ui.innerHTML = `Total Balance: $${playerWallet}`;
}

function updateBetUI() {
  var ui = document.getElementById("betText");
  ui.innerHTML = `User Bet: $${userBet}`;
}

function updatePlayerValUI() {
  var ui = document.querySelector(".playerHandVal");
  ui.innerHTML = `${curPlayerValue}`;
}

function updateDealerValUI() {
  var ui = document.querySelector(".dealerHandVal");
  ui.innerHTML = `${curDealerValue}`;
}

function initializeUserBet() {
  //initialize card deck
  createDeck();

  // Add UI for user bet
  const rect = document.createElement("div");
  const text = document.createTextNode("Enter your bet:");
  const btnText = document.createTextNode("Submit");
  const submitBTN = document.createElement("button");
  var validateText = document.createElement("label");
  var userInput = document.createElement("input");

  // Disable game buttons
  disableGameBTNs();

  // Update UI balance
  updateUIbalance();

  // Update UI
  updateDealerValUI();
  updatePlayerValUI();

  // Append text and br to div
  rect.id = "rectangleUI";
  rect.appendChild(text);
  rect.classList.add("loadInAnimation", "uiText", "rectangle");

  // Append input to div
  userInput.type = "text";
  userInput.id = "betInput";
  rect.appendChild(userInput);

  // Append button to div
  submitBTN.id = "submitBetBTN";
  submitBTN.classList.add("btn");
  submitBTN.addEventListener("click", startGame);
  submitBTN.appendChild(btnText);
  rect.appendChild(submitBTN);

  // Append validate Line to div
  validateText.id = "validateResult";
  validateText.classList.add("errorText");
  rect.appendChild(validateText);

  document.getElementById("gameUI").appendChild(rect);
}

function removeBetUI() {
  // Remove Bet UI
  const rectangle = document.getElementById("rectangleUI");
  rectangle.classList.add("removeTransition");
  setTimeout(function () {
    rectangle.remove();
  }, 1000);
}

function removeResultUI() {
  // Remove result UI
  const result = document.getElementById("resultUI");
  result.remove();
}

function removeCards() {
  // Removes existing cards off screen
  const dealerNode = document.getElementById("dealerHand");
  const playerNode = document.getElementById("playerHand");

  // Clear dealer hand
  while (dealerNode.firstChild) {
    dealerNode.removeChild(dealerNode.lastChild);
  }

  // Clear player hand
  while (playerNode.firstChild) {
    playerNode.removeChild(playerNode.lastChild);
  }
}

function restartGame() {
  // Reset values
  playerBust = false;
  dealerBust = false;
  playerBlackJack = false;
  dealerBlackJack = false;
  curPlayerValue = 0;
  curDealerValue = 0;
  curPlayerHand.splice(0, curPlayerHand.length);
  curDealerHand.splice(0, curDealerHand.length);

  // Remove result UI
  removeResultUI();

  // Remove cards from screen
  removeCards();

  // Invoke initializeUserBet function
  initializeUserBet();
}

function shuffleDeck(deck) {
  var currentIndex = deck.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = deck[currentIndex];
    deck[currentIndex] = deck[randomIndex];
    deck[randomIndex] = temporaryValue;
  }

  return deck;
}

function turnDealerCard() {
  var dealerHand = document.getElementById("dealerHand");
  var dealerCard = dealerHand.querySelectorAll(".cardDealer");

  // Flip face down card after player's turn
  if (curDealerHand.length === 2) {
    var turnCard = curDealerHand[1];
    dealerCard[1].src = `./cards/${turnCard.value}${turnCard.suit}.png`;
  }
}

function deal(curPerson) {
  // Dealer
  var card = cardDeck.shift();
  var cardImg = document.createElement("img");
  cardImg.src = `./cards/${card.value}${card.suit}.png`;

  if (curPerson === "dealer") {
    // Deal card to dealer
    if (curDealerHand.length === 1) {
      // Turn next card face down
      cardImg.src = `./cards/purple_back.png`;
    }

    var dealerHand = document.getElementById("dealerHand");
    var cardCheck = dealerHand.querySelectorAll(".cardDealer");

    // Flip face down card after player's turn
    turnDealerCard();

    if (cardCheck.length != 0) {
      // Another card exists in hand
      // Adjust position of card
      //var prevCardPos = cardCheck[cardCheck.length - 1].getBoundingClientRect();
      //var adjustPos = prevCardPos.left + 25;
      //cardImg.style.left = `${adjustPos}px`;
      var adjustPos = 51 + 2 * cardCheck.length;
      cardImg.style.left = `${adjustPos}%`;

      // Adjust animation
      cardImg.animate(
        [
          { left: "95%", opacity: "0" },
          { left: `${adjustPos}%`, opacity: "1" },
        ],
        {
          duration: 2000,
          iterations: 1,
          easing: "ease-out",
        }
      );
    } else {
      // Adjust animation
      const initialPos = document.querySelector(".cardOutlineDealer");
      const cardPosition = initialPos.getBoundingClientRect();
      cardImg.animate(
        [
          { left: "95%", opacity: "0" },
          { left: "51%", opacity: "1" },
        ],
        {
          duration: 2000,
          iterations: 1,
          easing: "ease-out",
        }
      );
    }
    cardImg.classList.add("cardDealer");

    document.getElementById("dealerHand").appendChild(cardImg);

    // Add card to dealer hand
    curDealerHand.push(card);
    curDealerValue += card.weight;
    if (curDealerHand.length != 2) {
      updateDealerValUI();
    }
  } else {
    // Deal card to player
    var playerHand = document.getElementById("playerHand");
    var cardCheck = playerHand.querySelectorAll(".cardPlayer");
    if (cardCheck.length != 0) {
      // Another card exists in hand
      // Adjust position of card
      //var prevCardPos = cardCheck[cardCheck.length - 1].getBoundingClientRect();
      //var adjustPos = prevCardPos.left + 25;
      var adjustPos = 51 + 2 * cardCheck.length;
      cardImg.style.left = `${adjustPos}%`;

      // Adjust animation
      cardImg.animate(
        [
          { left: "95%", opacity: "0" },
          { left: `${adjustPos}%`, opacity: "1" },
        ],
        {
          duration: 2000,
          iterations: 1,
          easing: "ease-out",
        }
      );
    } else {
      // Adjust animation
      cardImg.animate(
        [
          { left: "95%", opacity: "0" },
          { left: "51%", opacity: "1" },
        ],
        {
          duration: 2000,
          iterations: 1,
          easing: "ease-out",
        }
      );
    }

    cardImg.classList.add("cardPlayer");
    document.getElementById("playerHand").appendChild(cardImg);

    // Add card to player hand
    curPlayerHand.push(card);
    curPlayerValue += card.weight;
    updatePlayerValUI();
  }
}

function checkBlackJack() {
  var result = "";

  if (curPlayerValue === 21 && curDealerValue != 21) {
    result = "You have blackjack! You've won.";
    playerWallet += userBet * 2.5;
    playerBlackJack = true;
  } else if (curDealerValue === 21 && curPlayerValue != 21) {
    result = "Dealer has blackjack! Dealer wins.";
    dealerBlackJack = true;
  } else if (curDealerValue === 21 && curPlayerValue === 21) {
    result = "It's a Push! You've tied with the dealer.";
  } else {
    return;
  }

  // Disable game buttons
  disableGameBTNs();

  // Add UI for end result
  const rect = document.createElement("div");
  const btnText = document.createTextNode("New Game");
  const restartGameBTN = document.createElement("button");

  // Create text node for result
  const resultText = document.createTextNode(result);

  // Append text and br to div
  rect.id = "resultUI";
  rect.appendChild(resultText);
  rect.classList.add("loadInAnimation", "uiText", "rectangle");

  // Append button to div
  restartGameBTN.id = "restartGameBTN";
  restartGameBTN.classList.add("btn");
  restartGameBTN.addEventListener("click", restartGame);
  restartGameBTN.appendChild(btnText);
  rect.appendChild(restartGameBTN);

  updateUIbalance();
  userBet = 0;
  updateBetUI();
  turnDealerCard();

  document.getElementById("gameUI").appendChild(rect);
}

function validateBetInput() {
  var betCheck = false;
  var betInput = document.getElementById("betInput").value;
  if (betInput.length === 0) {
    // input field is blank
    return betCheck;
  } else {
    if (!isNaN(betInput)) {
      // input doesn't contains letters
      betCheck = true;
    }
  }
  return betCheck;
}

function playerTurnUI() {
  // Add UI for announcement
  const rect = document.createElement("div");
  const announcementText = document.createTextNode("It is now your turn!");

  rect.appendChild(announcementText);
  rect.classList.add("loadInAnimation", "uiText", "rectangle");

  document.getElementById("gameUI").appendChild(rect);

  setTimeout(function () {
    rect.classList.add("removeTransition");
  }, 1700);
  setTimeout(function () {
    rect.remove();
  }, 2600);
}

function startGame() {
  var result = document.getElementById("validateResult");
  var bet = document.getElementById("betInput");
  var submitBTN = document.getElementById("submitBetBTN");
  result.innerHTML = "";
  bet.style.border = "1px solid black";

  // Check bet input
  if (validateBetInput() === false) {
    result.innerHTML = "Bet cannot contain letters or be blank.";
    bet.style.border = "2px solid #ff4a4a";
    return;
  }

  // Check if bet isn't greater than user's wallet
  if (bet.value > playerWallet) {
    result.innerHTML = "Bet cannot be greater than total balance.";
    bet.style.border = "2px solid #ff4a4a";
    return;
  }

  // Disable button
  submitBTN.disabled = true;

  userBet = bet.value;
  playerWallet -= bet.value;
  updateUIbalance();
  updateBetUI();

  shuffleDeck(cardDeck);
  curPlayerValue = 0;
  curDealerValue = 0;

  // Now deal cards to the dealer and player

  deal("dealer");
  setTimeout(function () {
    deal("player");
  }, 2000);
  setTimeout(function () {
    deal("dealer");
  }, 4000);
  setTimeout(function () {
    deal("player");
  }, 6000);
  setTimeout(function () {
    checkHand("dealer");
  }, 8000);
  setTimeout(function () {
    checkHand("player");
  }, 8000);
  setTimeout(function () {
    checkBlackJack();
    if (playerBlackJack != true && dealerBlackJack != true) {
      playerTurnUI();
    }
  }, 8100);
  //   setTimeout(function () {

  //   }, 8150);
  setTimeout(function () {
    enableGameBTNs();
  }, 11000);

  // Remove the bet UI
  removeBetUI();
}

function checkHand(curPerson) {
  var curHand;
  var curValue;
  var aceCount = 0;
  var rawHandVal = 0;

  if (curPerson === "player") {
    curHand = curPlayerHand;
    curValue = curPlayerValue;
  } else {
    curHand = curDealerHand;
    curValue = curDealerValue;
  }

  // Check total hand value
  if (curValue > 21) {
    // Check if ace exists in hand
    for (i = 0; i < curHand.length; i++) {
      rawHandVal += curHand[i].weight;
      if (curHand[i].value === "A") {
        aceCount++;
      }
    }

    for (j = 0; j < aceCount; j++) {
      rawHandVal -= 10;
    }

    if (aceCount > 0) {
      // Remove 11 from total value
      // Add 1
      // Essentially, minus value by 10
      if (curValue > rawHandVal) {
        curValue = curValue - 10;
      }

      if (curPerson === "player") {
        curPlayerValue = curValue;
        updatePlayerValUI();
      } else {
        curDealerValue = curValue;
        updateDealerValUI();
      }
    }

    // Check again if the value of the hand is still greater than 21
    if (curValue > 21) {
      // Person has busted
      if (curPerson === "player") {
        playerBust = true;
      } else {
        dealerBust = true;
      }
    }
  }
}

async function dealerHit() {
  // Check if the dealer is at or above 17 in their hand
  if (curDealerValue >= 17) {
    turnDealerCard();
    updateDealerValUI();
    return;
  }

  while (curDealerValue < 17) {
    // Deal cards to the dealer until their total value is 17 or greater
    if (dealerBust === true) {
      break;
    } else {
      deal("dealer");
      checkHand("dealer");
      await timer(2000);
    }
  }
}

async function playerHit() {
  // Disable button
  disableGameBTNs();

  // Deal card
  deal("player");
  await timer(2000);

  // Check player hand to see if they have bust
  checkHand("player");
  if (playerBust === true) {
    determineWinner();
  } else if (curPlayerValue === 21) {
    playerStand();
    return;
  }

  enableGameBTNs();

  // Disable dd button
  ddBtn.disabled = false;
}

function determineWinner() {
  var result = "";

  // Add UI for end result
  const rect = document.createElement("div");
  const btnText = document.createTextNode("New Game");
  const restartGameBTN = document.createElement("button");

  // Determine who has the highest hand
  if (
    curPlayerValue > curDealerValue &&
    playerBust === false &&
    dealerBust === false
  ) {
    // Player has highest hand
    result = "You've Won! You have the highest hand.";
    playerWallet += userBet * 2;
  } else if (
    curDealerValue > curPlayerValue &&
    dealerBust === false &&
    playerBust === false
  ) {
    // Dealer has highest hand
    result = "Dealer wins with the highest hand.";
  } else if (playerBust === true && dealerBust === false) {
    // Player bust and dealer wins
    result = "You've bust! Dealer wins.";
  } else if (dealerBust === true && playerBust === false) {
    // Dealer bust and player wins
    result = "You've Won! Dealer has busted.";
    playerWallet += userBet * 2;
  } else if (curPlayerValue === curDealerValue) {
    // Hands are tied. It's a push
    result = "It's a Push! You've tied with the dealer.";
    playerWallet = +playerWallet + +userBet;
  } else {
    result = "Undefined Result.";
  }

  // Create text node for result
  const resultText = document.createTextNode(result);

  // Append text and br to div
  rect.id = "resultUI";
  rect.appendChild(resultText);
  rect.classList.add("loadInAnimation", "uiText", "rectangle");

  // Append button to div
  restartGameBTN.id = "restartGameBTN";
  restartGameBTN.classList.add("btn");
  restartGameBTN.addEventListener("click", restartGame);
  restartGameBTN.appendChild(btnText);
  rect.appendChild(restartGameBTN);

  updateUIbalance();
  userBet = 0;
  updateBetUI();

  document.getElementById("gameUI").appendChild(rect);
}

function playerStand() {
  // Disable all buttons
  disableGameBTNs();

  // Now deal cards to dealer if he has less than 17 in his hand
  // Then determine who has the higher hand
  dealerHit().then(determineWinner);
}

async function playerDoubleDown() {
  // Disable all buttons
  disableGameBTNs();

  // Deduct extra bet from total balance
  playerWallet -= userBet;

  // Double user bet
  userBet = userBet * 2;

  // Update UI
  updateUIbalance();
  updateBetUI();

  // Deal one more card to player
  deal("player");
  await timer(2000);

  // Check player hand to see if they have bust
  checkHand("player");
  if (playerBust === true) {
    determineWinner();
  } else {
    // Now deal cards to dealer if he has less than 17 in his hand
    // Then determine who has the higher hand
    dealerHit().then(determineWinner);
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", initializeUserBet);

// Button listeners
hitBtn.addEventListener("click", playerHit);
standBtn.addEventListener("click", playerStand);
ddBtn.addEventListener("click", playerDoubleDown);
