package dev.fischerabruzese

import com.charleskorn.kaml.Yaml
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import java.io.File

@Serializable
data class RISCVProblem(
    val description: String,
    val starterCode: String,
    val solution: String,
)

@Serializable
data class RISCVProblems(
    val problems: List<RISCVProblem>,
)

val PROBLEM_SET = loadProblemsFromResource("problems.yaml")

fun loadProblemsFromResource(resourcePath: String): List<RISCVProblem> =
    try {
        val classLoader = Thread.currentThread().contextClassLoader
        val inputStream =
            classLoader.getResourceAsStream(resourcePath)
                ?: throw IllegalArgumentException("Resource not found: $resourcePath")

        val yamlContent = inputStream.bufferedReader().use { it.readText() }
        loadProblemsFromString(yamlContent)
    } catch (e: Exception) {
        println("Error reading resource file: ${e.message}")
        emptyList()
    }

fun loadProblemsFromString(yamlContent: String): List<RISCVProblem> =
    try {
        val problemsContainer = Yaml.default.decodeFromString<RISCVProblems>(yamlContent)
        problemsContainer.problems
    } catch (e: Exception) {
        println("Error parsing YAML: ${e.message}")
        emptyList()
    }
