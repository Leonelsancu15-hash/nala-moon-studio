# Nala Moon Studio — Higgsfield-Pipeline (Prompts, Modelle, Einstellungen)

Alles, was Higgsfield für diese Seite erzeugt hat, mit den exakten Prompts, damit der Look später
ohne Raten nachgerollt oder erweitert werden kann. Kosten zum Zeitpunkt der Erstellung: 2 Credits
pro 2k-Bild, 135 Credits pro 15-s-Film (Seedance 2.0, 1080p); die verworfene 20-s-Fassung mit Seedance 2.5 kostete
180 Credits.

## Welt-Grammatik (byteidentischer Stil-Vorspann für Szenenbilder)

> Cinematic still from a premium brand film, photoreal, shot on a 50mm macro lens at f/2.8, shallow
> depth of field. Setting: a small cozy maker studio at night, very dark deep-indigo (#0b0a16) room,
> a single warm desk lamp glow from the upper left, faint cool moonlight from the right, tiny
> out-of-focus fairy-light bokeh far in the background. Color grade: deep indigo shadows, warm
> moon-gold (#f4cf6e) highlights, pearlescent lilac (#c9b8ff) sheen on printed surfaces, creamy
> (#f6efe4) speculars. Locked exposure, no motion blur, clean dark low-detail negative space at the
> frame edges. Absolutely no text, no letters, no words, no watermark, no logos.

Das Hero-Objekt (in jedem Szenenprompt gleich beschrieben):

> a small 3D-printed figurine of a crescent moon lying on its back like a cradle, with a tiny
> sleeping dog curled up inside the curve of the moon, printed in pearlescent silk PLA filament, the
> moon in shimmering gold-lilac, the dog in soft cream, with fine, visible, perfectly even horizontal
> layer lines. It stands on the dark textured PEI build plate of a 3D printer.

## Stills — Modell `nano_banana_2`, Auflösung `2k`, ein Batch (`generate_image_batch`)

| # | Verwendung | Format | Prompt (an den Vorspann angehängt) |
|---|---|---|---|
| 0 | Hero-Still, Referenz für beide Filme, Poster-Fallback, OG-Cover → `assets/img/hero-still*.jpg`, `og-cover.jpg` | 16:9 | …the finished figurine sits centered, slightly below the middle of the frame, gentle three-quarter view, about 40% of the frame height, the printer nozzle out of frame, generous empty dark space around it, the build plate texture catching the warm light. |
| 1 | Material-Band → `assets/img/material-macro*.jpg` | 16:9 | Extreme macro photograph, cinematic, photoreal. The surface of a 3D print in pearlescent silk PLA filament, showing perfectly even horizontal layer lines sweeping diagonally from lower left to upper right, the iridescent lilac-gold sheen shifting across the ridges, shallow depth of field, the upper right third of the frame falling into dark deep-indigo emptiness. |
| 2 | „Meine Reise“ → `assets/img/origin-printer*.jpg` | 4:5 | A compact modern desktop 3D printer sits on a wooden desk in front of a window; through the window a large soft full moon hangs in a deep indigo night sky. A pale-gold satin gift ribbon with a bow is tied around the printer as if it were a present. On the print bed sits a tiny freshly printed cream-colored crescent moon. Quiet, intimate, cozy. No people. |
| 3 | Kontakt → `assets/img/packaging*.jpg` | 4:5 | A small open kraft cardboard gift box on the dark wooden desk, lined with pale lilac tissue paper, holding [Hero-Objekt]; beside it a cream paper tag with a tiny gold crescent-moon wax seal and a sprig of dried lavender. No people. |

### Produkt-Renderings (Konzepte, keine echten Produktfotos) — 4:5, 2k

Gemeinsamer Vorspann:

> Premium product photograph of a 3D-printed object, photoreal, 85mm lens, soft diffused light from
> the upper left, a faint warm gold rim light, on a seamless deep-indigo (#0b0a16) studio backdrop
> with a subtle soft glow behind the object, object centered with generous negative space, fine even
> layer lines visible, sharp focus. Color grade: deep indigo, moon gold #f4cf6e, pearlescent lilac
> #c9b8ff, cream #f6efe4.

| Datei | Objekt-Satz |
|---|---|
| `product-mond-namensschild` | a crescent moon name plaque about 20 cm wide in sparkling gold glitter PLA, the crescent cradling the word Nala in soft rounded raised cream lettering, with two tiny stars, propped upright, front view. The only text in the image is the word Nala. |
| `product-fantasy-kreatur` | a small articulated baby dragon figurine about 12 cm long, curled up, printed in iridescent silk PLA shifting between lilac, teal and gold, big friendly eyes, small wings, front three-quarter view. |
| `product-geburtstags-topper` | a birthday cake topper on a thin stick, shaped as a crescent moon with three small stars and a tiny sleeping dog, in sparkling gold glitter PLA, standing in a small cream-frosted cake seen close up. No letters, no numbers. |
| `product-alltagsheld-organizer` | a rounded geometric desk organizer in matte sage-green PETG holding a remote control, a smartphone and neatly coiled charging cables, three-quarter view. |
| `product-medaillen-halter` | a wall-mounted medal hanger in matte black and gold PLA shaped like a crescent moon with five small hooks along its lower edge, two sport medals on ribbons hanging from it, mounted on a dark wall. |
| `product-boho-vasen-set` | two ribbed wave-pattern vases in matte cream and dusty-rose PLA, one tall and one short, holding a few stems of dried pampas grass, three-quarter view. |

Alle Prompts enden mit *Absolutely no text, no letters, no watermark, no logos.* Die Seite liefert
verkleinerte JPG + WebP aus (1200 px und 600 px breit für 4:5, 1920/960 px für den Hero,
1800/900 px für das Makro).

## Der Film (Scroll-Scrub) — ein durchgehender Take, kein Schnitt

Referenzbild für beide Filme: Still #0 (Job `2bf88b4c-a694-4114-b95b-039b798b31b3`), als `image_references` übergeben (nicht als `start_image`,
denn der Film soll mit den ersten Schichten beginnen, nicht mit dem fertigen Objekt). Higgsfield
schlägt für diesen Prompt das Preset „IN THE DARK“ vor — mit `declined_preset_id` ablehnen, der
Scrub braucht genau diese Kamerafahrt.

**Desktop 16:9** — `seedance_2_0`, `duration: 15`, `resolution: 1080p`, `mode: std`, `genre: drama`,
`generate_audio: false`, `bitrate_mode: high` (Quelle: H.264 1920×1080, 24 fps). Der Prompt enthält
zusätzlich den Satz *„The printer's toolhead is plain, dark and unbranded, with no labels, no stickers
and no lettering.“* — eine erste Fassung mit `seedance_2_5` (`mode: omni_reference`, 20 s, 180 Credits)
war filmisch ebenfalls stark, zeigte aber KI-Kauderwelsch als Aufdruck auf dem Druckkopf und wurde
deshalb verworfen.

> One continuous single take, no cuts, no transitions: a cinematic 3D-printing timelapse in a cozy
> maker studio at night. Scene, subject, lighting and colour grade match the reference image exactly:
> the same small figurine of a crescent moon cradling a tiny sleeping dog, in pearlescent gold-lilac
> silk filament with fine even layer lines, on the same dark textured build plate, the same warm desk
> lamp at the upper left, the same dark deep-indigo room with soft fairy-light bokeh far behind. The
> film begins with only the lowest few layers of the crescent moon printed, glowing softly on the
> plate, the printer's nozzle and hotend hovering just above it and gliding smoothly. The figurine
> then grows steadily layer by layer like a real 3D-print timelapse: the crescent rises, then the
> little sleeping dog forms inside its curve, while the camera performs one slow, steady, gentle
> orbit of about 60 degrees around the build plate and softly pushes in. In the last two seconds the
> print is complete, the nozzle lifts away and out of frame, and the camera settles on a closer
> three-quarter hero angle of the finished figurine, centered, catching the warm light, brighter than
> the start, the closing beauty state. Constant slow speed, gentle ease only at the very start and
> end, locked exposure and white balance, no flicker, minimal motion blur, no camera shake, no
> handheld motion. The background stays dark, seamless, low-detail deep indigo #0b0a16 with clean
> dark negative space at all edges; the figurine stays centered the whole time. Colour grade: deep
> indigo shadows, warm moon-gold #f4cf6e highlights, pearlescent lilac #c9b8ff sheen, cream #f6efe4
> speculars. No on-screen text, no letters, no words, no watermark, no logos, no people, no hands.

**Hochkant 9:16 (Handys)** — `seedance_2_0`, `duration: 15`, `resolution: 1080p`, `mode: std`,
`genre: drama`, `generate_audio: false`, `bitrate_mode: high` (Quelle: H.264 1080×1920, 24 fps).
Gleicher Prompt, vorangestellt *„Vertical portrait video.“* und ergänzt um: *„The figurine and build
plate stay in the upper-middle of the tall frame, its centre at about 40 percent from the top, and the
lower third of the frame stays dark and empty for the whole take.“* (Orbit „about 50 degrees“.)

### Warum die Aufnahme so inszeniert ist (der Scrub-Vertrag)

Die Seite spielt den Film vor UND zurück, in der Geschwindigkeit des Scrolls, und hält jedes Bild als
Standbild. Deshalb: eine ununterbrochene Kamerabewegung (nie ein Schnitt), ein zentriertes Motiv mit
ruhigem Freiraum für den Text, ein dunkler, detailarmer Hintergrund, langsame konstante Bewegung,
fixierte Belichtung (kein Flackern), kaum Bewegungsunschärfe, kein eingebrannter Text — und ein
Anfangszustand, der sich vom Endzustand unterscheidet (erste Schichten → fertiges Objekt), damit der
Scroll eine Auflösung hat. Die Schichtenanzeige im HUD (412 Schichten) läuft synchron dazu.

### Encoding — `higgsfield/encode-film.sh`

```bash
export FFMPEG=/pfad/zu/ffmpeg   # optional, sonst ffmpeg aus dem PATH
bash higgsfield/encode-film.sh desktop  desktop-src.mp4  assets/film/nalamoon-desktop.mp4
bash higgsfield/encode-film.sh mobile   desktop-src.mp4  assets/film/nalamoon-mobile.mp4
bash higgsfield/encode-film.sh portrait portrait-src.mp4 assets/film/nalamoon-portrait.mp4
bash higgsfield/encode-film.sh poster   assets/film/nalamoon-desktop.mp4  assets/film/nalamoon-desktop-poster.jpg
bash higgsfield/encode-film.sh poster   assets/film/nalamoon-mobile.mp4   assets/film/nalamoon-mobile-poster.jpg
bash higgsfield/encode-film.sh poster   assets/film/nalamoon-portrait.mp4 assets/film/nalamoon-portrait-poster.jpg
# VP9-Fallbacks für Browser ohne H.264
bash higgsfield/encode-film.sh desktop-webm  desktop-src.mp4  assets/film/nalamoon-desktop.webm
bash higgsfield/encode-film.sh mobile-webm   desktop-src.mp4  assets/film/nalamoon-mobile.webm
bash higgsfield/encode-film.sh portrait-webm portrait-src.mp4 assets/film/nalamoon-portrait.webm
```

Desktop: 1080p, H.264 yuv420p, CRF 21, GOP 8, keine Szenenschnitt-Keyframes, stumm, faststart.
Mobil: Höhe ≤ 720, CRF 23, GOP 4. Hochkant: Breite ≤ 720, CRF 22, GOP 4. Poster sind exakt das
erste Bild des jeweiligen Encodes. `main.js` wählt: Hochkant-Handy → portrait, Breite ≤ 1024 → mobile,
sonst desktop; MP4 wenn H.264 dekodierbar ist, sonst WebM. Unter `prefers-reduced-motion` oder wenn
die Dateien fehlen bleibt das Poster stehen und die Seite funktioniert ohne Film.

## Nachrollen

- Neuer Look → Still #0 mit demselben Vorspann neu erzeugen, dann beide Filme mit dem neuen Still als
  `image_references`.
- Nur der Film → Film-Prompt mit dem vorhandenen Still #0 erneut ausführen.
- Weiteres Produkt → einen Produkt-Prompt kopieren und nur den Objekt-Satz ändern.
