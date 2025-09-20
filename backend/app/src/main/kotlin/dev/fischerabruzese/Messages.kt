package dev.fischerabruzese

import io.ktor.websocket.Frame
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

inline fun <reified T> createMessage(
    typeLabel: String,
    message: T,
): Frame.Text {
    val wrappedMessage = WebSocketMessage(typeLabel, message)
    println("---Sending Message---\n${Json.encodeToString(wrappedMessage)}\n---")
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
