package dev.fischerabruzese

import dev.fischerabruzese.RecievedMessageType.*
import io.ktor.websocket.*
import kotlinx.coroutines.*
import io.ktor.server.websocket.*
import kotlin.concurrent.atomics.*

@OptIn(kotlin.concurrent.atomics.ExperimentalAtomicApi::class)
class Player(
    val uuid: String,
	var name: String?,
    val websocket: DefaultWebSocketServerSession,
	var game: Game?
) {
	val gameStarted = AtomicBoolean(false)
	val messageBox = AtomicReference<List<Frame>>(listOf())

	suspend fun runIndividualGame() {
		delay(50)
		websocket.outgoing.send(
			createMessage("opponentCode", OpponentCode(game!!.currentProblem.starterCode)),
		)
		for(player in game!!.players){
			if(player == this) continue

			websocket.outgoing.send(
				createMessage("oppInfo", OppInfo(player.name ?: "name missing", "risc-v", game!!.health[player]!!, ""))
			)
		}

		try {
			coroutineScope {
				launch {
					try {
						handleIncoming()
					} catch (e: Exception) {
						println("handleIncoming failed for $uuid: ${e.message}")
					}
				}
				launch {
					try {
						pollInbox()
					} catch (e: ReturnToLobby) {
						throw ReturnToLobby()
					}
					catch (e: Exception) {
						println("pollInbox failed for $uuid: ${e.message}")
					}
				}
			}
		} catch (e: ReturnToLobby) {
			return
		}
	}

	private class ReturnToLobby: Throwable()

	suspend fun pollInbox() {
		while(true) {
			delay(100)
			while(messageBox.load().isNotEmpty()) {
				val message = messageBox.fetchAndUpdate { it.drop(1) }.first()
				System.err.println("Sending -> ${this.name!!}: ${(message as Frame.Text).readText()}".take(80))
				websocket.send(message)
			}
			if(!gameStarted.load()) {
				throw ReturnToLobby()
			}
		}
	}

	//aka handle incoming messages
	suspend fun handleIncoming() {
		for (frame in websocket.incoming) {
			when(frame.messageType()) {
                JOIN -> {
					websocket.outgoing.send(createMessage("info", InfoMessage("You're in a game you can't send me a join message :(")))
				}
                CREATE -> {
					websocket.outgoing.send(createMessage("info", InfoMessage("You're in a game you can't send me a create message :(")))
				}
				RECIEVED_CODE -> {
					if (game == null) {
						throw Exception("In game loop, but player doesn't know their game")
					}
					val opponents = game?.players?.filter { it != this }
					val code = jsonParse<RecievedCode>((frame as Frame.Text).readText())
					game?.send(opponents!!, createMessage("opponentCode", OpponentCode(code.code)))
				}
                CODE_SUBMISSION -> {
					val codeObj = jsonParse<CodeSubmission>((frame as Frame.Text).readText())
					// println("---Recieved code from $uuid---\n${codeObj.code.prependIndent("\t|")}\n---")
					try {
						val result = App.runSandboxedRISCV(codeObj.code)
						val success = result.trim() == game!!.currentProblem.solution
						val message = if(success) "Correct Answer\n Output: ${result}" else "Incorrect Answer\n Output: ${result}"

						//heath update your opponent
						if(success) {
							for(player in game!!.players) {
								if(player==this) continue
								val newHealth = game!!.health[player]!!.minus(1)
								game!!.health[player] = newHealth
								game!!.send(listOf(player), createMessage(
									"healthUpdate",
									HealthUpdate(newHealth)
								))
							}
						}
						game?.sendOppInfo(this, message)

						websocket.outgoing.send(createMessage(
							"result",
							ResultMessage(success, message)
						))

						if(success) {
							delay(1500)
							game!!.newProblem()
						}
					} catch (e: Exception) {
						val errorMessage = ResultMessage(false, "Execution error: ${e.message}")
						val wrappedError = WebSocketMessage("result", errorMessage)
						websocket.outgoing.send(createMessage(
							"result",
							ResultMessage(false, "Execution error: ${e.message}")
						))
					}
				}
                UNSUPPORTED -> {
					websocket.outgoing.send(createMessage("info", InfoMessage("unsupported message type :(")))
				}
                CLOSE -> {return}
            }
		}
	}

	suspend fun passWebsocketControl() {
		var waitTime = 0
		while(!gameStarted.load() && waitTime < 300000) { // 5 min timeout
			delay(1000)
			waitTime += 1000
		}
		if (!gameStarted.load()) {
			throw Exception("Game start timeout")
		}
		runIndividualGame()
	}
}

@OptIn(kotlin.concurrent.atomics.ExperimentalAtomicApi::class)
class Game(
    val id: String,
    val players: MutableList<Player>,
) {
	val health: MutableMap<Player, Int> = mutableMapOf<Player, Int>()
	val previousProblems: MutableSet<RISCVProblem> = mutableSetOf()
	private var problemQueue: MutableList<RISCVProblem> = PROBLEM_SET.shuffled().toMutableList()
	lateinit var currentProblem: RISCVProblem;

    suspend fun play() {
		players.forEach { health[it] = 5 }
		send(players, createMessage("success", Unit))
		newProblem()
        for (player in players) {
			player.gameStarted.store(true)
        }
    }

	suspend fun send(recievers: List<Player>, message: Frame) {
		for (player in recievers) {
			player.messageBox.update{ it + message }
		}
	}

	suspend fun sendOppInfo(self: Player, console: String) {
		for (player in players) {
			if(player == self) continue

			player.messageBox.update { it + createMessage("oppInfo", OppInfo(player.name!!, "risc-v", health[self]!!, console)) }
		}
	}

	suspend fun newProblem() {
		val losers = health.filter { it.value == 0 }
		if(losers.isNotEmpty()) {
			send(players, createMessage("gameOver", GameOver(players.find { !(it in losers) }!!.name!!)))
			delay(1000)
			for (player in players) {
				player.gameStarted.store(false)
			}
			players.clear()
			return
		}

		var problem = problemQueue.removeFirstOrNull()

		if(problem == null) {
			problemQueue.addAll(PROBLEM_SET.shuffled())
			problem = problemQueue.removeFirstOrNull()
		}

		currentProblem = problem!!

		send(players, createMessage(
			"problem",
			ProblemMessage(problem.description, problem.starterCode)
		))
	}
}
