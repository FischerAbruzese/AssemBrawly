package dev.fischerabruzese

import io.ktor.server.websocket.WebSocketServerSession

data class Player(
    val uuid: String,
    val websocket: WebSocketServerSession,
)

data class Game(
    val id: String,
    val players: MutableList<Player>,
)

fun playGame(game: Game) {
    TODO()
}
