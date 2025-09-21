import React from "react";

const RiscVCheatSheet: React.FC = () => {
  return (
    <div className="text-xs text-gray-300 space-y-4">
      {/* Integer Arithmetic */}
      <div>
        <h4 className="font-semibold text-gray-100 mb-2">Integer Arithmetic</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div><code className="text-green-400">add rd, rs1, rs2</code> - Add</div>
          <div><code className="text-green-400">sub rd, rs1, rs2</code> - Subtract</div>
          <div><code className="text-green-400">addi rd, rs1, imm</code> - Add immediate</div>
          <div><code className="text-green-400">addw rd, rs1, rs2</code> - Add word (32-bit)</div>
          <div><code className="text-green-400">subw rd, rs1, rs2</code> - Sub word (32-bit)</div>
          <div><code className="text-green-400">addiw rd, rs1, imm</code> - Add immediate word</div>
        </div>
      </div>

      {/* Logical Operations */}
      <div>
        <h4 className="font-semibold text-gray-100 mb-2">Logical Operations</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div><code className="text-green-400">and rd, rs1, rs2</code> - Bitwise AND</div>
          <div><code className="text-green-400">or rd, rs1, rs2</code> - Bitwise OR</div>
          <div><code className="text-green-400">xor rd, rs1, rs2</code> - Bitwise XOR</div>
          <div><code className="text-green-400">andi rd, rs1, imm</code> - AND immediate</div>
          <div><code className="text-green-400">ori rd, rs1, imm</code> - OR immediate</div>
          <div><code className="text-green-400">xori rd, rs1, imm</code> - XOR immediate</div>
        </div>
      </div>

      {/* Shift Operations */}
      <div>
        <h4 className="font-semibold text-gray-100 mb-2">Shift Operations</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div><code className="text-green-400">sll rd, rs1, rs2</code> - Shift left logical</div>
          <div><code className="text-green-400">srl rd, rs1, rs2</code> - Shift right logical</div>
          <div><code className="text-green-400">sra rd, rs1, rs2</code> - Shift right arithmetic</div>
          <div><code className="text-green-400">slli rd, rs1, shamt</code> - Shift left logical imm</div>
          <div><code className="text-green-400">srli rd, rs1, shamt</code> - Shift right logical imm</div>
          <div><code className="text-green-400">srai rd, rs1, shamt</code> - Shift right arithmetic imm</div>
        </div>
      </div>

      {/* Load/Store */}
      <div>
        <h4 className="font-semibold text-gray-100 mb-2">Load/Store</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div><code className="text-green-400">ld rd, offset(rs1)</code> - Load doubleword (64-bit)</div>
          <div><code className="text-green-400">sd rs2, offset(rs1)</code> - Store doubleword</div>
          <div><code className="text-green-400">lw rd, offset(rs1)</code> - Load word (32-bit)</div>
          <div><code className="text-green-400">sw rs2, offset(rs1)</code> - Store word</div>
          <div><code className="text-green-400">lh rd, offset(rs1)</code> - Load halfword (16-bit)</div>
          <div><code className="text-green-400">sh rs2, offset(rs1)</code> - Store halfword</div>
          <div><code className="text-green-400">lb rd, offset(rs1)</code> - Load byte (8-bit)</div>
          <div><code className="text-green-400">sb rs2, offset(rs1)</code> - Store byte</div>
        </div>
      </div>

      {/* Compare and Set */}
      <div>
        <h4 className="font-semibold text-gray-100 mb-2">Compare and Set</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div><code className="text-green-400">slt rd, rs1, rs2</code> - Set if less than</div>
          <div><code className="text-green-400">sltu rd, rs1, rs2</code> - Set if less than unsigned</div>
          <div><code className="text-green-400">slti rd, rs1, imm</code> - Set if less than imm</div>
          <div><code className="text-green-400">sltiu rd, rs1, imm</code> - Set if less than imm unsigned</div>
        </div>
      </div>

      {/* Branch Instructions */}
      <div>
        <h4 className="font-semibold text-gray-100 mb-2">Branch Instructions</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div><code className="text-green-400">beq rs1, rs2, label</code> - Branch if equal</div>
          <div><code className="text-green-400">bne rs1, rs2, label</code> - Branch if not equal</div>
          <div><code className="text-green-400">blt rs1, rs2, label</code> - Branch if less than</div>
          <div><code className="text-green-400">bge rs1, rs2, label</code> - Branch if greater/equal</div>
          <div><code className="text-green-400">bltu rs1, rs2, label</code> - Branch if less than unsigned</div>
          <div><code className="text-green-400">bgeu rs1, rs2, label</code> - Branch if greater/equal unsigned</div>
        </div>
      </div>

      {/* Jump Instructions */}
      <div>
        <h4 className="font-semibold text-gray-100 mb-2">Jump Instructions</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div><code className="text-green-400">jal rd, label</code> - Jump and link</div>
          <div><code className="text-green-400">jalr rd, rs1, offset</code> - Jump and link register</div>
          <div><code className="text-green-400">j label</code> - Jump (pseudo: jal x0, label)</div>
          <div><code className="text-green-400">jr rs1</code> - Jump register (pseudo: jalr x0, rs1, 0)</div>
        </div>
      </div>

      {/* Upper Immediate */}
      <div>
        <h4 className="font-semibold text-gray-100 mb-2">Upper Immediate</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div><code className="text-green-400">lui rd, imm</code> - Load upper immediate</div>
          <div><code className="text-green-400">auipc rd, imm</code> - Add upper immediate to PC</div>
        </div>
      </div>

      {/* Registers */}
      <div>
        <h4 className="font-semibold text-gray-100 mb-2">Register Names</h4>
        <div className="text-xs space-y-1">
          <div><code className="text-blue-400">x0</code> - Zero (always 0)</div>
          <div><code className="text-blue-400">x1 (ra)</code> - Return address</div>
          <div><code className="text-blue-400">x2 (sp)</code> - Stack pointer</div>
          <div><code className="text-blue-400">x3 (gp)</code> - Global pointer</div>
          <div><code className="text-blue-400">x4 (tp)</code> - Thread pointer</div>
          <div><code className="text-blue-400">x5-x7 (t0-t2)</code> - Temporaries</div>
          <div><code className="text-blue-400">x8-x9 (s0-s1)</code> - Saved registers</div>
          <div><code className="text-blue-400">x10-x17 (a0-a7)</code> - Arguments/return values</div>
          <div><code className="text-blue-400">x18-x27 (s2-s11)</code> - Saved registers</div>
          <div><code className="text-blue-400">x28-x31 (t3-t6)</code> - Temporaries</div>
        </div>
      </div>

      {/* Common Pseudoinstructions */}
      <div>
        <h4 className="font-semibold text-gray-100 mb-2">Common Pseudoinstructions</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div><code className="text-yellow-400">li rd, imm</code> - Load immediate</div>
          <div><code className="text-yellow-400">mv rd, rs1</code> - Move (addi rd, rs1, 0)</div>
          <div><code className="text-yellow-400">not rd, rs1</code> - NOT (xori rd, rs1, -1)</div>
          <div><code className="text-yellow-400">neg rd, rs1</code> - Negate (sub rd, x0, rs1)</div>
          <div><code className="text-yellow-400">nop</code> - No operation (addi x0, x0, 0)</div>
          <div><code className="text-yellow-400">ret</code> - Return (jalr x0, x1, 0)</div>
        </div>
      </div>
    </div>
  );
};

export default RiscVCheatSheet;