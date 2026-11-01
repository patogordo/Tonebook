# Timbre de música para o LIVTRA NanoCore

MÚSICA: <escreva aqui o nome da música e do artista>
GUITARRA: Epiphone Les Paul Special II, dois humbuckers
MODELOS CARREGADOS: <opcional: os amps e caixas do seu pedal; vazio vale qualquer um da lista>

Você vai montar o timbre de guitarra da música acima para a pedaleira LIVTRA NanoCore e devolver **só um JSON**, sem
texto antes ou depois, sem comentários e sem bloco de código. O JSON vai ser colado num site que confere tudo e
manda para o pedal; qualquer campo fora do formato faz o site recusar.

## Quem toca

- A guitarra da linha GUITARRA. Com humbucker e a gravação em single-coil (Strat, Tele, Jazzmaster), compense: menos
  graves no amp, corte de graves maior na caixa e, se precisar, o EQ de 6 bandas tirando 250 e 500 Hz e somando um
  pouco em 2 e 4 kHz. Com single-coil e a gravação em humbucker, o contrário.
- Diga no `hint` qual microfone usar (braço, ponte ou chave no meio) e como tocar.

## Como pensar o timbre

1. Parta do que se sabe da gravação (equipamento citado em entrevistas, rig rundowns). Sem fonte, parta do som que se
   ouve e escreva no `hint` que é uma aproximação. Não invente efeito que a gravação não tem.
2. **Um timbre só** quando a diferença entre trechos vem da mão: palm muting no riff e a mão solta no refrão, volume
   da guitarra, palhetada mais forte. Drive com ganho moderado comprime menos e deixa essa diferença aparecer; gate
   baixo para não cortar as notas abafadas.
3. Só separe em partes (até 4) quando o timbre da gravação muda de fato, como limpo e distorcido.
4. Volume equilibrado: o pedal não pode ficar baixo nem estourar. Compressor sempre com o ganho devolvendo o que a
   compressão tira (limiar −27 dB e 8:1 pedem uns +19 dB; −20 dB e 3:1, uns +7 dB). Volume do amp entre 0,75 e 0,95,
   volume do drive entre 0,6 e 0,85, volume dos efeitos entre 0,8 e 1.

## Formato

```
{
  "title": "Nome da música",
  "artist": "Artista",
  "parts": [
    {
      "name": "Riff",
      "hint": "Em português, até 300 caracteres: microfone, técnica e o porquê do timbre.",
      "tone": {
        "amp": "VXAC30",
        "cab": "AC30212",
        "blocks": {
          "fx1": { "on": true, "type": 0, "params": [0.4] },
          "amp": { "on": true, "params": [0.5, 0.5, 0.5, 0.5, 0.8] }
        }
      }
    }
  ]
}
```

- `title` e `artist` até 60 caracteres; `name` da parte até 30 ("Guitarra", "Riff", "Refrão", "Solo"…).
- `blocks` aceita `fx1`, `fx2`, `amp`, `cab`, `mod`, `delay`, `reverb` e `eq`. Bloco que não aparece fica desligado.
- Cada bloco tem `on` (true ou false), `type` (o ID das tabelas; `amp` e `cab` não têm) e `params`: **todos** os
  parâmetros do tipo, na ordem da tabela, cada um de **0 a 1**.
- O valor é linear na faixa do parâmetro: valor = (alvo − mínimo) ÷ (máximo − mínimo). Ex.: delay BBD de 360 ms na
  faixa 1–2000 ms → 0,18. Faixa simétrica (−10 a +10 dB, −95 a +95) tem o neutro em 0,5.
- Com `fx2` nos tipos 8, 9 ou 10 (pitch e wahs), deixe `mod` desligado: os dois usam os mesmos controles.
- Evite o Pitch: dependendo do firmware a faixa é ±12 ou ±24 semitons, então o mesmo valor muda de nota.

## Amp e caixa

Use só estes nomes, que são os modelos de fábrica do NanoCore. Se a linha MODELOS CARREGADOS estiver preenchida,
escolha só entre eles, porque o pedal pode não ter todos.

Amps (`amp`):

