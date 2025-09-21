package dev.fischerabruzese

import kotlinx.coroutines.*
import kotlinx.coroutines.delay
import java.time.format.DateTimeFormatter;

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
		// // Move to your starting position (e.g., line 5)
		// print("\u001b[0;1H")
		//
		// // Clear only your reserved lines (e.g., 15 lines)
		// repeat(15) {
		// 	print("\u001b[K") // Clear current line
		// 	if (it < 14) print("\n") // Move to next line (except last)
		// }
		//
		// // Move back to start and print your content
		// print("\u001b[0;1H")
		print("\u001b[2J")

        println("┌─ LOBBY (${lobby.size}) ───────────────────────────────────────────────────────────────")
        if (lobby.isEmpty()) {
            println("│  No players waiting")
        } else {
            lobby.forEach { player ->
                println("│  ${player.uuid.take(8)}... - ${if (player.websocket.isActive) "CONNECTED" else "DISCONNECTED"}")
            }
        }
        println("└───────────────────────────────────────────────────────────────────────────")
        println()
        
        println("┌─ ACTIVE GAMES (${games.size}) ────────────────────────────────────────────────────────")
        if (games.isEmpty()) {
            println("│  No active games")
        } else {
			var count = 0
            games.forEach { game ->
                println("│  Game ${game.value.id}:")
                if (game.value.players.isEmpty()) {
                    println("│    └─ No players")
                } else {
                    game.value.players.forEachIndexed { index, player ->
                        val prefix = if (index == game.value.players.size - 1) "└─" else "├─"
						val playerName = (player.name ?: "Player").take(8) + if (player.name!!.length > 8) "..." else ""
                        println("│    $prefix ${playerName}: ${player.uuid.take(8)}... (${if (player.websocket.isActive) "CONNECTED" else "DISCONNECTED"})")
                    }
                }
                if (count != games.size-1) println("│")
            }
        }
        println("└───────────────────────────────────────────────────────────────────────────")
        
        val totalPlayers = lobby.size + games.map{ it.value }.sumOf{ it.players.size }
        println()
        println("Total Players: $totalPlayers | Waiting: ${lobby.size} | In Games: ${games.map{ it.value }.sumOf { it.players.size }}")
		println("Uptime: ${java.time.Duration.between(starttime, java.time.LocalTime.now()).run { 
			String.format("%02d:%02d:%02d", toHours(), toMinutesPart(), toSecondsPart()) 
		}}")
    }
}

