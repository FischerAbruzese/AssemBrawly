package dev.fischerabruzese

import kotlinx.coroutines.*
import kotlinx.coroutines.delay
import java.time.format.DateTimeFormatter;

@kotlin.concurrent.atomics.ExperimentalAtomicApi
class ConsolePrinter(private val gameManager: GameManager) {
    private var isRunning = false
	private val starttime = java.time.LocalTime.now()
    
    fun startPrinting(scope: CoroutineScope) {
        if (isRunning) return
        isRunning = true
		print("\u001b[30;1H\u001b[0J") 
        
        scope.launch {
            while (isRunning) {
                gameManager.printGameState()
                delay(1000)
            }
        }
    }
    
    fun stop() {
        isRunning = false
    }
    
    private fun GameManager.printGameState() {
		print("\u001b[2J")

        println("┌─ ACTIVE GAMES (${games.size}) ────────────────────────────────────────────────────────")
        if (games.isEmpty()) {
            println("│  No active games")
        } else {
			var count = 0
            games.forEach { game ->
				val players = game.value.playersIterDebug()
                println("│  Game ${game.value.id}:")
                if (players.isEmpty()) {
                    println("│    └─ No players")
                } else {
                    players.forEachIndexed { index, player ->
                        val prefix = if (index ==  players.size - 1) "└─" else "├─"
						val playerName = (player.name ?: "Player").take(8) + if (player.name!!.length > 8) "..." else ""
                        println("│    $prefix ${playerName}: ${player.uuid.take(8)}... (${if (player.websocket.isActive) "CONNECTED" else "DISCONNECTED"})")
                    }
                }
                if (count != games.size-1) println("│")
            }
        }
        println("└───────────────────────────────────────────────────────────────────────────")
        
        val totalPlayers = games.map{ it.value }.sumOf{ it.playersIterDebug().size }
        println()
        println("Total Players: $totalPlayers")
		println("Uptime: ${java.time.Duration.between(starttime, java.time.LocalTime.now()).run { 
			String.format("%02d:%02d:%02d", toHours(), toMinutesPart(), toSecondsPart()) 
		}}")
    }
}

