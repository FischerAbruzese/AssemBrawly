package dev.fischerabruzese

import io.ktor.server.websocket.*
import io.ktor.websocket.*
import java.util.concurrent.ConcurrentHashMap
import dev.fischerabruzese.*
import kotlinx.coroutines.*
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Duration.Companion.seconds
import dev.fischerabruzese.WebSocketMessage
import kotlin.uuid.Uuid
import kotlin.concurrent.atomics.AtomicBoolean
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.*

@kotlin.concurrent.atomics.ExperimentalAtomicApi
class GameRoom(val id: String, val onDispose:()->Unit) {
	var gameStarted: AtomicBoolean = AtomicBoolean(false)
	var problem: RISCVProblem = PROBLEM_SET.random()
    private val sessions = ConcurrentHashMap<String, Player>()

	init {
		CoroutineScope(Dispatchers.Default).launch {
			while (true) {
				delay(10.seconds)
				if (sessions.none{it.value.websocket.isActive}) {
					close()
					break
				}
			}
		}
	}

	fun playersIterDebug() =
		sessions.asIterable().map {it.value}

    enum class ConnectToGame {
        SUCCESS,
        NOT_ENOUGH_PLAYERS,
        GAME_FULL,
    }

	// add player to sessions and return the status (starting the game if they're the second player)
    fun join(player: Player, ws: DefaultWebSocketServerSession): ConnectToGame {
		if (sessions.size >= 2) return ConnectToGame.GAME_FULL

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
		println("PLAYER LEFT!!!!!!!!!!!!!!!!!!!")
        sessions.values.removeIf { it.websocket == ws }
        if (sessions.isEmpty()) {
            onDispose()
        }
    }

	// send message to player from uuid
    suspend fun send(data:Frame.Text, to: String) {
		print("Sending Text Frame -> {$to}: ${Json.decodeFromString<JsonObject>(data.readText())}\n\n")
        val player = sessions[to] ?: return
        player.websocket.send(data)
    }

	// send message to all players in this game
	suspend fun sendAll(data: Frame.Text) {
		sessions.values.forEach {
			it.websocket.send(data)
		}
	}

	// generate a message for all players send non-null messages
	suspend fun sendAll(messageGen: (Player)-> Frame.Text?) {
		sessions.values.forEach {
			val msg = messageGen(it) 
			if(msg != null) {
				send(msg, it.uuid)
			}
		}
	}

	/// this will terminate the game if the game is over
	suspend fun newProblem(): Boolean {
		for (player in sessions.values) {
			if (player.health <= 0) {
				close()
				return false
			}
		}

		problem = PROBLEM_SET.random()
		this.sendAll {
			createMessage(
				"problem",
				ProblemMessage(
					this.problem.description,
					this.problem.starterCode
				)
			)
		}
		return true

	}

    suspend fun close() {
        sessions.values.forEach {
            it.websocket.close(CloseReason(CloseReason.Codes.INTERNAL_ERROR, "closing"))
        }
        sessions.clear()
		onDispose()
    }
}
