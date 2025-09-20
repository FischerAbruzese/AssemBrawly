package dev.fischerabruzese

import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.isActive
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.SerializationException
import kotlin.time.Duration.Companion.seconds
import java.util.UUID
import dev.fischerabruzese.*

val game = Game(mutableListOf())

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
			val playerID = UUID.randomUUID().toString()
			val player = Player(playerID, this)

			if(game.players.size >= 2) {
				for (p in game.players) {
					if (!p.websocket.isActive) {
						p.websocket.close(CloseReason(1000, "inactivity"))
						game.players.remove(p)
					}
				}
			}
			if(game.players.size >= 2) {
				val message = WebSocketMessage("info", InfoMessage("Too many players... Try again later"))
			}
			if(game.players.size < 2) {
				val message = WebSocketMessage("info", InfoMessage("Waiting for players..."))
				outgoing.send(Frame.Text(Json.encodeToString(message)))
			}
			if(game.players.size == 2) {
				playGame(game)
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
                        val result = app.runSandboxedPython(pythonCode)
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
