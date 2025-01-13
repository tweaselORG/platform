#import "style.typ": tweaselStyle
#show: tweaselStyle

#let request = json("access.json")

#text[
  #set align(right)

  Your request from: #request.requestDate

  Our reference: #request.reference \
  Date: #request.responseDate
]

#v(5em)

= Your request for access according to Art. 15 GDPR regarding your proceedings on the Tweasel platform

#v(1em)

Hi,

thank you very much for requesting access to your data through the Tweasel website. We're glad that you're interested in how we're processing your data.

#block(stroke: 2.5pt + rgb("#214192"), inset: 5mm, radius: 1mm)[
  #show heading: set text(rgb("#214192"))

  #grid(
    columns: (auto, auto),
    gutter: 5mm,

    image("book-info.svg", width: 20mm),
    [
      == Results of your request

      *We can confirm that we are not storing data about the proceedings* you have specified. This may because you have previously requested the deletion of these proceedings, or because the token(s) you have specified is/are wrong.

      We never employ any profiling or other forms of automated decision-making according to Art. 22(1 and 4) GDPR under any circumstances.
    ],
  )
]

This response was generated automatically based on the proceeding tokens/URLs you have provided (see below). We have done our best to ensure that it contains all the necessary information. However, if you believe that some data is missing in this automated response or if you have further questions, you can of course always contact us.

Please note that in order to process your request, we of course had to process the data you provided. In particular, those are the following proceeding tokens/URLs:

#for token in request.proceedingTokens [
  - #raw(token)
]

For more details on how we do process data, please have a look at the Tweasel privacy policy: https://www.tweasel.org/privacy

We would like to use this opportunity to point out the rights to rectification, erasure, restriction of processing, data portability, and objection you have thanks to the GDPR. You can learn more about them in the privacy policy we have linked above. We also recommend our blog post on this topic: https://www.datarequests.org/blog/your-gdpr-rights/ \
In addition to that, you have the right to complain to a data protection authority if you believe that we wrongfully process your data. We also have a post on that topic: https://www.datarequests.org/supervisory-authorities/

We hope to have answered your questions. If you would like to learn more or have additional questions, please don't hesitate to contact us again.

Best regards \
from the Tweasel developers
