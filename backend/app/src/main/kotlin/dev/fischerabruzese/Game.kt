package dev.fischerabruzese

import dev.fischerabruzese.RecievedMessageType.*
import io.ktor.websocket.*
import kotlinx.coroutines.*
import io.ktor.server.websocket.*
import kotlin.concurrent.atomics.AtomicBoolean
import kotlin.concurrent.atomics.AtomicReference

@OptIn(kotlin.concurrent.atomics.ExperimentalAtomicApi::class)
class Player(
    val uuid: String,
	var name: String?,
    val websocket: WebSocketServerSession,
	var game: Game?
) {
	val gameStarted = AtomicBoolean(false)
	val messageBox = AtomicReference<Frame.Text?>(null)

	suspend fun runIndividualGame() {
		websocket.outgoing.send(createMessage("success", Unit))
		delay(50)
		websocket.outgoing.send(
			createMessage("problem", ProblemMessage(App.riscVTestProblem.description, App.riscVTestProblem.starterCode)),
		)
		websocket.outgoing.send(
			createMessage("opponentCode", OpponentCode(App.riscVTestProblem.starterCode)),
		)
		for(player in game!!.players){
			if(player == this) continue

			websocket.outgoing.send(
				createMessage("oppInfo", OppInfo(player.name!!, "risc-v", game!!.health[player]!!))
			)
		}

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
				} catch (e: Exception) {
					println("pollInbox failed for $uuid: ${e.message}")
				}
			}
		}
	}

	suspend fun pollInbox() {
		while(true) {
			delay(100)
            val codeMessage = messageBox.load() ?: continue
            messageBox.store(null)
			websocket.send(codeMessage)
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
						val success = result.trim() == App.testProblem.solution
						val message = if(success) "" else "Incorrect Answer\n Output: ${result}"
						if(!success && game != null) {
							game!!.health[this] = game!!.health[this]!!.minus(1)
							val opponents = game?.players?.filter { it != this }
							game?.sendOppInfo(this)
						}

						websocket.outgoing.send(createMessage(
							"result",
							ResultMessage(success, message)
						))
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
	val health: MutableMap<Player, Int> = mutableMapOf<Player, Int>().also { map -> players.forEach { map[it] = 5 } }
	val previousProblems: MutableSet<RISCVProblem> = mutableSetOf()

    suspend fun play() {
        for (player in players) {
			player.gameStarted.store(true)
        }
    }

	suspend fun send(recievers: List<Player>, message: Frame.Text) {
		for (player in recievers) {
			player.messageBox.store(message)
		}
	}

	suspend fun sendOppInfo(self: Player) {
		for (player in players) {
			if(player == self) continue

			self.messageBox.store(createMessage("offInfo", OppInfo(player.name!!, "risc-v", health[player]!!)))
		}
	}
}
