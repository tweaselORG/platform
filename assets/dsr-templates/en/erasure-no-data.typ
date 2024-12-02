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

*We can confirm that we are not storing data about the proceedings* you have specified. As such, we are of course also not able to perform an erasure. This may because you have previously requested the deletion of these proceedings, or because the token(s) you have specified is/are wrong.

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