- `BogXTC1`: Bogner Ecstasy (XTC), tom 1
- `BogXTC2`: Bogner Ecstasy (XTC), tom 2
- `ENGP1`: ENGL Powerball, tom 1
- `ENGP2`: ENGL Powerball, tom 2
- `Fd59Bm`: Fender '59 Bassman
- `Fd65Dk`: Fender '65 Darkface, limpo
- `Hiw103`: Hiwatt DR103
- `MarDSL1`: Marshall DSL50, tom 1
- `MarDSL2`: Marshall DSL50, tom 2
- `Mar8001`: Marshall JCM800, tom 1
- `Mar8002`: Marshall JCM800, tom 2
- `MesR1`: Mesa Rectifier, tom 1
- `MesR2`: Mesa Rectifier, tom 2
- `MesR3`: Mesa Rectifier, tom 3
- `OgG120`: Orange Graphic 120
- `Pey51501`: Peavey 5150, tom 1
- `Pey51502`: Peavey 5150, tom 2
- `Pey6505`: Peavey 6505
- `RanT21`: Randall T2, tom 1
- `RanT22`: Randall T2, tom 2
- `RoJC120`: Roland JC-120, limpo
- `SLO1001`: Soldano SLO-100, tom 1
- `SLO1002`: Soldano SLO-100, tom 2
- `SLO1003`: Soldano SLO-100, tom 3
- `VXAC30`: Vox AC30
- `ApSVTVR`, `ApSVTCL`, `Adn900`, `Hiw320`, `MarSup`: amps de baixo, não use para guitarra

Caixas (`cab`):

- `Bog412A`: Bogner 4x12, tom A
- `Bog412B`: Bogner 4x12, tom B
- `Eng412A`: ENGL 4x12 Vintage 30, tom A
- `Eng412B`: ENGL 4x12 Vintage 30, tom B
- `FdTR212`: Fender Twin Reverb 2x12
- `Fd59BM410`: Fender '59 Bassman 4x10
- `Hiw412`: Hiwatt 4x12
- `Mar412A`: Marshall 4x12 V30, tom A
- `Mar412B`: Marshall 4x12 V30, tom B
- `Mar96412A`: Marshall 1960B 4x12, tom A
- `Mar96412B`: Marshall 1960B 4x12, tom B
- `Mes412A`: Mesa 4x12 V30, tom A
- `Mes412B`: Mesa 4x12 V30, tom B
- `Mes412C`: Mesa 4x12 V30, tom C
- `Og412`: Orange 4x12 V30
- `pey412A`: Peavey 5150 4x12, tom A
- `pey412B`: Peavey 5150 4x12, tom B
- `peyVk412`: Peavey Valveking 4x12
- `Ran112A`: Randall 1x12, tom A
- `Ran112B`: Randall 1x12, tom B
- `Ran112C`: Randall 1x12, tom C
- `SLO412A`: Soldano 4x12, tom A
- `SLO412B`: Soldano 4x12, tom B
- `SLO412C`: Soldano 4x12, tom C
- `AC30212`: Vox AC30 2x12
- `Mar412`: Marshall 4x12
- `AP810`, `Ap410`, `Adn410`, `HiwB410`: caixas de baixo, não use para guitarra

## Parâmetros

Amp e caixa:

| Bloco | Parâmetros, em ordem | Faixas |
| --- | --- | --- |
| amp | Ganho, Graves, Médios, Agudos, Volume | Ganho 0–1; Graves, Médios, Agudos e Volume de −10 a +10 dB (0,5 = neutro) |
| cab | Corte de graves, Corte de agudos, Volume | Sem faixa no manual: corte de graves 0,3–0,65 (mais alto corta mais), corte de agudos 0,6–0,85 (mais alto deixa passar mais), volume 0,8 |

`fx1` (gate e compressor):

