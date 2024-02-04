local BLOCK_SIZE = 55
local BOARD_WIDTH = 10
local BOARD_HEIGHT = 18
local FALL_SPEED = 1

local pieces = {
    {{1, 1},{1, 1}},
    {{1, 1, 1, 1}},
    {{1, 0},{1, 0},{1, 1}},
    {{0, 1},{0, 1},{1, 1}},
    {{0, 1, 1},{1, 1, 0}},
    {{1, 1, 0},{0, 1, 1}},
    {{1, 1, 1},{0, 1, 0}},
}

local board = {}
local currentPiece = {}
local currentPieceX = 3
local currentPieceY = 0
local elapsedTime = 0
local canChangePiece = true

function love.load()
    love.window.setTitle("Tetris game")
    love.window.setMode(BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE)
    initializeBoard()
    chooseNextPiece()
end

function love.update(dt)
    elapsedTime = elapsedTime + dt

    if elapsedTime > FALL_SPEED then
        if not isGameOver() then
            updatePiece()
        end
        elapsedTime = 0
        canChangePiece = true
    end
end

function love.draw()
    drawBoard()
    drawPiece(currentPiece, currentPieceX, currentPieceY)

    if isGameOver() then
        love.graphics.setColor(0, 0, 125)
        love.graphics.print(
            'Game over',
            (BOARD_WIDTH / 2 - 1) * BLOCK_SIZE,
            (BOARD_HEIGHT / 2 - 1) * BLOCK_SIZE,
            0,
            1.5,
            1.5
        )
    end
end

function love.keypressed(key, unicode)
    if key == 'escape' then
        love.event.quit()
    elseif key == 'w' or key == 'up' or key == 'q' then
        rotatePiece(true)
    elseif key == 'a' or key == 'left' then
        moveHorizontal(-1)
    elseif key == 'd' or key == 'right' then
        moveHorizontal(1)
    elseif key == 's' or key == 'down' or key == 'space' then
        forceFall()
    elseif key == 'e' then
        rotatePiece(false)
    elseif key == 'x' and canChangePiece then
        chooseNextPiece()
        canChangePiece = false
    end
end

-- Game Logic Functions
function initializeBoard()
    for i = 1, BOARD_HEIGHT do
        board[i] = {}
        for j = 1, BOARD_WIDTH do
            board[i][j] = 0
        end
    end
end

function chooseNextPiece()
    currentPiece = pieces[love.math.random(#pieces)]
    currentPieceX = 3
    currentPieceY = 0
end

function rotatePiece(counterClockwise)
    local rotatedPiece = rotate(currentPiece, counterClockwise)
    if canMove(rotatedPiece, currentPieceX, currentPieceY) then
        currentPiece = rotatedPiece
    end
end

function moveHorizontal(dx)
    if canMove(currentPiece, currentPieceX + dx, currentPieceY) then
        currentPieceX = currentPieceX + dx
    end
end

function forceFall()
    while canMove(currentPiece, currentPieceX, currentPieceY + 1) do
        currentPieceY = currentPieceY + 1
    end
    updatePiece()
end

function updatePiece()
    if canMove(currentPiece, currentPieceX, currentPieceY + 1) then
        currentPieceY = currentPieceY + 1
    else
        mergePiece()
        removeFilledLines()
        chooseNextPiece()
        if isGameOver() then
            print("Game over")
        end
    end
end

function mergePiece()
    for y = 1, #currentPiece do
        for x = 1, #currentPiece[y] do
            if currentPiece[y][x] == 1 then
                board[currentPieceY + y][currentPieceX + x] = 1
            end
        end
    end
end

function removeFilledLines()
    local linesToRemove = {}
    for y = BOARD_HEIGHT, 1, -1 do
        local filledSpots = 0
        for x = 1, BOARD_WIDTH do
            filledSpots = filledSpots + board[y][x]
        end
        if filledSpots == BOARD_WIDTH then
            table.insert(linesToRemove, y)
        end
    end

    for _, line in ipairs(linesToRemove) do
        table.remove(board, line)
        table.insert(board, 1, {})
        for x = 1, BOARD_WIDTH do
            board[1][x] = 0
        end
    end
end

function drawBoard()
    love.graphics.setBackgroundColor(0, 0, 255) 

    for y = 1, BOARD_HEIGHT do
        for x = 1, BOARD_WIDTH do
            local color = (board[y][x] == 1) and {255, 255, 255} or {0, 0, 0}
            drawBlock(x, y, color)
        end
    end
end

function drawPiece(piece, posX, posY)
    for y = 1, #piece do
        for x = 1, #piece[y] do
            if piece[y][x] == 1 then
                drawBlock(posX + x, posY + y, {255, 255, 255})
            end
        end
    end
end

function drawBlock(x, y, color)
    love.graphics.setColor(color)
    love.graphics.rectangle("fill", (x - 1) * BLOCK_SIZE, (y - 1) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
end

function canMove(piece, posX, posY)
    for y = 1, #piece do
        for x = 1, #piece[y] do
            if piece[y][x] == 1 then
                if posX + x < 1 or posX + x > BOARD_WIDTH or posY + y > BOARD_HEIGHT or board[posY + y][posX + x] == 1 then
                    return false
                end
            end
        end
    end
    return true
end

function isGameOver()
    for x = 1, BOARD_WIDTH do
        if board[1][x] == 1 then
            return true
        end
    end
    return false
end

function rotate(piece, counterClockwise)
    local rotatedPiece = {}

    local startX, startY, endX, endY = 1, 1, #piece, #piece[1]

    if counterClockwise then
        startX, startY, endX, endY = 1, 1, #piece[1], #piece
    end

    for x = startX, endX do
        rotatedPiece[x] = {}

        for y = startY, endY do
            rotatedPiece[x][y] = counterClockwise and piece[y][#piece[1] - x + 1] or piece[#piece - x + 1][y]
        end
    end

    return rotatedPiece
end
