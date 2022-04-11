/*
*	FILE			:main.js
*	PROJECT			:JS Blackjack
*	PROGRAMMER		:Jaydan Zabar
*	FIRST VERSION	:2021-05-10
*	DESCRIPTION		:The purpose of this file is to house the functionality for two buttons on the home page. One is to launch the blackjack game
*                    and the other is to teach the player on how to play blackjack.
*/

const startGame = document.getElementById("startBTN");
const tutorial = document.getElementById("tutorialBTN");

startGame.addEventListener("click", function(){
    window.location.href = "./game.html";
});

tutorial.addEventListener("click",function(){
    window.location.href = "./tutorial.html";
});