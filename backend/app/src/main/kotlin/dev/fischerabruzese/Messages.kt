package dev.fischerabruzese

import io.ktor.websocket.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.*

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
)

data class JoinOptions(
    val action: String,
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
	val name: String ,
	val language: String,
)

@Serializable
data class RecievedCode(
	val code: String
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

fun Frame.messageType(): RecievedMessageType {
	when(this) {
		is Frame.Text -> {
			val message = Json.decodeFromString<JsonObject>(this.readText())
			val type = message["type"]?.jsonPrimitive?.content
			return when(type) {
				"join" -> RecievedMessageType.JOIN
				"create" -> RecievedMessageType.CREATE
				"submitUserCode" -> RecievedMessageType.CODE_SUBMISSION
				"userCode" -> RecievedMessageType.RECIEVED_CODE
				else -> RecievedMessageType.UNSUPPORTED
			}
		}
		is Frame.Close -> {
			return RecievedMessageType.CLOSE
		}
		else -> {
			throw Exception("Unsupported Frame Type")
		}
	}
	
}
