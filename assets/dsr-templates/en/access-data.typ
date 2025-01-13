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

      Based on the information that you provided, *we can confirm that we are storing data about proceedings* you have initiated through Tweasel. This data _may_ include personal data as per the GDPR. We are providing you with a full copy of this data, which is explained on the following pages. #if request.dataPortabilityRequest [And since you have requested it, we are also attaching a copy of the data in a machine-readable format (JSON).]

      #if not request.allTokensFound [Note that we have not found stored data for all of the proceeding tokens/URLs you have provided. This may because you have previously requested the deletion of these proceedings, or because some tokens you have specified are wrong.]

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

#pagebreak()

= Processed data through proceeding(s) on the Tweasel platform

You have used the Tweasel platform to analyze apps. We are storing the results for these analyses in proceedings, which also include the answers you have given to the questions in the analysis wizard as well as any files you may have uploaded in the process.

This processing is covered by our privacy policy, which you can find here: https://www.tweasel.org/privacy

== Details on this processing

=== 1. Copy of the personal data

The data for your proceeding(s) is included in the ZIP file you downloaded. It contains a folder for each proceeding, named after the proceeding token.

In this folder you will find:

- A file called `proceeding.pdf` with a copy of all the data in this proceeding with explanations.
- Files called `initial-analysis.har` and `second-analysis.har` containing the recorded traffic from the first and second analysis, respectively, but of course only if those analyses have actually been performed.

  The traffic recordings are in the HAR format. You can view them in your browser, see our tutorial: https://docs.tweasel.org/background/har-tutorial/
- A folder called `uploads` containing all files you have uploaded to the proceeding, if any.

#if request.dataPortabilityRequest [You can find a machine-readable representation of this data in JSON format in the file `proceeding.json`.]

=== 2. Purposes of the processing and legal basis

We need to store and process this data in order to provide the Tweasel platform to you. The processing is based on our legitimate interest in doing that according to Art. 6(1)(f) GDPR.

=== 3. Categories of personal data concerned

We are processing the following categories of data in the context of this processing: proceeding token, proceeding state, metadata about the analysed app, traffic recordings from the app, tracking analysis results, answers to questions you have given in the analysis process

Do note however that most of the data that we are talking about here is not actually personal data. This is especially the case for all the technical data about the app including the traffic recordings as well as the results of our analysis of the included tracking data. All of this technical data has been collected on our infrastructure and is not related to you at all.

If you have uploaded your correspondence with the developer to the proceeding though, that is likely to contain personal data on you.

=== 4. Recipients to whom the personal data has been or will be disclosed

Our servers are hosted by the following companies. They are exclusively companies from the EU which we have carefully chosen based on our high standards for data protection.

- Hetzner Online GmbH, Industriestraße 25, 91710 Gunzenhausen, Germany
- Uberspace, Jonas Pasche, Kaiserstraße 15, 55116 Mainz, Germany
- BunnyWay d.o.o., Cesta komandanta Staneta 4A, 1215 Medvode, Slovenia

Personal data is thus never transmitted to a third country or international organization.

We do however publish the technical details about the app analyses, including the traffic recordings. As we said, these are not personal data and not connected to you in any way.

=== 5. Period for which the personal data will be stored

Any files you may have uploaded to a proceeding are automatically deleted one week after the proceeding is completed (e.g. the developer has remedied the violations, or you have sent a complaint to the data protection authorities) or one year after the creation of the proceeding. \
You always have the option to request an immediate deletion of any files you have uploaded. You can do so at this page or by contacting us: https://www.tweasel.org/privacy/erasure-request/

The non-personal data is stored indefinitely.

=== 6. Source of the personal data

Any uploaded files and question answers have been provided by you.

=== 7. Automated decision-making and profiling

As we mentioned in our letter, we never employ any profiling or other forms of automated decision-making according to Art. 22(1 and 4) GDPR under any circumstances.
