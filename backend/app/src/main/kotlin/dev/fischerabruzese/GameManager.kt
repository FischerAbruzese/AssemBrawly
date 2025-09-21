package dev.fischerabruzese

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
        val game = Game(games.size.toString(), mutableListOf())
        games[game.id] = game
        return game
    }

    fun playerLeft(player: Player) {
        val game = player.game

        if (game?.players?.remove(player) != true) {
            throw Exception("Expected player to be removed/game to exist")
        }

        if (game.players.isEmpty()) {
            // println("---PURGING GAME ${game.id}---")
            games.remove(game.id)
        }
    }
}
