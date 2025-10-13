package dev.fischerabruzese

import dev.fischerabruzese.RecievedMessageType.*
import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.*
import java.util.*
import kotlin.time.Duration.Companion.seconds

@kotlin.concurrent.atomics.ExperimentalAtomicApi
val gameManager = GameManager()
@kotlin.concurrent.atomics.ExperimentalAtomicApi
val consolePrinter = ConsolePrinter(gameManager)

@kotlin.concurrent.atomics.ExperimentalAtomicApi
// This is where most stuff happens. We listen for messages and handle them approperiately
private suspend fun handleSession(ws: DefaultWebSocketServerSession, gameRoomId: String) {
	// setup
	val game = gameManager.getGame(gameRoomId)
	val playerId = UUID.randomUUID().toString()
	val player = Player(playerId, playerId, ws)
	val status = game.join(player, ws)
	game.send(createMessage("join_status", JoinStatus(status)), player.uuid)

	// don't process messages until game starts
	while(!game.gameStarted.load()) {
		delay(500)
	}

	game.send(createMessage(
		"starting",
		Unit
	), player.uuid)

	game.send(createMessage(
		"problem",
		ProblemMessage(
			game.problem.description,
			game.problem.starterCode
		)
	), player.uuid)

	for (frame in ws.incoming) {
		when(frame.messageType()) {
            NAME -> {
				val msg = jsonParse<Name>((frame as Frame.Text).readText())
				player.name = msg.name
			}
            RECIEVED_CODE -> {
				val recieved = jsonParse<RecievedCode>((frame as Frame.Text).readText())
				game.sendAll {
					if(it == player) {
						null
					} else {
						createMessage(
							"opponentCode",
							OpponentCode(recieved.code)
						)
					}
				}
			}
            CODE_SUBMISSION -> {
				val codeObj = jsonParse<CodeSubmission>((frame as Frame.Text).readText())
				try {
					//run code
					val result = App.runSandboxedRISCV(codeObj.code)
					val success = result.trim() == game.problem.solution
					val message = 
						if(success) 
							"Correct Answer\n Output: ${result}" 
						else 
							"Incorrect Answer\n Output: ${result}"

					//heath update your opponent
					if(success) {
						game.sendAll { other -> 
							if(other==player) {
								null
							} else {
								player.health--
								createMessage(
									"healthUpdate",
									HealthUpdate(player.health)
								)
							}
						}
					}

					//TODO: Send opp info

					game.send(createMessage(
						"result", 
						ResultMessage(success, message)
					), player.uuid)

					if(success) {
						delay(1500)
						game.newProblem()
					}

				} catch (e: Exception) {
					//TODO: Send opp info

					game.send(createMessage(
						"result",
						ResultMessage(false, "Execution error: ${e.message}")
					), player.uuid)
				}
			}
            CLOSE -> {
				
			}
            UNSUPPORTED -> {
				
			}
        }
	}
}

@kotlin.concurrent.atomics.ExperimentalAtomicApi
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

    routing {
		webSocket("/ws/{room}") { 
			try {
				val room = call.parameters["room"]!!
				handleSession(this, room)
			} catch (e: Throwable) {
				close(CloseReason(CloseReason.Codes.CANNOT_ACCEPT, "closing"))
			}
		}
	}
}
