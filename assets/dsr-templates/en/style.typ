#let tweaselStyle(doc) = [
  #set page(numbering: (current, total) => "Page " + str(current) + " of " + str(total), number-align: end)
  #set text(font: ("FiraGO", "Fira Sans", "PT Sans"), size: 12pt, lang: "en")
  #show link: underline
  #show link: set text(rgb("#214192"))
  #set text(hyphenate: true)

  #doc
]
