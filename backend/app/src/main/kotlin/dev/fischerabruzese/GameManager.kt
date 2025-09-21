package dev.fischerabruzese

import kotlinx.coroutines.cancel
import java.util.UUID

class GameManager {
    val games: HashMap<String, Game> = hashMapOf()
    val lobby: MutableSet<Player> = mutableSetOf()

    fun getGame(id: String) = games[id]

    enum class ConnectToGame {
        SUCCESS,
        NOT_ENOUGH_PLAYERS,
        GAME_FULL,
    }

    fun registerPlayer(player: Player) {
        lobby += player
    }

    fun addPlayerToGame(
        id: String?,
        player: Player,
    ): ConnectToGame {
        if (!(player in lobby)) {
            throw Exception("Player was not waiting in lobby")
        }
        lobby -= player

        val game = if (id != null) games.getOrElse(id, ::newGame) else newGame()
        if (game.players.size >= 2) {
            return ConnectToGame.GAME_FULL
        }
        game.players.add(player)
        player.game = game
        return if (game.players.size == 2) ConnectToGame.SUCCESS else ConnectToGame.NOT_ENOUGH_PLAYERS
    }

    private fun newGame(): Game {
        val game = Game(UUID.randomUUID().toString().take(6), mutableListOf())
        games[game.id] = game
        return game
    }

    fun killGame(game: Game) {
        for (player in game.players) {
            player.websocket.cancel("Someone killed the game")
        }
        games.remove(game.id)
    }
}
