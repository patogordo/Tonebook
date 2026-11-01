# Decodifica o SysEx do NanoCore (F0 7D 4E 43 <tipo> <dados em grupos de 7 bits> F7) num log do tools/midi.
# Uso: python3 tools/decode.py log.txt [all]   (sem "all", esconde o batimento 0x68). Formato em docs/protocolo.md.
# Grupos: 1 byte com os bits altos (bit i = bit 7 do i-ésimo byte) + até 7 bytes com 7 bits cada.
# 0x70 pedido e 0x71 resposta: [02][seq u16][op u16](resposta: [status u8])[len u16][dados]; 0x72 aviso: [02][op u16][len u16][dados]
import sys, struct

def unpack(packed):
    out = []
    for i in range(0, len(packed), 8):
        msb, chunk = packed[i], packed[i + 1:i + 8]
        out += [b | (0x80 if msb >> j & 1 else 0) for j, b in enumerate(chunk)]
    return bytes(out)

def describe(kind, raw):
    if kind == 0x72:
        op, n = struct.unpack_from('<HH', raw, 1)
        return f'aviso op=0x{op:02x} len={n} dados={raw[5:5 + n].hex(" ")} {raw[5:5 + n]!r}'
    seq, op = struct.unpack_from('<HH', raw, 1)
    if kind == 0x71:
        status, n = raw[5], struct.unpack_from('<H', raw, 6)[0]
        return f'resposta seq={seq} op=0x{op:02x} status={status} len={n} dados={raw[8:8 + n].hex(" ")} {raw[8:8 + n]!r}'
    n = struct.unpack_from('<H', raw, 5)[0]
    return f'pedido seq={seq} op=0x{op:02x} len={n} dados={raw[7:7 + n].hex(" ")}'

for line in open(sys.argv[1]):
    if 'F0 7D 4E 43' not in line:
        continue
    t, hexs = line.split('<') if '<' in line else line.split('>')
    b = bytes.fromhex(hexs.strip())
    d = describe(b[4], unpack(b[5:-1]))
    if len(sys.argv) > 2 and sys.argv[2] == 'all' or 'op=0x68' not in d:
        print(t.strip(), d)
