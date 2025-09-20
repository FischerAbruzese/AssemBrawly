package dev.fischerabruzese

import io.ktor.websocket.*
import kotlinx.coroutines.*
import io.ktor.server.websocket.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class Player(
    val uuid: String,
    val websocket: WebSocketServerSession,
) {
	suspend fun runIndividualGame() {
		for (frame in websocket.incoming) {
			if (frame is Frame.Text) {
				val receivedText = frame.readText()
				// println("---Recieved---\n${receivedText}\n---")
				
				try {
					// Try to parse as JSON first
					val codeSubmission = Json.decodeFromString<CodeSubmission>(receivedText)
					val pythonCode = codeSubmission.code
					
					// Execute the code
					val result = App.runSandboxedPython(pythonCode)
					val success = result.trim() == App.testProblem.solution
					websocket.outgoing.send(createMessage(
						"result",
						ResultMessage(success)
					))

					// println("---Sent---\n${Json.encodeToString(wrappedResult)}\n---")
				} catch (e: Exception) {
					val errorMessage = ResultMessage(false, "Execution error: ${e.message}")
					val wrappedError = WebSocketMessage("result", errorMessage)
					websocket.outgoing.send(createMessage(
						"result",
						ResultMessage(false, "Execution error: ${e.message}")
					))

					// println("---Sent---\n${Json.encodeToString(wrappedError)}\n---")
				}
			}
		}
	}
}

class Game(
    val id: String,
    val players: MutableList<Player>,
) {
    suspend fun play() {
        for (player in players) {
            player.websocket.outgoing.send(
                createMessage("problem", ProblemMessage(App.testProblem.description, App.testProblem.starterCode)),
            )
        }

        coroutineScope {
            players.forEach { player ->
                launch {
                    player.runIndividualGame()
                }
            }
        }
    }
}

