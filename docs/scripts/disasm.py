import json, capstone

DLL = r"C:\Program Files (x86)\Steam\steamapps\common\PUMP IT UP RISE\GameAssembly.dll"
data = open(DLL, "rb").read()

# map string-literal pointer RVA -> value
litmap = {}
for e in json.load(open(r"C:\piu_extract\il2cpp_out\stringliteral.json")):
    litmap[int(e["address"], 16)] = e["value"]

# also load method name map from script.json (address -> name) for call resolution
methmap = {}
try:
    sj = json.load(open(r"C:\piu_extract\il2cpp_out\script.json"))
    for m in sj.get("ScriptMethod", []):
        methmap[int(m["Address"], 16)] = m["Name"]
except Exception as ex:
    print("script.json load warn:", ex)

md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_64)
md.detail = True

# RVA - fileoffset delta in .text (from dump: 0x705430 - 0x704830)
DELTA = 0xC00

def disasm(name, rva_start, length=0x400):
    foff = rva_start - DELTA
    code = data[foff:foff+length]
    print(f"\n===== {name}  rva=0x{rva_start:x} foff=0x{foff:x} =====")
    for ins in md.disasm(code, rva_start):
        line = f"0x{ins.address:x}: {ins.mnemonic} {ins.op_str}"
        # RIP-relative resolution
        if 'rip' in ins.op_str:
            for op in ins.operands:
                if op.type == capstone.x86.X86_OP_MEM and op.mem.base == capstone.x86.X86_REG_RIP:
                    tgt = ins.address + ins.size + op.mem.disp
                    if tgt in litmap:
                        line += f"    ; STRLIT {litmap[tgt]!r}"
                    else:
                        line += f"    ; ->rva 0x{tgt:x}"
        # call target resolution
        if ins.mnemonic == 'call':
            try:
                tgt = int(ins.op_str, 16)
                if tgt in methmap:
                    line += f"    ; CALL {methmap[tgt]}"
            except: pass
        print(line)
        if ins.mnemonic == 'ret':
            break

disasm("SecurityPlayerPrefs..cctor", 0x705430, 0x600)
disasm("SecurityPlayerPrefs.Decrypt(byte[])", 0x705F10, 0x400)
disasm("SecurityPlayerPrefs.MakeHash", 0x705890, 0x400)
