package dev.fischerabruzese

import io.ktor.server.application.*
import java.nio.file.Files
import java.nio.file.Paths
import java.util.concurrent.TimeUnit

class App {
    companion object {
        private fun sandboxPythonScriptPath(): String {
            val path = Paths.get(
                "src", "main", "python", "sandbox_python.py"
            ).toAbsolutePath().normalize()
            check(Files.isRegularFile(path)) {
                "sandbox_python.py not found at: $path"
            }
            return path.toString()
        }

        private fun sandboxRISCVScriptPath(): String {
            val path = Paths.get(
                "src", "main", "python", "sandboxed_riscv.py"
            ).toAbsolutePath().normalize()
            check(Files.isRegularFile(path)) {
                "sandboxed_riscv.py not found at: $path"
            }
            return path.toString()
        }

        fun runSandboxedPython(code: String): String = runSandbox(sandboxPythonScriptPath(), code)

        fun runSandboxedRISCV(code: String): String = runSandbox(sandboxRISCVScriptPath(), code)

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
