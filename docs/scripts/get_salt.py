import struct, hashlib
MD = r"C:\Program Files (x86)\Steam\steamapps\common\PUMP IT UP RISE\PUMP IT UP RISE_Data\il2cpp_data\Metadata\global-metadata.dat"
d = open(MD,'rb').read()
i32 = lambda o: struct.unpack_from('<i', d, o)[0]

# v31 header offsets
stringOffset            = i32(0x18); stringCount            = i32(0x1C)
fieldDefaultValuesOffset= i32(0x40); fieldDefaultValuesCount= i32(0x44)
fddataOffset            = i32(0x48); fddataCount            = i32(0x4C)
fieldsOffset            = i32(0x60); fieldsCount            = i32(0x64)
print("strings@%x n=%x  fieldDV@%x n=%x  fddata@%x n=%x  fields@%x n=%x" % (
    stringOffset,stringCount,fieldDefaultValuesOffset,fieldDefaultValuesCount,fddataOffset,fddataCount,fieldsOffset,fieldsCount))

target_name = b"434F6148ACE61A5FBC4E3558F8EBF2C5D6B7548B8D6FFF049B7589394381B2A6"
target_hash = "434f6148ace61a5fbc4e3558f8ebf2c5d6b7548b8d6fff049b7589394381b2a6"

# find name offset in strings blob (relative index)
pos = d.find(target_name, stringOffset, stringOffset+stringCount)
nameIndex = pos - stringOffset
print("nameIndex:", nameIndex)

# fields table: Il2CppFieldDefinition { int32 nameIndex; int32 typeIndex; uint32 token } = 12 bytes (v24.1+)
field_row = None
for k in range(fieldsCount//12):
    ni = i32(fieldsOffset + k*12)
    if ni == nameIndex:
        field_row = k; break
print("field index:", field_row)

# FieldDefaultValues: { int32 fieldIndex; int32 typeIndex; int32 dataIndex } =12
found=None
for k in range(fieldDefaultValuesCount//12):
    fi = i32(fieldDefaultValuesOffset + k*12 + 0)
    if fi == field_row:
        typeIdx = i32(fieldDefaultValuesOffset + k*12 + 4)
        dataIdx = i32(fieldDefaultValuesOffset + k*12 + 8)
        found=(typeIdx,dataIdx); break
print("defaultvalue:", found)
typeIdx, dataIdx = found
base = fddataOffset + dataIdx
# try lengths and verify sha256
for L in (32,16,24,48,8,64):
    salt = d[base:base+L]
    if hashlib.sha256(salt).hexdigest()==target_hash:
        print(f"\n*** SALT FOUND len={L} ***")
        print("hex:", salt.hex())
        print("bytes:", salt)
        break
else:
    print("no length matched; raw 40 bytes:", d[base:base+40].hex())
