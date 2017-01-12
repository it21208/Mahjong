/* ------------------- GLOBAL VARIABLES ---------------------- */
var gMahjongGame;
var isGamePlaying;

/* ------------------- GLOBAL CONSTANTS ---------------------- */
var conFREECELL_BGCOLOR = "lightblue";
var conREGULARCELL_BGCOLOR = "transparent";
var conSELECTEDCELL_BGCOLOR = "green";
var conBUTTON_STARTGAME = "Start Game";
var conBUTTON_STOPGAME = "Stop Game";
var conDURATION_EASYLEVEL = 3;
var conDURATION_MEDIUMLEVEL = 2;
var conDURATION_HARDLEVEL = 1;
var conImageNames   = ["MJs1.png", "MJs2.png", "MJs3.png",
							  "MJs4.png", "MJs5.png", "MJs6.png",
							  "MJs7.png", "MJs8.png", "MJs9.png",
							  "MJt1.png", "MJt2.png", "MJt3.png",
							  "MJt4.png", "MJt5.png", "MJt6.png",
							  "MJt7.png", "MJt8.png", "MJt9.png",
							  "MJw1.png", "MJw2.png", "MJw3.png",
							  "MJw4.png", "MJw5.png", "MJw6.png",
							  "MJw7.png", "MJw8.png", "MJw9.png"];	

/* ------------------- Object CELL ---------------------- */
function CELL(row, col) {
	this.row = row;
	this.col = col;
}

/* ------------------- Object SYMBOLCOPY ---------------------- 
	It represents the pair of one symbol along with the value
	of the tiles that have this symbol */
function SYMBOLCOPY(symbol, imgsrc, copies) {
	this.symbol = symbol;
	this.imgsrc = imgsrc;
	this.copies = copies;
}

SYMBOLCOPY.prototype.imgtag = function () {
	var tag = "<img src=\"" + this.imgsrc + "\"" +
				 " alt=\"" + this.symbol + "\">";
	return tag;
}

/* --------------  Object MAHJONGGAME ------------------ */
function MAHJONGGAME(boardsize, level, symbolsUsed, copiespersymbol)
{
	this.boardsize = boardsize;
	this.level = level;
	this.copiespersymbol = copiespersymbol;
	this.firstselectedcell = "";
	// assign other calculated properties for easy access
	// 	level --> gameduration
	this.gameduration = gameDuration(level);
	// 	symbolsUsed --> symbolcopies
	this.symbolcopies = createSymbolCopiesArray(symbolsUsed, copiespersymbol);
	// initialize game statistics
	this.endtime = new Date((new Date()).getTime() + 60000*this.gameduration);
	this.correctselections = 0;
	this.wrongselections = 0;
	// initialize game timer
	this.timer = setInterval(function () {mahjongTimer()}, 1000);
}

/*  increments correct answers by one and display it */
MAHJONGGAME.prototype.incrementCorrectSelections = function() {
	this.correctselections++;
	document.getElementById("pCorrectAnswers").innerHTML = this.correctselections;
	/* if correct selections are equal to boardsize^2 / 2 
	   the user completed the game!!! */
	if (this.correctselections == (Math.pow(this.boardsize, 2)/2)) {
		// stop timer
		clearInterval(this.timer);
		// enable user controls
		userControlsDisabled(false);
		// change button caption to Start Game
		document.getElementById("btnStartNewGame").value = conBUTTON_STARTGAME;
		// reset background color for all board cells
		this.resetboardbgcolor();
		// alert user
		var alertMsg = "GAME OVER\n\nYou have won!\n\nCorrect answers : " +
						this.correctanswerspercentage() + 
						"%\nWrong answers : " + 
						this.wronganswerspercentage() + "%";
		alert(alertMsg);
		// disable table
		document.getElementById("tblMahjong").disabled = true;
		// toggle isGamePlaying
		isGamePlaying = !isGamePlaying;
		// destroy mahjong game object
		gMahjongGame = null;
	}
}

/*  return percentage of correct answers */
MAHJONGGAME.prototype.correctanswerspercentage = function() {
	return Math.round(this.correctselections*10000/(this.correctselections + this.wrongselections))/100;
}

/*  return percentage of wrong answers */
MAHJONGGAME.prototype.wronganswerspercentage = function() {
	return Math.round(this.wrongselections*10000/(this.correctselections + this.wrongselections))/100;
}

/*  increments wrong answers by one and display it */
MAHJONGGAME.prototype.incrementWrongSelections = function() {
	this.wrongselections++;
	document.getElementById("pWrongAnswers").innerHTML = this.wrongselections;
}

