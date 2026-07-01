import json, bisect, struct, pefile

DLL = r"C:\Program Files (x86)\Steam\steamapps\common\PUMP IT UP RISE\GameAssembly.dll"
pe = pefile.PE(DLL, fast_load=True)
data = open(DLL, "rb").read()

# section map: (rva_start, rva_end, raw_ptr)
secs = []
for s in pe.sections:
    secs.append((s.VirtualAddress, s.VirtualAddress + max(s.Misc_VirtualSize, s.SizeOfRawData), s.PointerToRawData, s.Name.decode(errors='ignore').strip('\x00')))
def rva_to_off(rva):
    for a,b,p,n in secs:
        if a<=rva<b: return p + (rva-a)
    return None
def off_to_rva(off):
    for a,b,p,n in secs:
        if p<=off<p+(b-a): return a + (off-p)
    return None

# methods sorted
sj = json.load(open(r"C:\piu_extract\il2cpp_out\script.json"))
meths=[]
for m in sj.get("ScriptMethod",[]):
    x=m["Address"]; x=int(x,16) if isinstance(x,str) else int(x); meths.append((x,m["Name"]))
meths.sort(); maddr=[a for a,_ in meths]
def method_of(rva):
    i=bisect.bisect_right(maddr,rva)-1
    return meths[i][1] if i>=0 else "?"

targets = {0x42C22D0:'previewAudio',0x42C5760:'.ogg',0x42C56D8:'DataAssets',
           0x42B6D10:'/DataAssets/',0x42B7460:'.meta',0x4263A48:'.bank',0x42C15C8:'10201/preview'}

hits={v:set() for v in targets.values()}
# scan both code sections
for secname in ('.text','il2cpp'):
    sec=[s for s in secs if s[3]==secname][0]
    a,b,p,n_ = sec
    raw = pe.sections[[s.Name.decode(errors='ignore').strip('\x00') for s in pe.sections].index(secname)].SizeOfRawData
    blob=data[p:p+raw]
    n=len(blob); i=0
    while i < n-7:
        if 0x48 <= blob[i] <= 0x4f and blob[i+1] in (0x8b,0x8d) and (blob[i+2] & 0xC7)==0x05:
            disp = struct.unpack_from('<i', blob, i+3)[0]
            ins_rva = a + (i)  # rva = section_va + offset_in_section
            tgt = ins_rva + 7 + disp
            if tgt in targets:
                hits[targets[tgt]].add(ins_rva)
        i += 1

for name,addrs in hits.items():
    print(f"\n### '{name}': {len(addrs)} refs")
    seen=set()
    for a in sorted(addrs):
        mth=method_of(a)
        if mth in seen: continue
        seen.add(mth)
        print(f"   0x{a:x}  {mth}")
