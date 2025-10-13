package dev.fischerabruzese

import io.ktor.server.websocket.*
import io.ktor.websocket.*
import java.util.concurrent.ConcurrentHashMap
import dev.fischerabruzese.*
import dev.fischerabruzese.WebSocketMessage
import kotlin.uuid.Uuid
import kotlin.concurrent.atomics.AtomicBoolean

@kotlin.concurrent.atomics.ExperimentalAtomicApi
class GameRoom(val id: String, val onDispose:()->Unit) {

    var gameStarted: AtomicBoolean = AtomicBoolean(false)
	var problem: RISCVProblem = PROBLEM_SET.random()
    private val sessions = ConcurrentHashMap<String, Player>()

	fun playersIterDebug() =
		sessions.asIterable().map {it.value}

    enum class ConnectToGame {
        SUCCESS,
        NOT_ENOUGH_PLAYERS,
        GAME_FULL,
    }
    fun join(player: Player, ws: DefaultWebSocketServerSession): ConnectToGame {
		if (sessions.size == 2) return ConnectToGame.GAME_FULL

        if(!sessions.containsKey(player.uuid)) {
			player.websocket = ws
			sessions[player.uuid] = player
		}

		return when(sessions.size) {
			0 -> throw IllegalStateException()
			1 -> ConnectToGame.NOT_ENOUGH_PLAYERS
			2 -> ConnectToGame.SUCCESS.also { 
				gameStarted.store(true) 
			}
			else -> throw IllegalStateException()
		}
    }

    fun leave(ws: DefaultWebSocketServerSession) {
        sessions.values.removeIf { it.websocket == ws }
        if (sessions.isEmpty()) {
            onDispose()
        }
    }

    suspend fun send(data:Frame.Text, to: String) {
        val player = sessions[to.toString()] ?: return
        player.websocket.send(data)
    }

	suspend fun sendAll(data: Frame.Text) {
		sessions.values.forEach {
			it.websocket.send(data)
		}
	}

	suspend fun sendAll(messageGen: (Player)-> Frame.Text?) {
		sessions.values.forEach {
			val msg = messageGen(it) 
			if(msg != null) {
				send(msg, it.uuid)
			}
		}
	}

	suspend fun newProblem() {
		TODO()
	}

    suspend fun close() {
        sessions.values.forEach {
            it.websocket.close(CloseReason(CloseReason.Codes.INTERNAL_ERROR, "closing"))
        }
        sessions.clear()
    }
}
