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
import kotlinx.serialization.json.jsonPrimitive

val lobby = GameManager()


suspend fun DefaultWebSocketServerSession.waitForJoinMessage(timeoutMs: Long): JoinOptions? {
    return withTimeoutOrNull(timeoutMs) {
        for (frame in incoming) {
            when (frame) {
                is Frame.Text -> {
                    try {
						println("---Recieved---\n${frame.readText()}\n---")
                        val message = Json.decodeFromString<JsonObject>(frame.readText())
						if(message["type"]?.jsonPrimitive?.content == "join") {
							val joinObject = Json.decodeFromJsonElement<WebSocketMessage<Join>>(message)
							return@withTimeoutOrNull JoinOptions(joinObject.type, joinObject.data.gameId)
						}
						if(message["type"]?.jsonPrimitive?.content == "create") {
							return@withTimeoutOrNull JoinOptions("create", null)
						}
                    } catch (e: Exception) {
						println("---Parse Error---\n${e.message}\n---")
					}
                }
                else -> {}
            }
        }
        null
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
    
    routing {
		webSocket("/2player") { 
			println("---\nNew Player Conected")

			val playerID = UUID.randomUUID().toString()
			val player = Player(playerID, this)


			val joinMessage = waitForJoinMessage(600000) 
			println("---Decoded Join Message---\n${joinMessage}\n---")
			if (joinMessage == null) {
				this.close(CloseReason(1000, "timeout"))	
			}

			when (joinMessage?.action) {
				"join" -> {
					when (lobby.addPlayerToGame(joinMessage.gameId, player)) {
						GameManager.ConnectToGame.SUCCESS -> {
							outgoing.send(createMessage("success", Unit))
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
							val message = CreatedGame(lobby.playerGame(player)?.id ?: "something went wrong")
							outgoing.send(createMessage<CreatedGame>("created game", message))
						}
						GameManager.ConnectToGame.GAME_FULL -> {
							println("something really went wrong")
						}
					}

				}
				else -> {}
			}

			for (frame in incoming) {
				when(frame) {
					is Frame.Close -> {}
					else -> {}
				}
			}
		}

        webSocket("/ws") {
            // Send problem description on connection
            val problemMessage = ProblemMessage(App.testProblem.description, App.testProblem.starterCode)
            val wrappedProblem = WebSocketMessage("problem", problemMessage)
            outgoing.send(Frame.Text(Json.encodeToString(wrappedProblem)))

			println("---Sent---\n${Json.encodeToString(wrappedProblem)}\n---")
            
            for (frame in incoming) {
                if (frame is Frame.Text) {
                    val receivedText = frame.readText()
					println("---Recieved---\n${receivedText}\n---")
                    
                    try {
                        // Try to parse as JSON first
                        val codeSubmission = Json.decodeFromString<CodeSubmission>(receivedText)
                        val pythonCode = codeSubmission.code
                        
                        // Execute the code
                        val result = App.runSandboxedPython(pythonCode)
                        val success = result.trim() == App.testProblem.solution
                        val resultMessage = ResultMessage(success)
                        val wrappedResult = WebSocketMessage("result", resultMessage)
                        outgoing.send(Frame.Text(Json.encodeToString(wrappedResult)))

						println("---Sent---\n${Json.encodeToString(wrappedResult)}\n---")
                    } catch (e: Exception) {
                        val errorMessage = ResultMessage(false, "Execution error: ${e.message}")
                        val wrappedError = WebSocketMessage("result", errorMessage)
                        outgoing.send(Frame.Text(Json.encodeToString(wrappedError)))

						println("---Sent---\n${Json.encodeToString(wrappedError)}\n---")
                    }
                }
            }
        }
    }
}