/* define MAHJONGGAME member function that gets next random tile (symbol-copy) */
MAHJONGGAME.prototype.nextrandomsymbolcopy = function() {
	var randomindex,
	len = this.symbolcopies.length;
	do {
		randomindex = Math.floor(Math.random()*len);
	} while (this.symbolcopies[randomindex].copies == 0);
	this.symbolcopies[randomindex].copies--;
	return this.symbolcopies[randomindex];
};

/* define MAHJONGGAME member function that creates the Mahjong board */
MAHJONGGAME.prototype.createboard = function () {
	var row, col, letterCode, tdId, tblHTML = "", tblCell;
	
	/* start table */
	tblHTML += "<table id=\"tblMahjong\">";
	// for each table cell randomly choose a copy of a symbol	
	for(row=1; row<=this.boardsize; row++) {
		/* start table row */
		tblHTML += "<tr>";
		for(col=1; col<=this.boardsize; col++) {
			/* create table data cell */
			tdId = "td" + row + "_" + col;
			tblHTML += ("<td id=\"" + tdId + "\">");
			tblHTML += this.nextrandomsymbolcopy().imgtag();
			tblHTML += "</td>";
		}			
		/* close table row */
		tblHTML += "</tr>";
	}	
	/* close table */
	tblHTML += "</table>";
	/* insert table html into the div placeholder */
	document.getElementById("divMahjongBoard").innerHTML = tblHTML;

	/* assign event handlers to various events */
	for(row=1; row<=this.boardsize; row++)
		for(col=1; col<=this.boardsize; col++) {
			tdId = "td" + row + "_" + col;
			tblCell = document.getElementById(tdId);
			tblCell.onclick = function(){cellOnClickEventHandler(this)};
			tblCell.onmouseover = function(){cellOnMouseOverEventHandler(this)};
			tblCell.onmouseout = function(){cellOnMouseOutEventHandler(this)};
		}					
}

/* define MAHJONGGAME member function that destroys the board */
MAHJONGGAME.prototype.destroyboard = function() {
	document.getElementById("divMahjongBoard").innerHTML = "";
	document.getElementById("pCurrentTime").innerHTML = "";
	document.getElementById("pGameRemainingTime").innerHTML = "";
	document.getElementById("pCorrectAnswers").innerHTML = "";
	document.getElementById("pWrongAnswers").innerHTML = "";
}

/* define MAHJONGGAME member function that resets the background color
	of all the table cells.
	It may be useful when a game is over (time is up) and the mouseover
	event had modified some "free" cell's background color  */
MAHJONGGAME.prototype.resetboardbgcolor = function() {
	var row, col, tdId;
	for(row=1; row<=this.boardsize; row++)
		for(col=1; col<=this.boardsize; col++) {
			tdId = "td" + row + "_" + col;
			document.getElementById(tdId).style.backgroundColor = conREGULARCELL_BGCOLOR;
		}	
}

/* ------------------- METHODS ---------------------- */

function mahjongTimer() {
	var d = new Date();
	
	document.getElementById("pCurrentTime").innerHTML = d.toLocaleTimeString();
	var secs = (gMahjongGame.endtime.getTime() - d.getTime()) / 1000;
	if (secs < 0)
		secs = 0;
	document.getElementById("pGameRemainingTime").innerHTML = Math.floor(secs / 60) + 
																				 ":" + 
																				 Math.round(secs % 60);
	if (d > gMahjongGame.endtime) { // game has ended
		// stop timer
		clearInterval(gMahjongGame.timer);
		// enable user controls
		userControlsDisabled(false);
		// change button caption to Start Game
		document.getElementById("btnStartNewGame").value = conBUTTON_STARTGAME;
		// reset background color for all board cells
		gMahjongGame.resetboardbgcolor();
		// alert user
		var alertMsg = "GAME OVER\n\nCorrect answers : " +
						gMahjongGame.correctanswerspercentage() + 
						"%\nWrong answers : " + 
						gMahjongGame.wronganswerspercentage() + "%";
		alert(alertMsg);
		// disable table
		document.getElementById("tblMahjong").disabled = true;
		// toggle isGamePlaying
		isGamePlaying = !isGamePlaying;
		// destroy mahjong game object
		gMahjongGame = null;
	}
}

/* Validates the user choices
 * 	N : Board size
 *		K : Number of symbols
 *		C : Copies per symbol
 *	Returns true only if:
 *		K*(C-1) <= N*N <= K*C, if C > 2
 *				OR
 *		K*C <= N*N, if C = 2
 */
