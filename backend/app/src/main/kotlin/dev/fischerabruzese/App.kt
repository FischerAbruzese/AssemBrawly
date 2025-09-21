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

        fun runSandboxedPython(code: String): String = runSandbox(sandboxPythonScriptPath(), code)

        fun runSandboxedRISCV(code: String): String {
            println("---Running RISC-V---\n$code\n---")
            val output = runSandbox(sandboxRISCVScriptPath(), code)
            println("---OUTPUT---\n$output\n---")
            return output
        }

        val testProblem = PythonProblem(
            description = "Return the sum of the first 50 fib numbers. The first 3 fib numbers are 0 1 1.",
            starterCode = "def solution():\n\treturn 0",
            // If you want correctness: "20365011073". If it's a placeholder, keep "500".
            solution = "500",
        )

        val riscVTestProblem = RISCVProblem(
            description = "Return the sum of the first 50 fib numbers. The first 3 fib numbers are 0 1 1.",
            starterCode = """
solution:
    # Return a 64-bit integer in a0.
    # Leaf function example (no calls needed). Place result in a0.
    li a0, 0
    ret
""".trimIndent(),
            // Same note as above about the expected answer.
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