| type | Tipo | Parâmetros, em ordem | Faixas |
| --- | --- | --- | --- |
| 0 | Gate | Limiar | −100 a 0 dB |
| 1 | Auto Gate | nenhum | `params` vazio |
| 2 | Gate + Compressor | Gate, Limiar, Ratio, Knee, Ataque, Release, Ganho | Gate −100 a 0 dB; o resto como no compressor |
| 3 | Compressor | Limiar, Ratio, Knee, Ataque, Release, Ganho | Limiar −60 a 0 dB; Ratio 1,1:1 a 20:1; Knee 0 a 24 dB; Ataque 0 a 200 ms; Release 0 a 1000 ms; Ganho −24 a +24 dB |

`fx2` (drive, boost, pitch e wah):

| type | Tipo | Parâmetros, em ordem | Faixas |
| --- | --- | --- | --- |
| 0 | Scream (TS9) | Ganho, Tom, Volume | 0–1 cada |
| 1 | Klone | Ganho, Tom, Volume | 0–1 cada |
| 2 | OCD | Ganho, Tom, Volume | 0–1 cada |
| 3 | DS2 | Ganho, Tom, Volume | 0–1 cada |
| 4 | PiFuzz (Big Muff) | Ganho, Tom, Volume | 0–1 cada |
| 5 | Range (Rangemaster) | Boost | 0–1 |
| 6 | XAC (AC Booster) | Boost | 0–1 |
| 7 | Fiman (Friedman) | Boost | 0–1 |
| 8 | Pitch | Afinação, Fino, Mix, Volume | Afinação −12 a +12 st (ou ±24, conforme o firmware); Fino −1 a +1; Mix 0–100 |
| 9 | Envelope Wah | Frequência, Envelope, Q, Mix, Volume | Frequência 10 Hz a 20 kHz; Q 0,1 a 20; Mix 0–100 |
| 10 | Wah | Frequência, Varredura, Velocidade, Forma, Mix, Volume | Frequência 163 Hz a 3,5 kHz; Velocidade 0 a 8 Hz; Varredura, Forma e Mix 0–100 |

`mod` (modulação):

| type | Tipo | Parâmetros, em ordem | Faixas |
| --- | --- | --- | --- |
| 0 | Chorus | Velocidade, Profundidade, Volume | Velocidade 0,1 a 3,74 Hz; Profundidade 0 a 1 ms |
| 1 | Phaser | Velocidade, Realimentação, Mix, Volume | Velocidade 0,05 a 5 Hz; Realimentação −95 a +95 (0,5 = sem realimentação); Mix 0–100 (0,5 dá o phaser clássico) |
| 2 | Flanger | Velocidade, Realimentação, Mix, Volume | Velocidade 0,05 a 5 Hz; Realimentação −95 a +95 (0,5 = sem realimentação); Mix 0–100 |
| 3 | Tremolo | Velocidade, Profundidade, Onda, Suavidade, Mix, Volume | Velocidade 0,01 a 20 Hz; Profundidade 0–100; Onda: senoide, triângulo, quadrada, dente de serra; Suavidade 0 a 40 Hz |
| 4 | Vibrato | Velocidade, Profundidade, Onda, Mix, Volume | Velocidade 0,01 a 20 Hz; Profundidade 0 a 20 ms |

`delay`:

| type | Tipo | Parâmetros, em ordem | Faixas |
| --- | --- | --- | --- |
| 0 | BBD | Tempo, Realimentação, Idade, Mix, Volume | Tempo 1 a 2000 ms; Realimentação 0–95; Idade (escurece as repetições) 0–100; Mix 0–100. Analógico, tipo Memory Man e Carbon Copy |
| 1 | Digital | Tempo, Realimentação, Mix, Volume | Tempo 0,1 a 3000 ms; Realimentação 0–95; Mix 0–100 |
| 2 | Duck | Tempo, Realimentação, Filtro, Mix, Volume | Tempo 0,1 a 3000 ms; abaixa as repetições enquanto se toca |
| 3 | Ice | Tempo, Realimentação, Intervalo, Mix, Volume | Tempo 0,1 a 3000 ms; Intervalo −12 a +12 st |
| 4 | Reverse | Tempo, Realimentação, Mix, Volume | Tempo 0,1 a 3000 ms |
| 5 | LoFi | Tempo, Realimentação, Bits, Mix LoFi, Mix, Volume | Tempo 2 a 3000 ms; Bits 4 a 16 |
| 6 | Smear | Tempo, Realimentação, Smear, Filtro, Mix, Volume | Tempo 0,1 a 3000 ms |
| 7 | Mod | Tempo, Realimentação, Prof. da mod., Vel. da mod., Mix, Volume | Tempo 0,1 a 3000 ms; Prof. 0 a 20 ms; Vel. 0,05 a 5 Hz |

