package dev.fischerabruzese

class GameManager {
    private val games: HashMap<String, Game> = hashMapOf()
    private val gamesByPlayer: HashMap<String, Game> = hashMapOf()

    fun getGame(id: String) = games[id]

    enum class ConnectToGame {
        SUCCESS,
        NOT_ENOUGH_PLAYERS,
        GAME_FULL,
    }

    fun addPlayerToGame(
        id: String?,
        player: Player,
    ): ConnectToGame {
        val game = if (id != null) games.getOrElse(id, ::newGame) else newGame()
        if (game.players.size >= 2) {
            return ConnectToGame.GAME_FULL
        }
        game.players.add(player)
        gamesByPlayer[player.uuid] = game
        return if (game.players.size == 2) ConnectToGame.SUCCESS else ConnectToGame.NOT_ENOUGH_PLAYERS
    }

    fun playerGame(player: Player): Game? = gamesByPlayer[player.uuid]

    fun newGame(): Game {
        val game = Game(games.size.toString(), mutableListOf())
        games[game.id] = game
        return game
    }
}
