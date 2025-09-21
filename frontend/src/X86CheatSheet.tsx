import React from 'react';

const X86CheatSheet: React.FC = () => {
  return (
    <div className="text-xs text-gray-300 space-y-4">
      {/* Registers */}
      <div>
        <h4 className="text-yellow-400 font-semibold mb-2">Registers (32-bit)</h4>
        <div className="space-y-1">
          <div><span className="text-green-400">EAX</span> - Accumulator (return values)</div>
          <div><span className="text-green-400">EBX</span> - Base register</div>
          <div><span className="text-green-400">ECX</span> - Counter (loops)</div>
          <div><span className="text-green-400">EDX</span> - Data register</div>
          <div><span className="text-green-400">ESP</span> - Stack pointer</div>
          <div><span className="text-green-400">EBP</span> - Base pointer (frame pointer)</div>
          <div><span className="text-green-400">ESI</span> - Source index</div>
          <div><span className="text-green-400">EDI</span> - Destination index</div>
        </div>
      </div>

      {/* Data Movement */}
      <div>
        <h4 className="text-yellow-400 font-semibold mb-2">Data Movement</h4>
        <div className="space-y-1 font-mono">
          <div><span className="text-blue-400">mov</span> dest, src - Move data</div>
          <div><span className="text-blue-400">push</span> src - Push to stack</div>
          <div><span className="text-blue-400">pop</span> dest - Pop from stack</div>
          <div><span className="text-blue-400">lea</span> dest, src - Load effective address</div>
        </div>
      </div>

      {/* Arithmetic */}
      <div>
        <h4 className="text-yellow-400 font-semibold mb-2">Arithmetic</h4>
        <div className="space-y-1 font-mono">
          <div><span className="text-blue-400">add</span> dest, src - Addition</div>
          <div><span className="text-blue-400">sub</span> dest, src - Subtraction</div>
          <div><span className="text-blue-400">mul</span> src - Multiply (unsigned)</div>
          <div><span className="text-blue-400">imul</span> src - Multiply (signed)</div>
          <div><span className="text-blue-400">div</span> src - Divide (unsigned)</div>
          <div><span className="text-blue-400">idiv</span> src - Divide (signed)</div>
          <div><span className="text-blue-400">inc</span> dest - Increment</div>
          <div><span className="text-blue-400">dec</span> dest - Decrement</div>
        </div>
      </div>

      {/* Logical Operations */}
      <div>
        <h4 className="text-yellow-400 font-semibold mb-2">Logical Operations</h4>
        <div className="space-y-1 font-mono">
          <div><span className="text-blue-400">and</span> dest, src - Bitwise AND</div>
          <div><span className="text-blue-400">or</span> dest, src - Bitwise OR</div>
          <div><span className="text-blue-400">xor</span> dest, src - Bitwise XOR</div>
          <div><span className="text-blue-400">not</span> dest - Bitwise NOT</div>
          <div><span className="text-blue-400">shl</span> dest, count - Shift left</div>
          <div><span className="text-blue-400">shr</span> dest, count - Shift right</div>
        </div>
      </div>

      {/* Comparison & Jumps */}
      <div>
        <h4 className="text-yellow-400 font-semibold mb-2">Comparison & Control Flow</h4>
        <div className="space-y-1 font-mono">
          <div><span className="text-blue-400">cmp</span> op1, op2 - Compare</div>
          <div><span className="text-blue-400">test</span> op1, op2 - Test (AND without storing)</div>
          <div><span className="text-blue-400">jmp</span> label - Unconditional jump</div>
          <div><span className="text-blue-400">je/jz</span> label - Jump if equal/zero</div>
          <div><span className="text-blue-400">jne/jnz</span> label - Jump if not equal/zero</div>
          <div><span className="text-blue-400">jl/jnge</span> label - Jump if less</div>
          <div><span className="text-blue-400">jg/jnle</span> label - Jump if greater</div>
          <div><span className="text-blue-400">jle/jng</span> label - Jump if less/equal</div>
          <div><span className="text-blue-400">jge/jnl</span> label - Jump if greater/equal</div>
        </div>
      </div>

      {/* Function Calls */}
      <div>
        <h4 className="text-yellow-400 font-semibold mb-2">Function Calls</h4>
        <div className="space-y-1 font-mono">
          <div><span className="text-blue-400">call</span> label - Call function</div>
          <div><span className="text-blue-400">ret</span> - Return from function</div>
          <div><span className="text-blue-400">enter</span> size, 0 - Function prologue</div>
          <div><span className="text-blue-400">leave</span> - Function epilogue</div>
        </div>
      </div>

      {/* Memory Addressing */}
      <div>
        <h4 className="text-yellow-400 font-semibold mb-2">Memory Addressing</h4>
        <div className="space-y-1 text-xs">
          <div><span className="text-purple-400">[ebp+8]</span> - Base + offset</div>
          <div><span className="text-purple-400">[esp]</span> - Stack top</div>
          <div><span className="text-purple-400">[eax+ebx*2]</span> - Base + index*scale</div>
          <div><span className="text-purple-400">DWORD PTR [...]</span> - 32-bit memory</div>
          <div><span className="text-purple-400">WORD PTR [...]</span> - 16-bit memory</div>
          <div><span className="text-purple-400">BYTE PTR [...]</span> - 8-bit memory</div>
        </div>
      </div>

      {/* Common Patterns */}
      <div>
        <h4 className="text-yellow-400 font-semibold mb-2">Common Patterns</h4>
        <div className="space-y-1 text-xs">
          <div className="text-gray-400">Zero a register:</div>
          <div className="ml-2 font-mono"><span className="text-blue-400">xor</span> eax, eax</div>
          <div className="text-gray-400 mt-1">Function setup:</div>
          <div className="ml-2 font-mono">
            <div><span className="text-blue-400">push</span> ebp</div>
            <div><span className="text-blue-400">mov</span> ebp, esp</div>
          </div>
          <div className="text-gray-400 mt-1">Loop counter:</div>
          <div className="ml-2 font-mono">
            <div><span className="text-blue-400">mov</span> ecx, 10</div>
            <div>loop_start:</div>
            <div><span className="text-blue-400">dec</span> ecx</div>
            <div><span className="text-blue-400">jnz</span> loop_start</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default X86CheatSheet;