package dev.fischerabruzese

import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.SerializationException
import kotlin.time.Duration.Companion.seconds
import java.util.UUID
import dev.fischerabruzese.*
import dev.fischerabruzese.RecievedMessageType.*
import kotlinx.serialization.json.jsonPrimitive
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

val lobby = GameManager()
val consolePrinter = ConsolePrinter(lobby)

suspend fun DefaultWebSocketServerSession.waitForJoinMessage(timeoutMs: Long): JoinOptions? {
    return withTimeoutOrNull(timeoutMs) {
        for (frame in incoming) {
			when(frame.messageType()) {
                JOIN -> {
					val joinInfo = jsonParse<Join>((frame as Frame.Text).readText())
					return@withTimeoutOrNull JoinOptions("join", joinInfo.name, joinInfo.gameId)
				}
                CREATE -> {
					val joinInfo = jsonParse<Create>((frame as Frame.Text).readText())
					return@withTimeoutOrNull JoinOptions("create", joinInfo.name, null)
				}
				RECIEVED_CODE,
                CODE_SUBMISSION -> { 
					outgoing.send(createMessage("info", InfoMessage("You must send a join message first!"))) 
				}
				UNSUPPORTED -> {
					outgoing.send(createMessage("info", InfoMessage("You must send a join message first! (btw I don't recognize this message type)"))) 
				}
                CLOSE -> { throw IllegalStateException("Unreachable code") }
            }
        }
        null
    }
}

suspend fun DefaultWebSocketServerSession.executeJoinAction(joinMessage: JoinOptions, player: Player) {
	when (joinMessage.action) {
		"join" -> {
			when (lobby.addPlayerToGame(joinMessage.gameId, player)) {
				GameManager.ConnectToGame.SUCCESS -> {
					lobby.getGame(joinMessage.gameId!!)!!.play()
				}
				GameManager.ConnectToGame.NOT_ENOUGH_PLAYERS -> {
					outgoing.send(createMessage("not enough players", Unit))
				}
				GameManager.ConnectToGame.GAME_FULL -> {
					outgoing.send(createMessage("game full", Unit))
				}
			}
		}
		"create" -> {
			when (val game = lobby.addPlayerToGame(null, player)) {
				GameManager.ConnectToGame.SUCCESS -> {
					println("something really went wrong")
				}
				GameManager.ConnectToGame.NOT_ENOUGH_PLAYERS -> {
					val message = CreatedGame(player.game?.id ?: "something went wrong")
					outgoing.send(createMessage<CreatedGame>("created game", message))
				}
				GameManager.ConnectToGame.GAME_FULL -> {
					println("something really went wrong")
				}
			}

		}
		else -> {}
	}
}

suspend fun gameGarbageCollector(gameManager: GameManager) {
	while(true) {
		val deadGame = lobby.games.map {it.value}.find {it.players.all{it2 -> !it2.websocket.isActive}}
		if (deadGame != null) {
			gameManager.killGame(deadGame)
			delay(500)
		}
		else {
			delay(30_000)
		}
	}
}

suspend fun lobbyGarbageCollector(gameManager: GameManager) {
	while(true) {
		val player = lobby.lobby.find {!it.websocket.isActive}
		if (player != null) {
			gameManager.lobby.remove(player)
			delay(500)
		}
		else {
			delay(30_000)
		}
	}
}

fun Application.configureSockets() {
    install(WebSockets) {
        pingPeriod = 60.seconds
        timeout = 60.seconds
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }
    
    val app = App()

    launch {
        consolePrinter.startPrinting(this)
    }

	launch {
		gameGarbageCollector(lobby)
	}

	launch {
		lobbyGarbageCollector(lobby)
	}
    
    routing {
		webSocket("/2player") { 
			val playerID = UUID.randomUUID().toString()
			// println("---New Player Conected {$playerID}---")
			val player = Player(playerID, null, this, null)

			lobby.registerPlayer(player)

			val joinMessage = waitForJoinMessage(600000) 
			// println("---Recieved Join Message from ${playerID}---")
			if (joinMessage == null) {
				this.close(CloseReason(1000, "timeout"))	
			}
			else {
				player.name = joinMessage.name
				executeJoinAction(joinMessage, player)
			}

			try {
				player.passWebsocketControl()
			} finally {
			}
		}
	}
}
