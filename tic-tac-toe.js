var start = document.getElementById(`start`),
board = document.getElementById(`board`),
gameInput = document.getElementById(`gameInput`),
GameCode = Math.random().toString(36).substring(7),
gameCode = document.getElementById(`gameCode`),
turnText = document.getElementById(`turnText`),
wins = document.getElementById(`wins`),
squares = document.getElementById(`squares`),
socket = io.connect(`https://games-tic-tac-toe.herokuapp.com`),
player1 = ``, player2 = ``, scale = 3, canPlace = true,
turn = {letter: `X`, color: `grey`}, role = `X`
gameCode.textContent = GameCode
if (localStorage.getItem(`tic-tac-toewins`)) wins.textContent = localStorage.getItem(`tic-tac-toewins`)
//Server: http://127.0.0.1:5500
//Heroku: https://games-tic-tac-toe.herokuapp.com
function layoutForSizes() {
    start.style.left = `${board.getBoundingClientRect().left + parseFloat(board.style.width) + 25 + scrollX}px`
    start.style.top = `${board.getBoundingClientRect().top + parseFloat(board.style.height) - 62 + scrollY}px`
    turnText.style.left = `${board.getBoundingClientRect().left + parseFloat(board.style.width) / 2 - 185 + scrollX}px`
    turnText.style.top = `${board.getBoundingClientRect().top + parseFloat(board.style.height) / 2 - 60 + scrollY}px`
} layoutForSizes()
window.onresize = layoutForSizes, window.onscroll = layoutForSizes
socket.emit(`new game`, GameCode)
gameInput.onkeyup = function(e) {joinGame(e)}
function joinGame(e) {
    if (e.key == `Enter`) {
        socket.emit(`join game`, gameInput.value)
    }
}
socket.on(`joined game`, data => {
    gameCode.textContent = data.code
    player1 = data.player1
    player2 = data.player2
    if (socket.id == player2) role = `O`, document.getElementById(`role`).textContent = `YOU ARE ${role}.`
    start.hidden = false
    for (var i = 0; i < scale; i++) {
        for (var j = 0; j < scale; j++) {
            var square = document.createElement(`div`)
            square.style.border = `solid black 4px`
            square.style.width = `${parseFloat(board.style.width) / scale}px`
            square.style.height = `${parseFloat(board.style.height) / scale}px`
            square.style.position = `absolute`
            square.id = `${i} ${j}`
            square.style.textAlign = `center`
            square.style.lineHeight = square.style.height
            square.style.marginLeft = `${i * parseFloat(board.style.width) / scale - 4}px`
            square.style.marginTop = `${j * parseFloat(board.style.height) / scale - 4}px`
            square.onclick = place.bind(this, square)
            squares.appendChild(square)
        }
    }
    start.onclick = function () {socket.emit(`start game`)}
})
socket.on(`start game`, startGame)
function startGame() {
    start.hidden = true
    showTurnText()
}
function showTurnText() {
    turnText.textContent = `${turn.letter}'s Turn`
    turnText.style.color = turn.color
    turnText.hidden = false
    canPlace = false
    setTimeout(() => {turnText.hidden = true, canPlace = true}, 2000)
}
function place(square) {
    if (canPlace && (role == `X` && turn.letter == `X` || role == `O` && turn.letter == `O`) && square.textContent == ``) socket.emit(`place`, square.id)
}
socket.on(`place`, id => {
    var square = document.getElementById(id)
    square.textContent = turn.letter
    square.style.color = turn.color
    square.style.animation = `place .3s forwards`
    square.onanimationend = function() {
        var winningConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
        if (winningConditions.some(winningCondition => Array.from(squares.children).filter(elem => elem.textContent == turn.letter).map(elem => Array.from(squares.children).indexOf(elem)).toString().includes(winningCondition.toString()))) {
            if (role == turn.letter) {
                alert(`You won!`)
                wins.textContent = `WINS: ${parseFloat(wins.textContent.slice(wins.textContent.indexOf(`:`) + 2)) + 1}`
                localStorage.setItem(`tic-tac-toewins`, wins.textContent)
            } else alert(`You lost.`)
            return document.location.reload()
            } else if (Array.from(squares.children).filter(sqr => sqr.textContent == ``).length == 0) {
                alert(`Tie!`)
                return document.location.reload()
            }
        turn = {letter: [`X`, `O`].find(letter => letter != turn.letter), color: [`grey`, `white`].find(color => color != turn.color)}
        showTurnText()
    }
})
socket.on(`full game`, () => {alert(`Game is full.`), document.location.reload()})
socket.on(`disconnected`, () => {document.location.reload()})