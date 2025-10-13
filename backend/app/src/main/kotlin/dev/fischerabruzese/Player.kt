package dev.fischerabruzese

import dev.fischerabruzese.RecievedMessageType.*
import io.ktor.websocket.*
import kotlinx.coroutines.*
import io.ktor.server.websocket.*
import kotlin.concurrent.atomics.*

@OptIn(kotlin.concurrent.atomics.ExperimentalAtomicApi::class)
data class Player(
    val uuid: String,
	var name: String?,
    var websocket: DefaultWebSocketServerSession,
	var health: Int = 5,
)