Calcule o tempo pelo andamento da música quando o eco é rítmico: colcheia = 30000 ÷ bpm ms; colcheia pontuada =
45000 ÷ bpm ms.

`reverb` (o `type` segue o guia de MIDI: 4 é Shimmer, 5 é Cloud e 6 é Spring):

| type | Tipo | Parâmetros, em ordem | Faixas |
| --- | --- | --- | --- |
| 0 | Room | Decaimento, Pré-delay, Tom, Mod, Mix, Volume | Decaimento 0,5 a 12 s; Pré-delay 0 a 80 ms; Tom, Mod e Mix 0–100 |
| 1 | Plate | Decaimento, Pré-delay, Tom, Mod, Mix, Volume | Decaimento 0,5 a 12 s; Pré-delay 0 a 80 ms |
| 2 | Hall | Decaimento, Pré-delay, Tom, Amortecer graves, Mix, Volume | Decaimento 0,5 a 12 s; Pré-delay 0 a 80 ms |
| 3 | Concert | Decaimento, Pré-delay, Amortecer agudos, Mod, Mix, Volume | Decaimento 0,5 a 12 s; Pré-delay 0 a 80 ms |
| 4 | Shimmer | Decaimento, Pré-delay, Tom, Afinação, Mix, Volume | Decaimento 0 a 12 s; Pré-delay 5 a 120 ms; Afinação −24 a +24 st |
| 5 | Cloud | Decaimento, Tom, Prof. da mod., Vel. da mod., Mix, Volume | Decaimento 1 a 100 s; Vel. 0,02 a 0,25 Hz |
| 6 | Spring | Decaimento, Pré-delay, Crossover, Mod, Mix, Volume | Decaimento 0 a 12 s; Pré-delay 5 a 80 ms; Crossover 800 Hz a 8 kHz |

`eq`:

| type | Tipo | Parâmetros, em ordem | Faixas |
| --- | --- | --- | --- |
| 0 | EQ de 3 bandas | Graves, Médios, Agudos | −15 a +15 dB cada (0,5 = neutro) |
| 1 | EQ de 6 bandas | 120 Hz, 250 Hz, 500 Hz, 1 kHz, 2 kHz, 4 kHz | −15 a +15 dB cada (0,5 = neutro) |
| 2 | EQ de 8 bandas | 60 Hz, 120 Hz, 250 Hz, 500 Hz, 1 kHz, 2 kHz, 4 kHz, 8 kHz | −15 a +15 dB cada (0,5 = neutro) |

## Exemplo completo

Seven Nation Army (The White Stripes), um timbre só para tocar o riff com palm muting e soltar a mão no refrão:

```json
{
  "title": "Seven Nation Army",
  "artist": "The White Stripes",
  "parts": [
    {
      "name": "Riff e refrão",
      "hint": "Microfone da ponte. Riff com palm muting: fica fechado e grave. Solte a mão no refrão e o fuzz abre, sem trocar de preset.",
      "tone": {
        "amp": "Fd59Bm",
        "cab": "Fd59BM410",
        "blocks": {
          "fx1": { "on": true, "type": 0, "params": [0.3] },
          "fx2": { "on": true, "type": 4, "params": [0.5, 0.45, 0.65] },
          "amp": { "on": true, "params": [0.5, 0.55, 0.6, 0.55, 0.8] },
          "cab": { "on": true, "params": [0.35, 0.6, 0.8] },
          "reverb": { "on": true, "type": 0, "params": [0.12, 0.05, 0.6, 0, 0.1, 1] }
        }
      }
    }
  ]
}
```

Agora responda só com o JSON da MÚSICA pedida no começo.
