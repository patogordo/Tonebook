// Sonda de MIDI do NanoCore para macOS (CoreMIDI). Escuta a fonte "Nanocore" e imprime cada mensagem em hex;
// envia bytes (PC, CC ou SysEx) para o destino "Nanocore" e mostra o que o pedal responde.
// Compilar: swiftc -O tools/midi.swift -o tools/midi
// Usar:     tools/midi listen <segundos> > log.txt     tools/midi send C0 3F 1.0   (último número com ponto: segundos ouvindo)
// O CoreMIDI entrega a saída do pedal a todo cliente conectado, então dá para ouvir as respostas ao app oficial.
import CoreMIDI
import Foundation

func name(_ e: MIDIEndpointRef) -> String {
    var s: Unmanaged<CFString>?
    MIDIObjectGetStringProperty(e, kMIDIPropertyDisplayName, &s)
    return (s?.takeRetainedValue() as String?) ?? "?"
}
let args = CommandLine.arguments
guard let src = (0..<MIDIGetNumberOfSources()).map(MIDIGetSource).first(where: { name($0) == "Nanocore" }),
      let dst = (0..<MIDIGetNumberOfDestinations()).map(MIDIGetDestination).first(where: { name($0) == "Nanocore" })
else { print("Nanocore não encontrado"); exit(1) }

var client = MIDIClientRef(), inPort = MIDIPortRef(), outPort = MIDIPortRef()
MIDIClientCreateWithBlock("probe" as CFString, &client, nil)
let t0 = Date()
MIDIInputPortCreateWithBlock(client, "in" as CFString, &inPort) { list, _ in
    for p in list.unsafeSequence() {
        // pacote de SysEx pode passar dos 256 bytes da tupla `data`: lê pelo ponteiro
        let off = MemoryLayout<MIDIPacket>.offset(of: \MIDIPacket.data)!
        let bytes = Array(UnsafeRawBufferPointer(start: UnsafeRawPointer(p) + off, count: Int(p.pointee.length)))
        print(String(format: "%7.3f <", Date().timeIntervalSince(t0)), bytes.map { String(format: "%02X", $0) }.joined(separator: " "))
        fflush(stdout)
    }
}
MIDIPortConnectSource(inPort, src, nil)
MIDIOutputPortCreate(client, "out" as CFString, &outPort)

var listenFor = 5.0
if args.count > 1, args[1] == "send" {
    let hex = args.dropFirst(2).filter { $0.count == 2 }.compactMap { UInt8($0, radix: 16) }
    if let last = args.last, last.contains(".") { listenFor = Double(last)! }
    var pl = MIDIPacketList(); let pkt = MIDIPacketListInit(&pl)
    _ = MIDIPacketListAdd(&pl, 1024, pkt, 0, hex.count, hex)
    print(String(format: "%7.3f >", Date().timeIntervalSince(t0)), hex.map { String(format: "%02X", $0) }.joined(separator: " "))
    MIDISend(outPort, dst, &pl)
} else if args.count > 2 { listenFor = Double(args[2])! }
RunLoop.main.run(until: Date().addingTimeInterval(listenFor))
