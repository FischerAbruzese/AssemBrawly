package dev.fischerabruzese

import kotlinx.serialization.Serializable

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
    val type: String,
    val code: String,
)

@Serializable
data class JoinMessage(
    val type: String,
    val action: String,
    val gameId: String,
)
