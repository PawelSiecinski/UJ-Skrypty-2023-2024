#!/bin/bash

# Function to display game instructions
instructions() {
    cat <<EOF
Welcome to Tic Tac Toe!

Instructions:
1. The board is a 3x3 grid numbered from 1 to 9.
2. Players take turns to enter their move by choosing a number on the board.
3. Player 1 is 'X' and Player 2 (Computer) is 'O'.
4. The first player to get 3 of their marks in a row, column, or diagonal wins!
5. If all the cells are filled and no player has won, the game is a draw.

Let's start the game!
EOF
}

# Function to check a winner
check_winner() {
    local lines=(
        "1 2 3"
        "4 5 6"
        "7 8 9"
        "1 4 7"
        "2 5 8"
        "3 6 9"
        "1 5 9"
        "3 5 7"
    )

    for line in "${lines[@]}"; do
        local cells=($line)
        if [[ ${board[${cells[0]}]} == ${board[${cells[1]}]} && ${board[${cells[0]}]} == ${board[${cells[2]}]} && ${board[${cells[0]}]} != " " ]]; then
            echo "Player ${board[${cells[0]}]} wins!"
            exit
        fi
    done
}

# Function to print the game board
print_board() {
    cat <<EOF
  ${board[1]}  |  ${board[2]}  |  ${board[3]}
-----+-----+-----
  ${board[4]}  |  ${board[5]}  |  ${board[6]}
-----+-----+-----
  ${board[7]}  |  ${board[8]}  |  ${board[9]}
EOF
}

# Function to initialize the game board
initialize_board() {
    board=(" " " " " " " " " " " " " " " " " " " " " " " " " " " ")
}

# Function to set player and computer variables
choose_player() {
    player=1
    computer=2
}

# Function for the computer move
computer_move() {
    local available_moves=()
    for ((i=1; i<=9; i++)); do
        if [[ ${board[$i]} == " " ]]; then
            available_moves+=($i)
        fi
    done

    if [[ ${#available_moves[@]} -eq 0 ]]; then
        echo "It's a draw!"
        exit
    fi

    local random_index=$((RANDOM % ${#available_moves[@]}))
    local move=${available_moves[$random_index]}
    board[$move]="O"
}

# Main game loop
clear
instructions
initialize_board
choose_player
print_board
echo -e "\n"

while true; do
    if [[ $player -eq 1 ]]; then
        read -p "Enter your move: " move
        if [[ $move -lt 1 || $move -gt 9 ]]; then
            echo "Invalid move. Please choose a number between 1 and 9."
            continue
        fi
        if [[ ${board[$move]} == " " ]]; then
            board[$move]="X"
            player=2
        else
            echo "Invalid move. Please choose an empty cell."
            continue
        fi
    fi

    clear
    check_winner
    instructions
    print_board
    echo -e "\n"

    if [[ $player -eq 2 ]]; then
        computer_move
        player=1
    fi

    clear
    check_winner
    instructions
    print_board
    echo -e "\n"
done