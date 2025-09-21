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
        print("\u001b[2J\u001b[H") // Console Clear
        
        println("┌─ LOBBY (${lobby.size}) ───────────────────────────────────────────────────────────────")
        if (lobby.isEmpty()) {
            println("│  No players waiting")
        } else {
            lobby.forEach { player ->
                println("│  ${player.uuid.take(8)}... - ${if (player.websocket.isActive) "CONNECTED" else "DISCONNECTED"}")
            }
        }
        println("└─────────────────────────────────────────────────────────────────────────")
        println()
        
        println("┌─ ACTIVE GAMES (${games.size}) ───────────────────────────────────────────────────────")
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
                        println("│    $prefix Player: ${player.uuid.take(8)}... (${if (player.websocket.isActive) "CONNECTED" else "DISCONNECTED"})")
                    }
                }
                if (count != games.size-1) println("│")
            }
        }
        println("└──────────────────────────────────────────────────────────────────────────")
        
        val totalPlayers = lobby.size + games.map{ it.value }.sumOf{ it.players.size }
        println()
        println("Total Players: $totalPlayers | Waiting: ${lobby.size} | In Games: ${games.map{ it.value }.sumOf { it.players.size }}")
		println("Uptime: ${java.time.Duration.between(starttime, java.time.LocalTime.now()).run { 
			String.format("%02d:%02d:%02d", toHours(), toMinutesPart(), toSecondsPart()) 
		}}")
        println()
    }
}