function validateUserChoices(N, K, C) {
	if (C == 2) // make sure there are enough cells for all copies!
		return (N*N >= K*C)
	else 
		 return (N*N >= K*(C-1)) ? ((N*N <= K*C) ? true : false)	: false;
}

function userControlsDisabled(on) {
	var arrSymbolsUsed;
	// enables/disables user controls
	document.getElementById("cmbBoardSize").disabled = on;
	document.getElementById("cmbCopiesPerSymbol").disabled = on;
	document.getElementById("cmbLevel").disabled = on;
	arrSymbolsUsed = document.getElementsByName("rdSymbolsUsed");
	for (var i=0; i < arrSymbolsUsed.length; i++)
		arrSymbolsUsed[i].disabled = on;
}

function createSymbolCopiesArray(symbolsUsed, copies) {
	var i, len, arrSymbolCopies;

	/* find the number of symbols the array should have */
	len = noOfSymbols(symbolsUsed);
	arrSymbolCopies = new Array(len);
	/* load appropriate symbols to array */
	switch(symbolsUsed) {
		case "az" :
			for(i=0; i<len; i++) 
				arrSymbolCopies[i] = 
					new SYMBOLCOPY(String.fromCharCode(97+i), null, copies);			
			break;		
		case "AZ" :
			for(i=0; i<len; i++)
				arrSymbolCopies[i] = 
					new SYMBOLCOPY(String.fromCharCode(65+i), null, copies);			
			break;		
		case "azAZ" :
			for(i=0; i<(Math.round(len/2)); i++)
				arrSymbolCopies[i] = 
					new SYMBOLCOPY(String.fromCharCode(97+i), null, copies);			
			for(i=0; i<Math.round(len/2); i++)
				arrSymbolCopies[i+Math.round(len/2)] = 
					new SYMBOLCOPY(String.fromCharCode(65+i), null, copies);			
			break;
		case "img" :
			for(i=0; i<len; i++)
				arrSymbolCopies[i] = 
					new SYMBOLCOPY(conImageNames[i], conImageNames[i], copies);			
	}
	return arrSymbolCopies;
}

function isCellEmpty(row, col) {
	var tdId = "td" + row + "_" + col;
	if (document.getElementById(tdId).innerHTML == "")
		return true;
	else 
		return false;
}

function isCellFree(row, col) {	
	// return true if the cells is in the 1st or last column 
	// or if the left or right cells are empty
	if ((col == 1) || (col == gMahjongGame.boardsize) ||
		 isCellEmpty(row, col-1) || isCellEmpty(row, col+1)) {
		 return true;
	}	
}

function getCellPos(tdId) {
	var len = tdId.length;
	var row_col = tdId.substring(2,len);
	var col = parseInt(row_col.split("_").pop());
	var row = parseInt(row_col.substring(0, row_col.indexOf("_")));
	var retval = new CELL(row, col);
	return retval;
}

/* returns the number of symbols for each choice */
function noOfSymbols(symbolsUsed) {
		switch (symbolsUsed) {
			case "az" :
						return 26;
			case "AZ" :
						return 26;
			case "img" :
						return 27;
			case "azAZ" :
						return 26*2;
		}
}

/* 	level --> gameduration */
function gameDuration(level) {
	switch(level) {
		case "Easy":
			return conDURATION_EASYLEVEL;
		case "Medium":
			return conDURATION_MEDIUMLEVEL;		
		case "Hard":
			return conDURATION_HARDLEVEL;
	}
}

/* ----------------  EVENT HANDLERS ----------------------------*/

/* OnLoad event handler for html body */
function bodyOnLoadEventHandler() {
	// initialize User Choices
	document.getElementById("cmbBoardSize").options[1].selected=true;
	document.getElementById("cmbLevel").options[1].selected=true;
	document.getElementById("rdSymbolsUsed_az").checked = true;
	document.getElementById("cmbCopiesPerSymbol").options[1].selected=true;
	// set caption of button to Start Game
	document.getElementById("btnStartNewGame").value = conBUTTON_STARTGAME;
	// set onclick event handler for button
	document.getElementById("btnStartNewGame").onclick = function(){btnStartNewGameOnClickEventHandler(this)};
	// assert the game IS NOT PLAYING yet
	isGamePlaying = false;
}

