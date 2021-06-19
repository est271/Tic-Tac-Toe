/* jshint node: true */
/* jshint esversion: 6 */
/* jshint browser: true */

"use strict";

// global variables 
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

// functions to run when the game first starts
info_log();

// Electronic_Chime_sound.mp3 (shortened by me for ease of use)
// See Electronic_Chime_sound.txt for license info
let mySound = new Audio('./sounds/e_chime.mp3');

// assign to object drag_sq div elements mv-sq-x and mv-sq-o
const drag_sq = document.querySelectorAll('.mv-sq-x, .mv-sq-o');

// add EventListeners to all elements in object drag_sq (NON-mobile EventListeners)
drag_sq.forEach(() => {
    addEventListener('dragstart', (ev) => {
        dragged = ev.target;
    });
    addEventListener('dragend', (ev) => {
        // TODO: The game will work without anything inside this EventListener
    });
});

// ................................TOUCH EVENTS START....................................

drag_sq.forEach(() => {
    addEventListener('touchstart', (ev) => {
        dragged = ev.target;
    });

    addEventListener('touchmove', (ev) => {
        let dragOverTarget = document.elementFromPoint(
            ev.changedTouches[0].pageX,
            ev.changedTouches[0].pageY,
        )

        if (ev.target.draggable && dragOverTarget.className === 'square'){
            document.querySelectorAll('.square').forEach((sq) => {
                sq.style.border = '3px solid black';
            });
            dragOverTarget.style.border = '3px dashed red';
        }
    });

    addEventListener('touchend', (ev) => {
        let endTarget = document.elementFromPoint(
            ev.changedTouches[0].pageX,
            ev.changedTouches[0].pageY,
        )

        if (ev.target.draggable){
            dragDropMobile(endTarget);
        }
    });

});

// ................................TOUCH EVENTS END....................................


// add EventListeners to all div elements of class 'square' (NON-mobile EventListeners)
document.querySelectorAll('.square').forEach(() => {
    addEventListener('dragover', (ev) => {
        ev.preventDefault();
    });
    addEventListener('dragenter', (ev) => {
        ev.preventDefault();
        if (ev.target.className === 'square' && game_win === 0){
            ev.target.style.border = '3px dashed red';
        }
        return;
    });
    addEventListener('dragleave', (ev) => {
        ev.preventDefault();
        if (ev.target.className === 'square'){
            ev.target.style.border = '3px solid black';
        }
        return;
    });
    // dragDrop() is long so im going to leave it as a function declaration
    addEventListener('drop', dragDrop);
});

function dragDrop(ev) {
    ev.preventDefault();

    if (ev.target.className === 'square' && game_win === 0){
        ev.target.style.border = '3px solid black';

        // if the square does not have a child continue with the operations.
        // also check dragged element id to see if its the original X or O square.
        // if its not one of the originals do not complete the append clone operation.
        if (ev.target.children[0] === undefined
            && (dragged.id === 'first-x' || dragged.id === 'first-o') ){
            let temp_node = dragged.cloneNode();
            const drag_elmt_id = temp_node.id; // store dragged element id before its modified

            temp_node.id += unq_id; // make a unique id for the clone
            temp_node.draggable = false;

            ev.target.appendChild(temp_node); // append unique id clone to square
            unq_id++; // increment unique clone counter

            // update logic array
            arr_update(ev.target.id, drag_elmt_id);

            // check if theres any winning combinations
            check_win();

            // disable the draggable attribute of the first dropped player square.
            // then interchange the draggable attribute of both squares in following turns.
            if (unq_id === 1){
                dragged.draggable = !dragged.draggable;
            }
            else if (unq_id > 1){
                drag_sq.forEach(sq => {
                    sq.draggable = !sq.draggable;
                });
            }
            
            info_log();
        }
    }
}

// dragDropMobile() is similar to dragDrop() but modified to handle mobile functionality
function dragDropMobile(ev) {
    if (ev.className === 'square' && game_win === 0){
        ev.style.border = '3px solid black';

        if (ev.children[0] === undefined
            && (dragged.id === 'first-x' || dragged.id === 'first-o') ){
            let temp_node = dragged.cloneNode();
            const drag_elmt_id = temp_node.id;

            temp_node.id += unq_id;
            temp_node.draggable = false;

            ev.appendChild(temp_node);
            unq_id++;

            arr_update(ev.id, drag_elmt_id);

            check_win();

            if (unq_id === 1){
                dragged.draggable = !dragged.draggable;
            }
            else if (unq_id > 1){
                drag_sq.forEach(sq => {
                    sq.draggable = !sq.draggable;
                });
            }

            info_log();
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

function resetbtn() {
    window.location.reload();
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

    // update logic array depending on what x or o was dropped
    if (e_drag === 'first-x'){
        arr[r_index][c_index] = 1;
    }
    else if(e_drag === 'first-o'){
        arr[r_index][c_index] = 10;
    }
}

function check_win(){
    let win_color;

    if (win_comb(3)) {
        game_win = 1;
        document.getElementById("results").innerHTML = game_log.x_won;
        win_color = 'yellow';
        mySound.play();
    }

    if (win_comb(30)) {
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

function win_comb(num){
    let comb_set = new Set();

    // Horizontal checks
    for (let x = 0; x < 3 ; x++){
        comb_set.add(arr_sum(arr[x]));
    }

    // Vertical checks
    for (let y = 0; y < 3 ; y++){
        comb_set.add(arr[0][y] + arr[1][y] + arr[2][y]);
    }

    // Diagonal checks
    comb_set.add(arr[0][0] + arr[1][1] + arr[2][2]);
    comb_set.add(arr[0][2] + arr[1][1] + arr[2][0]);

    return comb_set.has(num);
}

// function to sum elements in an array
function arr_sum(ar){
    return ar.reduce((a,b) => a + b, 0);
}
