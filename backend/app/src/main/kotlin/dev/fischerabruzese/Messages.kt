package dev.fischerabruzese

import io.ktor.websocket.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.*
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

inline fun <reified T> createMessage(
    typeLabel: String,
    message: T,
): Frame.Text {
    val wrappedMessage = WebSocketMessage(typeLabel, message)
    return Frame.Text(Json.encodeToString(wrappedMessage))
}

@Serializable
data class WebSocketMessage<T>(
    val type: String,
    val data: T,
)

/// OUTGOING
@Serializable
@Deprecated("Unused: may come back in a later release")
data class InfoMessage(
    val message: String,
)
@Serializable
@kotlin.concurrent.atomics.ExperimentalAtomicApi
// Message to send when we receive a websocket connection to a game
data class JoinStatus(
	val status: GameRoom.ConnectToGame
)
@Serializable
// Tell frontend we have a new problem
data class ProblemMessage(
    val description: String,
    val starterCode: String,
)
@Serializable
// Result of a code submission
data class ResultMessage(
    val success: Boolean,
    val message: String = "",
)
@Serializable
// telling you the opponents info
data class OppInfo(
	val name: String,
	val language: String,
	val health: Int,
	val console: String,
)
@Serializable
// telling you the opponents code
data class OpponentCode(
	val code: String
)
@Serializable
data class GameOver(
	val winner: String
)
@Serializable
// you should update your health
data class HealthUpdate(
	val newHealth: Int
)

/// INBOUND
@Serializable
data class Name(
	val name: String,
)
@Serializable
data class CodeSubmission(
    val code: String,
)
@Serializable
data class RecievedCode( // this is what we will send to the opponents
	val code: String
)

// Helpers
enum class RecievedMessageType {
    NAME,
    CODE_SUBMISSION,
    RECIEVED_CODE,
    CLOSE,
	UNSUPPORTED,
}

inline fun<reified T> jsonParse(message: String): T = Json.decodeFromString<WebSocketMessage<T>>(message).data

fun Frame.messageType(): RecievedMessageType {
    when(this) {
        is Frame.Text -> {
            try {
                val text = this.readText()
                val message = Json.decodeFromString<JsonObject>(text)
                return when(val type = message["type"]?.jsonPrimitive?.content) {
                    "name" -> {
                        RecievedMessageType.NAME
                    }
                    "submitUserCode" -> {
                        RecievedMessageType.CODE_SUBMISSION
                    }
                    "userCode" -> {
                        RecievedMessageType.RECIEVED_CODE
                    }
                    else -> {
                        RecievedMessageType.UNSUPPORTED
                    }
                }
            } catch (e: Exception) {
                return RecievedMessageType.UNSUPPORTED
            }
        }
        is Frame.Close -> {
            return RecievedMessageType.CLOSE
        }
        is Frame.Ping -> {
            return RecievedMessageType.UNSUPPORTED
        }
        is Frame.Pong -> {
            return RecievedMessageType.UNSUPPORTED
        }
        is Frame.Binary -> {
            return RecievedMessageType.UNSUPPORTED
        }
        else -> {
            throw Exception("Unsupported Frame Type: ${this::class.simpleName}")
        }
    }
}
