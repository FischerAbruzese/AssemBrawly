package dev.fischerabruzese

class GameManager {
    private val games: HashMap<String, Game> = hashMapOf()

    fun getGame(id: String) = games[id]

    enum class ConnectToGame {
        SUCCESS,
        NOT_ENOUGH_PLAYERS,
        GAME_FULL,
    }

    fun addPlayerToGame(
        id: String,
        player: Player,
    ): ConnectToGame {
        val game = games.getOrElse(id, ::newGame)
        if (game.players.size >= 2) {
            return ConnectToGame.GAME_FULL
        }

        game.players.add(player)
        return if (game.players.size == 2) ConnectToGame.SUCCESS else ConnectToGame.NOT_ENOUGH_PLAYERS
    }

    private fun newGame(): Game {
        val game = Game(games.size.toString(), mutableListOf())
        games[game.id] = game
        return game
    }
}
