/* jshint node: true */
/* jshint esversion: 6 */
/* jshint browser: true */

"use strict";


let GAME = (function() {
    // Game variables start...
    let dragged;
    let unq_id = 0;
    let game_win = 0;

    // game logic array
    let arr = [
        [0,0,0],
        [0,0,0],
        [0,0,0]
    ];

    const game_log = {
        pre: "To start game, Drag & Drop squares",
        start_x: "Game started, player-O is next",
        start_o: "Game started, player-X is next",
        x_won: "Player-X WON!!! press Reset to play again",
        o_won: "Player-O WON!!! press Reset to play again",
        no_win: "NO winner!!! press Reset to play again"
    };

    // Electronic_Chime_sound.mp3 (shortened by me for ease of use)
    // See Electronic_Chime_sound.txt for license info
    let mySound = new Audio('./sounds/e_chime.mp3');

    const sqrClass = 'square';
    const redBorder = '3px dashed red';
    const blkBorder = '3px solid black';
    const cpuFade = '0.3';
    const xValue = 1;
    const oValue = 10;
    // Game variables end...


    const drag_sq = document.querySelectorAll('.mv-sq-x, .mv-sq-o');

    // add NON-mobile EventListeners to both player Squares
    drag_sq.forEach(() => {
        addEventListener('dragstart', (ev) => {
            dragged = ev.target;
        });
        addEventListener('dragend', (ev) => {
            // TODO: The game will work without anything inside this EventListener
        });
    });

    // add mobile EventListeners to both player Squares
    drag_sq.forEach(() => {
        addEventListener('touchstart', (ev) => {
            dragged = ev.target;
        });

        addEventListener('touchmove', (ev) => {
            let dragOverTarget = document.elementFromPoint(
                ev.changedTouches[0].pageX,
                ev.changedTouches[0].pageY
            );

            if (ev.target.draggable && dragOverTarget.className === sqrClass){
                document.querySelectorAll('.square').forEach((sq) => {
                    sq.style.border = blkBorder;
                });
                dragOverTarget.style.border = redBorder;
            }
        });

        addEventListener('touchend', (ev) => {
            let endTarget = document.elementFromPoint(
                ev.changedTouches[0].pageX,
                ev.changedTouches[0].pageY
            );

            if (ev.target.draggable){
                dragDrop(endTarget);
            }
        });

    });

    // add EventListeners to all game squares(orange squares) on the board.
    document.querySelectorAll('.square').forEach(() => {
        addEventListener('dragover', (ev) => {
            ev.preventDefault();
        });
        addEventListener('dragenter', (ev) => {
            ev.preventDefault();
            if (ev.target.className === sqrClass && game_win === 0){
                ev.target.style.border = redBorder;
            }
            return;
        });
        addEventListener('dragleave', (ev) => {
            ev.preventDefault();
            if (ev.target.className === sqrClass){
                ev.target.style.border = blkBorder;
            }
            return;
        });
        // dragDrop() is long so im going to leave it as a function declaration
        addEventListener('drop', dragDrop);
    });

    function dragDrop(ev) {

        let squareChoice = null;
        if (ev.target) {
            ev.preventDefault();
            squareChoice = ev.target // for desktop users
        } else {
            squareChoice = ev // for mobile device users
        };

        if (squareChoice.className === sqrClass && game_win === 0){
            squareChoice.style.border = blkBorder;

            // if the square does not have a child continue with the operations.
            // also check dragged element id to see if its the original X or O player square.
            // if its not one of the originals do not complete the append clone operation.
            if (squareChoice.children[0] === undefined
                && (dragged.id === 'first-x' || dragged.id === 'first-o') ){
                let temp_node = dragged.cloneNode();
                const drag_elmt_id = temp_node.id; // store dragged element id before its modified

                temp_node.id += unq_id; // make a unique id for the clone
                temp_node.draggable = false;

                squareChoice.appendChild(temp_node); // append unique id clone to square
                unq_id++; // increment unique clone counter

                // update logic array
                arr_update(squareChoice.id, drag_elmt_id);

                // check if theres any winning combinations
                check_win();

                // disable the draggable attribute of the drag square opposite of what the player
                // initially dropped. so the player doesn't accidentally drop the computer square.
                if (unq_id === 1){
                    if (dragged.id === 'first-x'){
                        document.querySelector('.drag-container :nth-child(2)').style.opacity = cpuFade;
                        document.querySelector('.drag-container :nth-child(2)').draggable = false;
                    } else {
                        document.querySelector('.drag-container :nth-child(1)').style.opacity = cpuFade;
                        document.querySelector('.drag-container :nth-child(1)').draggable = false;
                    }
                }
                
                info_log();

                computerTurn();
            }
        }
    }

    function info_log() {
        if (unq_id === 0){
            document.getElementById("results").innerHTML = game_log.pre;
        }
        else if (unq_id === 9 && game_win === 0){
            document.getElementById("results").innerHTML = game_log.no_win;
        }
        else if (unq_id > 0 && game_win === 0){
            if (dragged.id === 'first-x'){
                document.getElementById("results").innerHTML = game_log.start_x;
            }
            else if (dragged.id === 'first-o'){
                document.getElementById("results").innerHTML = game_log.start_o;
            }
        }
    }

    function arr_update(e_target, e_drag) {

        // process id.string from the square where element was dropped
        let row = e_target.slice(0,3);
        let col = e_target[4];

        let r_index;
        let c_index;

        // prepare row index
        if (row === 'top'){
            r_index = 0;
        }
        else if (row === 'mid'){
            r_index = 1;
        }
        else if (row === 'bot'){
            r_index = 2;
        }

        // prepare column index
        if (col === 'l'){
            c_index = 0;
        }
        else if (col === 'c'){
            c_index = 1;
        }
        else if (col === 'r'){
            c_index = 2;
        }

        // update logic array depending on what player square was dropped
        if (e_drag === 'first-x'){
            arr[r_index][c_index] = xValue;
        }
        else if(e_drag === 'first-o'){
            arr[r_index][c_index] = oValue;
        }
    }

    function check_win(){
        let win_color;

        if (win_comb(3 * xValue, arr)) {
            game_win = 1;
            document.getElementById("results").innerHTML = game_log.x_won;
            win_color = 'yellow';
            mySound.play();
        }

        if (win_comb(3 * oValue, arr)) {
            game_win = 1;
            document.getElementById("results").innerHTML = game_log.o_won;
            win_color = 'green';
            mySound.play();
        }

        if (game_win !== 0){
            let win_canvas = document.querySelector('.canvas-outer');
            win_canvas.style.backgroundColor = win_color;
        }
    }

    function win_comb(num, tempArray){
        let comb_set = new Set();

        // Horizontal checks
        for (let x = 0; x < 3 ; x++){
            comb_set.add(arr_sum(tempArray[x]));
        }

        // Vertical checks
        for (let y = 0; y < 3 ; y++){
            comb_set.add(tempArray[0][y] + tempArray[1][y] + tempArray[2][y]);
        }

        // Diagonal checks
        comb_set.add(tempArray[0][0] + tempArray[1][1] + tempArray[2][2]);
        comb_set.add(tempArray[0][2] + tempArray[1][1] + tempArray[2][0]);

        return comb_set.has(num);
    }

    function arr_sum(ar){
        return ar.reduce((a,b) => a + b, 0);
    }

    // player vs Computer functions.................................................

    function computerTurn() {

        if (dragged.id === 'first-x') {
            dragged = document.querySelector('#first-o');
        } else {
            dragged = document.querySelector('#first-x');
        }

        let availableMoves = getAvailableMoves(arr);

        // later I will give the option of playing 'easy' or 'hard' mode and run either one of the 2 lines below
        // const cpu_move = generateRandomMove(availableMoves);
        const cpu_move = generateMove(availableMoves);

        if (cpu_move){
            initiateMove(cpu_move);
        } else return;
    }

    function getAvailableMoves(board) {
        let avMoves = [];
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++){
                if (board[x][y] === 0) {
                    avMoves.push([x,y]);
                }
            }
        }
        return avMoves;
    }

    function generateRandomMove(avMovesArray) {
        //returns an array [row,column] with coordinates of random available square
        return avMovesArray[Math.floor(Math.random() * avMovesArray.length)];
    }

    function initiateMove(choice) {
        let cpu_square = null;

        if (choice[0] === 0 ) {
            // first row choices
            if (choice[1] === 0 ) {
                cpu_square = document.querySelector('#top-l');
            } else if (choice[1] === 1) {
                cpu_square = document.querySelector('#top-c');
            } else if (choice[1] === 2) {
                cpu_square = document.querySelector('#top-r');
            }
        } else if (choice[0] === 1) {
            // second row choices
            if (choice[1] === 0 ) {
                cpu_square = document.querySelector('#mid-l');
            } else if (choice[1] === 1) {
                cpu_square = document.querySelector('#mid-c');
            } else if (choice[1] === 2) {
                cpu_square = document.querySelector('#mid-r');
            }
        } else if (choice[0] === 2) {
            // third row choices
            if (choice[1] === 0 ) {
                cpu_square = document.querySelector('#bot-l');
            } else if (choice[1] === 1) {
                cpu_square = document.querySelector('#bot-c');
            } else if (choice[1] === 2) {
                cpu_square = document.querySelector('#bot-r');
            }
        }

        dropComputer(cpu_square, dragged);
        return;
    }

    // this is similar to dragDrop() but for the computers turn
    function dropComputer(target, dragSquare) {
        if (target.className === sqrClass && game_win === 0){

            if (target.children[0] === undefined
                && (dragSquare.id === 'first-x' || dragSquare.id === 'first-o') ){
                let temp_node = dragSquare.cloneNode();
                const drag_elmt_id = temp_node.id;

                temp_node.id += unq_id;
                temp_node.draggable = false;

                target.appendChild(temp_node);
                unq_id++;

                arr_update(target.id, drag_elmt_id);

                check_win();

                info_log();
            }
        }
    }

    function generateMove(avMovesArray){

        let cpuNumber;
        let playerNumber;

        if (dragged.id === 'first-x'){
            cpuNumber = xValue;
            playerNumber = oValue;
        } else {
            cpuNumber = oValue;
            playerNumber = xValue;
        }

        // analyze every availabe square to see if there is a winning move for the computer
        let compWin = false;
        for (let x = 0; x < avMovesArray.length; x++){
            compWin = checkForWin(avMovesArray[x], cpuNumber);
            if (compWin) {
                return avMovesArray[x];
            }
        }

        // if no winning moves, analyze every availabe square to see if the computer can block a player win
        let compBlock = false;
        for (let y = 0; y < avMovesArray.length; y++){
            compBlock = checkForWin(avMovesArray[y], playerNumber);
            if (compBlock) {
                return avMovesArray[y];
            }
        }

        // if no winning moves or block moves available, pick a random square
        return generateRandomMove(avMovesArray);
    }

    function checkForWin (move, winNumber) {
        // created checkArray this way to make a true non reference copy. otherwise arr will be modified
        let checkArray = JSON.parse(JSON.stringify(arr));
        checkArray[move[0]][move[1]] = winNumber;
        return win_comb(3 * winNumber, checkArray);
    }

    return {
        resetbtn: function () {
            window.location.reload();
        },
        start_info: info_log
    };

})();

// function to run when the game first starts
GAME.start_info();
