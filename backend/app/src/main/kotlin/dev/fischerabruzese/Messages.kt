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

@Serializable
data class InfoMessage(
    val message: String,
)

@Serializable
data class ProblemMessage(
    val description: String,
    val starterCode: String,
)

@Serializable
data class ResultMessage(
    val success: Boolean,
    val message: String = "",
)

@Serializable
data class CodeSubmission(
    val code: String,
)

@Serializable
data class Join(
    val gameId: String,
	val name: String,
)

@Serializable
data class Create(
	val name: String,
)


data class JoinOptions(
    val action: String,
	val name: String,
    val gameId: String?,
)

@Serializable
data class CreatedGame(
    val id: String,
)

@Serializable
data class OpponentCode(
	val code: String
)

@Serializable
data class OppInfo(
	val name: String,
	val language: String,
	val health: Int,
	val console: String,
)

@Serializable
data class HealthUpdate(
	val newHealth: Int
)

@Serializable
data class RecievedCode(
	val code: String
)

@Serializable
data class GameOver(
	val winner: String
)

enum class RecievedMessageType {
    JOIN,
    CREATE,
    RECIEVED_CODE,
    CODE_SUBMISSION,
    CLOSE,
	UNSUPPORTED,
}

inline fun<reified T> jsonParse(message: String): T = Json.decodeFromString<WebSocketMessage<T>>(message).data

// Enhanced message type detection with logging
fun Frame.messageType(): RecievedMessageType {
    when(this) {
        is Frame.Text -> {
            try {
                val text = this.readText()
                val message = Json.decodeFromString<JsonObject>(text)
                return when(val type = message["type"]?.jsonPrimitive?.content) {
                    "join" -> {
                        debugLogMessage("PARSE", "Detected JOIN message")
                        RecievedMessageType.JOIN
                    }
                    "create" -> {
                        debugLogMessage("PARSE", "Detected CREATE message")
                        RecievedMessageType.CREATE
                    }
                    "submitUserCode" -> {
                        debugLogMessage("PARSE", "Detected CODE_SUBMISSION message")
                        RecievedMessageType.CODE_SUBMISSION
                    }
                    "userCode" -> {
                        debugLogMessage("PARSE", "Detected RECIEVED_CODE message")
                        RecievedMessageType.RECIEVED_CODE
                    }
                    else -> {
                        debugLogMessage("PARSE", "Unknown message type: '$type'")
                        RecievedMessageType.UNSUPPORTED
                    }
                }
            } catch (e: Exception) {
                debugLogMessage("PARSE_ERROR", "Failed to parse text frame: ${e.message}")
                return RecievedMessageType.UNSUPPORTED
            }
        }
        is Frame.Close -> {
            debugLogMessage("PARSE", "Detected CLOSE frame")
            return RecievedMessageType.CLOSE
        }
        is Frame.Ping -> {
            debugLogMessage("PARSE", "Received PING frame (shouldn't reach messageType)")
            return RecievedMessageType.UNSUPPORTED
        }
        is Frame.Pong -> {
            debugLogMessage("PARSE", "Received PONG frame (shouldn't reach messageType)")
            return RecievedMessageType.UNSUPPORTED
        }
        is Frame.Binary -> {
            debugLogMessage("PARSE", "Received BINARY frame (unsupported)")
            return RecievedMessageType.UNSUPPORTED
        }
        else -> {
            debugLogMessage("PARSE_ERROR", "Unknown frame type: ${this::class.simpleName}")
            throw Exception("Unsupported Frame Type: ${this::class.simpleName}")
        }
    }
}

private fun debugLogMessage(category: String, message: String) {
    // val timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss.SSS"))
    // System.err.println("[$timestamp] [MSG_$category] $message")
}
