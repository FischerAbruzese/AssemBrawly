package dev.fischerabruzese

import io.ktor.server.application.*
import java.nio.file.Files
import java.nio.file.Paths
import java.util.concurrent.TimeUnit

class App {
    companion object {
        private fun scriptPath(file: String): String {
            val fromEnv = System.getenv("PY_SANDBOX_DIR")
                ?.let { Paths.get(it, file) }
            val candidates = listOfNotNull(
                fromEnv,
                Paths.get("python", file),
                Paths.get("src", "main", "python", file),
            )
            val hit = candidates.firstOrNull { Files.isRegularFile(it) }
            check(hit != null) {
                "$file not found; looked in: ${
                    candidates.joinToString { it.toAbsolutePath().toString() }
                }"
            }
            return hit.toAbsolutePath().normalize().toString()
        }

        private fun sandboxPythonScriptPath() = scriptPath("sandbox_python.py")
        private fun sandboxRISCVScriptPath() = scriptPath("sandboxed_riscv.py")

        private fun runSandbox(scriptPath: String, code: String, timeoutSeconds: Long = 30): String {
            val process = ProcessBuilder("python3", "-u", scriptPath)
                .redirectErrorStream(true)
                .start()

            process.outputStream.buffered().use { out ->
                out.write(code.toByteArray(Charsets.UTF_8))
                out.flush()
            }

            val output = process.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }

            val finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS)
            if (!finished) {
                process.destroyForcibly()
                throw RuntimeException("Sandbox timed out after $timeoutSeconds seconds")
            }

            val exit = process.exitValue()
            if (exit != 0) {
                throw RuntimeException("$scriptPath exited with $exit:\n$output")
            }

            return output.trimEnd('\r', '\n')
        }
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
