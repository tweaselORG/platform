#import "style.typ": tweaselStyle
#show: tweaselStyle

#let proceeding = json("proceeding.json")
#let dpas = json("dpas.json")

#let descriptions = (
  platform: (
    android: "Android",
    ios: "iOS"
  ),
  proceedingState: (
    needsInitialAnalysis: "initial analysis is in progress",
    initialAnalysisFailed: "initial analysis failed",
    initialAnalysisFoundNothing: "initial analysis found no tracking",
    awaitingControllerNotice: "waiting for the user to send notice to developer",
    awaitingControllerResponse: "waiting for the developer to respond to the user's notice",
    needsSecondAnalysis: "second analysis is in progress",
    secondAnalysisFailed: "second analysis failed",
    secondAnalysisFoundNothing: "second analysis found no tracking",
    awaitingComplaint: "waiting for the user to send complaint",
    complaintSent: "complaint has been sent",
  ),
  complaintState: (
    notYet: "cannot be sent yet",
    askIsUserOfApp: "ask whether user is a user of the app",
    askAuthority: "ask which data protection authority is responsible",
    askComplaintType: "ask whether to send a formal or informal complaint",
    askUserNetworkActivity: "ask user to upload their TrackerControl/App Privacy Report data",
    askLoggedIntoAppStore: "ask whether user is logged into the app store",
    askDeviceHasRegisteredSimCard: "ask whether user has a registered SIM card in their device",
    askDeveloperAddress: "ask for the app developer's address",
    readyToSend: "can be sent",
  ),
  questions: (
    controllerResponse: (
      q: "How did the developer react?",
      promise: "The developer told me that they removed the tracking.",
      denial: "The developer has denied that there are violations.",
      "none": "The developer has not responded (concerning the tracking)."
    ),
    complainantIsUserOfApp: (
      q: "Are you a user of the app?",
      "true": "yes",
      "false": "no"
    ),
    complaintAuthority: (
      q: "Which authority do you want to contact?"
    ),
    complaintType: (
      q: "How to contact the DPA about the app?",
      formal: "Send a formal complaint.",
      informal: "Send an informal complaint."
    ),
    loggedIntoAppStore: (
      q: "How did you install the app?",
      "true": "I installed the app through the app store and I am logged in with my personal account.",
      "false": "I installed the app another way and/or I am not logged in with my personal account."
    ),
    deviceHasRegisteredSimCard: (
      q: "Do you have a SIM card in your device?",
      "true": "I have a SIM card that is registered to my name in my device.",
      "false": "I don’t have a SIM card in my device or it is not registered to my name."
    )
  ),
  analysis: (
    initialAnalysis: "Initial analysis",
    secondAnalysis: "Second analysis"
  )
)
#let stringify(val) = {
  if val == true {return "true"}
  else if val == false {return "false"}
  return str(val)
}
#let describeQuestion(question, answer) = [
  #descriptions.questions.at(question).q
  —
  #if(answer == none) [_not answered yet_] else [
    "#if question == "complaintAuthority" [#dpas.at(answer).name] else [#descriptions.questions.at(question).at(stringify(answer))]"
  ]
]

= Proceeding #proceeding.reference (#proceeding.appName)

== Basic metadata

- Reference: #proceeding.reference
- Token: #raw(proceeding.token)
- Internal ID: #raw(proceeding.id)
- Created on: #proceeding.createdOn

== App

- App name: #proceeding.appName
- Platform: #descriptions.platform.at(proceeding.app.platform) #if proceeding.app.adamId != none [(#raw(proceeding.app.adamId))]
- App ID: #raw(proceeding.app.appId)
- Developer:
  - Name: #proceeding.developerName
  - Address: \
    #proceeding.developerAddress
  - Email: #link(proceeding.developerEmail)
  - Source: #link(proceeding.developerAddressSourceUrl)
- Privacy policy: #link(proceeding.privacyPolicyUrl)

== State

- Proceeding state: #descriptions.proceedingState.at(proceeding.state)
- Complaint state: #descriptions.complaintState.at(proceeding.complaintState)
- Notice sent at: #if proceeding.noticeSent != none [#proceeding.noticeSent] else [_not yet_]
- Complaint sent at: #if proceeding.complaintSent != none [#proceeding.complaintSent] else [_not yet_]

== Provided answers

#for question in descriptions.questions.keys() [- #describeQuestion(question, proceeding.at(question))]

#for analysisType in ("initialAnalysis", "secondAnalysis") [
  == #descriptions.analysis.at(analysisType)

  #let analysis = proceeding.at(analysisType)
  #if analysis != none [
    Performed between #analysis.startDate and #analysis.endDate on version #analysis.appVersion (#analysis.appVersionCode) of the app.

    #if analysis.har != none [You can find the traffic recording in the file #if analysisType == "initialAnalysis" [`initial-analysis.har`] else [`second-analysis.har`].]

  ] else [_not performed yet_]
]

== Uploaded files

You can find the following uploaded correspondence in the `uploads` directory:

#if proceeding.uploads.len() > 0 [
  #for upload in proceeding.uploads [
    - #raw(upload.filename) (uploaded on: #upload.createdOn)
  ]
] else [_no correspondence uploaded (yet)_]

#if proceeding.userNetworkActivityRaw != none [You can find your uploaded TrackerControl/App Privacy Report data in the file `user-network-activity`.]
