#import "style.typ": tweaselStyle
#show: tweaselStyle

#let request = json("erasure.json")

#text[
  #set align(right)

  Your request from: #request.requestDate

  Our reference: #request.reference \
  Date: #request.responseDate
]

#v(5em)

= Your request for erasure according to Art. 17 GDPR regarding your proceedings on the Tweasel platform

#v(1em)

Hi,

thank you for requesting erasure of your proceedings on the Tweasel platform. We are happy that you are interested in how we process your data! We will of course gladly answer your request.

*We can confirm that we have deleted the data about the proceeding(s)* you have specified. In particular, we have deleted any attachments and files you have uploaded and revoked the token(s), so the proceeding(s) can no longer be accessed. We will keep the analysis metadata and technical data (like the collected traffic and detected tracking data transmissions) even after the erasure. This information is not connected to you in any way, it is only about the analyzed app.

#if not request.allTokensFound [
  Note that we have not been able to find the followning proceeding tokens you have provided:

  #for token in request.tokensNotFound [
    - #raw(token)
  ]

  This may because you have previously requested the erasure of these proceedings, or because some tokens you have specified are wrong. In any case, since we have no data on these proceedings, we are of course also not able to perform an erasure for them.
]

This response was generated automatically based on the proceeding tokens/URLs you have provided (see below). We have done our best to ensure that it is accurate and contains all the necessary information. However, if you believe that we have missed something or if you have further questions, you can of course always contact us.

Please note that in order to process your request, we of course had to process the data you provided. In particular, those are the following proceeding tokens/URLs:

#for token in request.proceedingTokens [
  - #raw(token)
]

For more details on how we do process data, please have a look at the Tweasel privacy policy: https://www.tweasel.org/privacy

We would like to use this opportunity to point out the rights to access, rectification, restriction of processing, data portability, and objection you have thanks to the GDPR. You can learn more about them in the privacy policy we have linked above. We also recommend our blog post on this topic: https://www.datarequests.org/blog/your-gdpr-rights/ \
In addition to that, you have the right to complain to a data protection authority if you believe that we wrongfully process your data. We also have a post on that topic: https://www.datarequests.org/supervisory-authorities/

We hope to have answered your questions. If you would like to learn more or have additional questions, please don't hesitate to contact us again.

Best regards \
from the Tweasel developers
