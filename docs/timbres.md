# Como os timbres são feitos e conferidos

Os timbres do Tonebook são pontos de partida para uma guitarra com humbuckers (Epiphone Les Paul Special II). Quem
decide é o ouvido de quem toca; este documento junta o que ajuda a chegar lá mais rápido.

## De onde vem cada timbre

1. **O que se sabe da gravação**: entrevistas, rig rundowns, fotos do palco. Quando as fontes se contradizem, vale o
   que elas repetem. Em `shared/songs.ts`, o comentário de cada música diz o que é documentado e o que é estimativa.
2. **Sem fonte, o som da gravação**, e o `hint` avisa que é aproximação. Não se inventa efeito: o primeiro Let It
   Happen ganhou uma parte com fuzz que nenhuma fonte cita, e soou "bizarramente feio".
3. **A guitarra de quem toca.** Humbucker no lugar de single-coil pede menos graves no amp, corte de graves maior na
   caixa e, se preciso, o EQ de 6 bandas tirando 250 e 500 Hz e somando um pouco em 2 e 4 kHz.

## Regras que vieram de errar

- **Um timbre só quando a diferença vem da mão.** No Seven Nation Army, a primeira versão tinha um pitch uma oitava
  abaixo no riff e outra parte para o refrão. O certo é um timbre que responde ao palm muting: abafado no riff, a mão
  solta abre o refrão. Partes separadas só quando o timbre da gravação muda de fato (limpo e distorcido).
- **Fuzz apaga o palm muting.** O Big Muff comprime tanto que, medido, o riff abafado caía 7,8 dB entre as notas e o
  aberto 6,6 dB: nenhuma diferença. Ganho menor no fuzz, gate baixo (as notas abafadas chegam mais fracas e um gate
  alto corta) e menos graves. Para metal com palm muting, a receita é o TS9 com ganho baixo e volume alto na frente do
  amp, que aperta o grave.
- **Compressor tem que devolver o volume.** Ratio 0 é 1,1:1 (não comprime nada); com compressão de verdade, o ganho
  precisa devolver o que ela tira. O Let It Happen com limiar −30 dB, 8:1 e +9 dB saiu 10 dB abaixo dos outros
  presets; com −27 dB e +19 dB, voltou ao nível. Referência: −20 dB e 3:1 pedem uns +7 dB.
- **Gate para o chiado.** Fuzz com humbucker chia parado; o gate ligado deixa o silêncio limpo.
- **Faixas simétricas têm o neutro em 0,5** (volume e EQ do amp, bandas do EQ, realimentação do phaser e do
  flanger). Um phaser com "realimentação 0,3" tem realimentação negativa, não pouca.
- **Pitch depende do firmware** (±12 ou ±24 semitons): evite, ou diga no `hint` como corrigir.

## Medindo o som do pedal

O NanoCore é uma placa de som USB, e a entrada dela é o som já processado. Dá para gravar enquanto alguém toca e
comparar versões de um timbre trocando os parâmetros por MIDI no meio (`tools/midi send B0 <cc> <valor>`):

```bash
ffmpeg -f avfoundation -i ":0" -t 30 a.wav     # grava 30 s da saída do pedal (macOS)
ffmpeg -i a.wav -af astats -f null -           # nível RMS, pico e fator de crista
ffmpeg -i a.wav -lavfi "showspectrumpic=s=1400x420:legend=1:scale=log:fscale=lin:stop=8000" a.png   # espectrograma
```

O que olhar:

- **Nível**: na saída USB, os presets limpos de fábrica ficaram por volta de −37 dB RMS e os distorcidos entre −33
  e −26 dB. Um timbre novo muito abaixo disso vai soar "baixo demais".
- **Distribuição por faixa de frequência**: mais de 80 % da energia abaixo de 800 Hz e quase nada acima de 2,5 kHz é
  som fechado e embolado; muita energia entre 2,5 e 6 kHz num fuzz é chiado áspero.
- **Queda entre notas** (RMS em janelas de 20 ms, diferença entre os picos e os vales): mostra se o palm muting
  aparece ou se o drive está comprimindo tudo.
- Cuidado com o espectrograma em escala logarítmica de frequência: ele exagera a faixa abaixo de 80 Hz. Some a
  energia por faixa antes de concluir que há "ronco".

As comparações só valem com a mesma coisa tocada nas duas versões; peça trechos marcados (10 s abafado, pausa, 10 s
aberto).