/* Click event handler for Mahjong Board cells */
function cellOnClickEventHandler(thisObject) {
	var cellId = thisObject.id;
	var cell = getCellPos(cellId);
	if (!isCellFree(cell.row, cell.col))
		return;
	if (gMahjongGame.firstselectedcell == "") { // no cell is selected yet
		gMahjongGame.firstselectedcell = cellId;
		thisObject.style.backgroundColor = conSELECTEDCELL_BGCOLOR;
	} else {	// one cell was selected
		var firstCell = document.getElementById(gMahjongGame.firstselectedcell);
		// if the first cell is clicked again unselect it
		if (gMahjongGame.firstselectedcell == cellId) {
			gMahjongGame.firstselectedcell = "";
			thisObject.style.backgroundColor = conREGULARCELL_BGCOLOR;		
		} else {	// if a different cell is clicked then check if there is a match
			if (firstCell.innerHTML == thisObject.innerHTML) { // a match is made
				// remove both cells
				thisObject.style.backgroundColor = conREGULARCELL_BGCOLOR;
				thisObject.innerHTML = "";
				firstCell.style.backgroundColor = conREGULARCELL_BGCOLOR;
				firstCell.innerHTML = "";
				// increment correct selections
				gMahjongGame.incrementCorrectSelections();
				// reset firstselectedcell
				gMahjongGame.firstselectedcell = "";
				
			} else {
				// increment wrong selections
				gMahjongGame.incrementWrongSelections();				
			}
		}
	}
}

/* OnMouseOver event handler for Mahjong Board cells */
function cellOnMouseOverEventHandler(thisObject) {
	var cell = getCellPos(thisObject.id);
	if (isCellFree(cell.row, cell.col) && (thisObject.id != gMahjongGame.firstselectedcell))
		thisObject.style.backgroundColor = conFREECELL_BGCOLOR;		
}

/* OnMouseOut event handler for Mahjong Board cells */
function cellOnMouseOutEventHandler(thisObject) {
	var cell = getCellPos(thisObject.id);
	if (isCellFree(cell.row, cell.col) && (thisObject.id != gMahjongGame.firstselectedcell))
		thisObject.style.backgroundColor = conREGULARCELL_BGCOLOR;		
}

/* Click event handler for Start New Game button */
function btnStartNewGameOnClickEventHandler(thisObject) {
	var boardSize, copiesPerSymbol, arrSymbolsUsed,
		symbolsUsed, level;
	if(!isGamePlaying) {	// game stopped, users wants to start one
		// read user choices
		boardSize = parseInt(document.getElementById("cmbBoardSize").value);
		copiesPerSymbol = parseInt(document.getElementById("cmbCopiesPerSymbol").value);
		level = document.getElementById("cmbLevel").value;
		arrSymbolsUsed = document.getElementsByName("rdSymbolsUsed");
		for (var i=0; i < arrSymbolsUsed.length; i++) {
			if (arrSymbolsUsed[i].checked) {
				symbolsUsed = arrSymbolsUsed[i].value;
				break;
			}
		}
		/* validate user choices */
		if (!validateUserChoices(boardSize, noOfSymbols(symbolsUsed), copiesPerSymbol)) {
			alert("ERROR: Board size = " + boardSize + 
				"\nSymbols used = " + symbolsUsed +
				"\nNoOfSymbols = " + noOfSymbols(symbolsUsed) +
				"\nCopies per symbol = " + copiesPerSymbol);
			return;
		}
		// disable user controls
		userControlsDisabled(true);
		// change button caption to Stop Game
		thisObject.value = conBUTTON_STOPGAME;
		// create the mahjong object
		gMahjongGame = new MAHJONGGAME(boardSize, level, symbolsUsed, copiesPerSymbol);
		/* draw mahjong board */
		gMahjongGame.createboard();
		/* clear diplayed statistics */
		document.getElementById("pCorrectAnswers").innerHTML = "";
		document.getElementById("pWrongAnswers").innerHTML = "";
		// toggle isGamePlaying
		isGamePlaying = !isGamePlaying;
	} else { // game running, user probably wants to quit
		var answer = confirm("Are you sure you want to quit the game?");
		if (answer) {	// user wants to quit
					// stop timer
					clearInterval(gMahjongGame.timer);
					// destroy board
					gMahjongGame.destroyboard();
					// enable user controls
					userControlsDisabled(false);
					// change button caption to Start Game
					thisObject.value = conBUTTON_STARTGAME;
					// destroy mahjong game object
					gMahjongGame = null;
					// toggle isGamePlaying
					isGamePlaying = !isGamePlaying;
		}	
	}
}