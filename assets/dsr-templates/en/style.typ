#let tweaselStyle(doc) = [
  #set page(margin: (bottom: 45mm))
  #set text(font: ("FiraGO", "Fira Sans", "PT Sans"), size: 12pt, lang: "en")
  #show link: underline
  #show link: set text(rgb("#214192"))
  #set text(hyphenate: true)

  #set page(footer: [
    #text[
      #set align(right)

      Page #counter(page).display() of #locate(loc => [ #counter(page).final(loc).at(0) ])
    ]

    #v(5mm)
    #set text(size: 8.7pt, rgb("#214192"))

    #rect(
      width: 100%,
      fill: rgb("#e0edf8"),
      outset: (x: 100%, top: 5mm, bottom: 100%),

      [
        #grid(
          columns: (19%, 28%, 26%, 27%),
          gutter: 5pt,

          [
            Datenanfragen.de e.#sym.space.thin;V. \
            Schreinerweg 6 \
            38126 Braunschweig \
            Germany
          ],
          [
            Listed in the register of associations of the district court of Braunschweig: \ VR 201732. Recognized as a public benefit organisation.
          ],
          [
            *Phone*: +49 531 209299 35 \
            *Fax*: +49 531 209299 36 \
            *Email*: info\@datenanfragen.de \
            *Web*: verein.datenanfragen.de
          ],
          [
            *Bank account for donations*: \
            Datenanfragen.de e. V. \
            DE42 8306 5408 0104 0851 40 \
            GENODEF1SLR \
            Deutsche Skatbank
          ]
        )
      ]
    )
  ], footer-descent: 0mm)

  #doc
]
