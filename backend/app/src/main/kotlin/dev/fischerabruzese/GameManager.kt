package dev.fischerabruzese

import kotlinx.coroutines.cancel
import java.util.UUID

@kotlin.concurrent.atomics.ExperimentalAtomicApi
class GameManager {
    // game id to room
    val games: HashMap<String, GameRoom> = hashMapOf()

    fun getGame(id: String): GameRoom {
        if (games[id] == null) {
            return newRoom(id)
        }
        return games[id]!!
    }

    fun newRoom(roomId: String = UUID.randomUUID().toString()): GameRoom {
        val gameRoom =
            GameRoom(roomId) {
                games -= roomId
            }
        games[roomId] = gameRoom
        return gameRoom
    }
}
