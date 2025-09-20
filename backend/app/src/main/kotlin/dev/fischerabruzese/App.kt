package dev.fischerabruzese

import io.ktor.server.application.*
import java.nio.file.Files
import java.nio.file.Paths

class App {
    fun sandboxScriptPath(): String {
        val path = Paths.get("src", "main", "python", "sandbox_python.py").toAbsolutePath().normalize()
        check(Files.isRegularFile(path)) { "sandbox_python.py not found at: $path" }
        return path.toString()
    }

    fun runSandboxedPython(code: String): String {
        val process =
            ProcessBuilder("python3", sandboxScriptPath())
                .redirectErrorStream(true)
                .start()

        process.outputStream.buffered().use { out ->
            out.write(code.toByteArray(Charsets.UTF_8))
            out.flush()
        }

        val output =
            process.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }

        val exit = process.waitFor()
        if (exit != 0) {
            throw RuntimeException("sandbox_python.py exited with $exit:\n$output")
        }

        return output.trimEnd('\r', '\n')
    }

    companion object {
        val testProblem = PythonProblem(
            description = "Return the sum of the first 101 fib numbers. The first 3 fib numbers are 0 1 1.",
            starterCode = "def solution():\n\treturn 0",
            solution = "500",
        )
    }
}

fun Application.module() {
    configureSockets()
    configureSerialization()
    configureRouting()
}


fun main(args: Array<String>) {
	io.ktor.server.netty.EngineMain.main(args)
}
