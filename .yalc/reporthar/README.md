# ReportHAR

> Generate technical reports, controller notices and GDPR complaints concerning tracking by mobile apps for the tweasel project.

ReportHAR is the library for generating the following documents for the tweasel project based on network traffic recordings in HAR files:

* **Technical reports** detailing the findings and methodology of our automated analyses concerning tracking and similar data transmissions performed on mobile apps. The reports include a reproduction of the recorded network traffic.
* **Notices to controllers** making them aware of data protection violations discovered in their app and giving them the opportunity to remedy the violations.
* **Complaints to data protection authorities** about apps that continue to violate data protection law even after the controller was notified and given time to fix the issues. The complaint contains both a technical assessment, based on the traffic analysis, and a detailed legal assessment.

> [!NOTE]
> Currently, ReportHAR only works with templates that are quite specific to our use case with tweasel. Support for custom templates is [planned](https://github.com/tweaselORG/ReportHAR/issues/7).

All documents are generated as PDF files using [Typst](https://typst.app/). The [templates](/templates/) are translatable.

Using ReportHAR is most convenient for traffic recordings made with tweasel tools, which contain [additional metadata about the analysis](https://github.com/tweaselORG/cyanoacrylate#additional-metadata-in-exported-har-files). This way, you don't need to manually provide information about the app, device, etc. However, ReportHAR can also work with HAR files produced by other tools.

ReportHAR doesn't actually analyze the traffic itself, it just produces the documents. You need to use [TrackHAR](https://github.com/tweaselORG/TrackHAR) to detect the transmitted personal data and provide that result to ReportHAR.

## Installation

You can install ReportHAR using yarn or npm:

```sh
yarn add reporthar
# or `npm i reporthar`
```

## API reference

A full API reference can be found in the [`docs` folder](/docs/README.md).

## Example usage

ReportHAR provides two main functions for generating documents: `generate()` and `generateAdvanced()`.

### Usage with tweasel HAR files

`generate()` is the high-level function that is easiest to use. It expects a tweasel HAR file with additional metadata and automatically extracts all required information from it.

First, we generate the initial technical report and notice to send to the controller:

```ts
import { writeFile } from 'fs/promises';
import { process } from 'trackhar';
import { generate } from 'reporthar';

(async () => {
    // We start by loading the HAR file of the initial analysis…
    const initialHar = /* […] */;

    // …and detect the transmitted tracking data using TrackHAR.
    const initialTrackHarResult = await process(initialHar);

    // Then, we pass both to the `generate()` function to generate
    // the technical report…
    const initialReport = await generate({
        type: 'report',
        language: 'en',

        har: initialHar,
        trackHarResult: initialTrackHarResult,
    });
    // …and the controller notice.
    const notice = await generate({
        type: 'notice',
        language: 'en',

        har: initialHar,
        trackHarResult: initialTrackHarResult,
    });

    // This will give you two PDFs that you can for example
    // save to disk.
    await writeFile('initial-report.pdf', initialReport);
    await writeFile('notice.pdf', notice);

    // Remember to store the TrackHAR result as it will also be
    // needed for the complaint.
    await writeFile(
        'initial-trackhar-result.json',
        JSON.stringify(initialTrackHarResult)
    );
})();
```

If the controller did not appropriately remedy the violations after the deadline, we will send a complaint to the DPAs:

```ts
import { writeFile } from 'fs/promises';
import { process } from 'trackhar';
import { generate, parseNetworkActivityReport } from 'reporthar';

(async () => {
    // We again start by loading the HAR files of the initial and
    // second analysis, as well as the TrackHAR analysis of the
    // initial analysis that we have stored previously.
    const initialHar = /* […] */;
    const secondHar = /* […] */;

    const initialTrackHarResult = /* […] */;
    
    // Again, we detect the transmitted tracking data in the
    // second HAR using TrackHAR.
    const secondTrackHarResult = await process(secondHar);

    // Based on that, we generate the second report.
    const secondReport = await generate({
        type: 'report',
        language: 'en',

        har: secondHar,
        trackHarResult: secondTrackHarResult,
    });

        
    // For the complaint, we also load and parse a report of the
    // network activity on the user's device created using the iOS
    // App Privacy Report or the Tracker Control app on Android.
    // This is to prove that the user making the complaint was
    // personally affected by the tracking.
    const userNetworkActivityRaw = /* […] */;
    const userNetworkActivity = parseNetworkActivityReport(
        'tracker-control-csv',
        userNetworkActivityRaw
    );

    // We can then also generate the complaint, providing a whole
    // bunch of additional metadata.
    const complaint = await generate({
        type: 'complaint',
        language: 'en',

        initialHar: initialHar,
        initialTrackHarResult,
        har: secondHar,
        trackHarResult: secondTrackHarResult,

        complaintOptions: {
            date: new Date(),
            reference: '2024-1ONO079C',
            noticeDate: new Date('2023-12-01'),

            nationalEPrivacyLaw: 'TTDSG',

            complainantAddress: 'Kim Mustermensch, Musterstraße 123, 12345 Musterstadt, Musterland',
            controllerAddress: 'Musterfirma, Musterstraße 123, 12345 Musterstadt, Musterland',
            controllerAddressSourceUrl: 'https://play.google.com/store/apps/details?id=tld.sample.app',

            userDeviceAppStore: 'Google Play Store',
            loggedIntoAppStore: true,
            deviceHasRegisteredSimCard: true,

            controllerResponse: 'denial',

            complainantContactDetails: 'kim.muster@example.tld',
            complainantAgreesToUnencryptedCommunication: true,

            userNetworkActivity,
        },
    });

    await writeFile('second-report.pdf', secondReport);
    await writeFile('complaint.pdf', complaint);
})();
```

### Usage with regular HAR files

If you want to use ReportHAR with HAR files from other sources that don't include the tweasel metadata, you need to use the `generateAdvanced()` function instead and manually specify the information about the app and analysis that would otherwise be included in the HAR file.

Otherwise, the flow is the same as above.

```ts
const initialAnalysis = {
    date: new Date('2023-12-01T10:00:00.000Z'),
    platformVersion: '13',

    har: initialHar,
    harMd5: '1ee2afb03562aa4d22352ed6b2548a6b',

    trackHarResult: initialTrackHarResult,

    app: {
        platform: 'Android',

        id: 'tld.sample.app',
        name: 'Sample App',
        version: '1.2.3',
        url: 'https://play.google.com/store/apps/details?id=tld.sample.app',
        store: 'Google Play Store',
    },

    dependencies: {
        "python": "3.11.3",
        "mitmproxy": "9.0.1"
    },
};

const initialReport = await generateAdvanced({
    type: 'report',
    language: 'en',

    analysis: initialAnalysis,
});
const notice = await generateAdvanced({
    type: 'notice',
    language: 'en',

    analysis: initialAnalysis,
});

const secondTrackHarResult = await process(secondHar);
const secondAnalysis = {
    date: new Date('2024-02-01T10:00:00.000Z'),
    platformVersion: '13',

    har: secondHar,
    harMd5: '2bb3aec14673bb5e33463fe7c3658b7d',

    trackHarResult: secondTrackHarResult,

    app: {
        platform: 'Android',

        id: 'tld.sample.app',
        name: 'Sample App',
        version: '1.2.4',
        url: 'https://play.google.com/store/apps/details?id=tld.sample.app',
        store: 'Google Play Store',
    },

    dependencies: {
        "python": "3.11.3",
        "mitmproxy": "9.0.1"
    },
};

const secondReport = await generateAdvanced({
    type: 'report',
    language: 'en',

    analysis: secondAnalysis,
});
const complaint = await generateAdvanced({
    type: 'complaint',
    language: 'en',

    initialAnalysis,
    analysis: secondAnalysis,

    complaintOptions: {
        date: new Date('2024-02-15'),
        reference: '2024-1ONO079C',
        noticeDate: new Date('2023-12-01'),

        nationalEPrivacyLaw: 'TTDSG',

        complainantAddress: 'Kim Mustermensch, Musterstraße 123, 12345 Musterstadt, Musterland',
        controllerAddress: 'Musterfirma, Musterstraße 123, 12345 Musterstadt, Musterland',
        controllerAddressSourceUrl: 'https://play.google.com/store/apps/details?id=tld.sample.app',

        userDeviceAppStore: 'Google Play Store',
        loggedIntoAppStore: true,
        deviceHasRegisteredSimCard: true,

        controllerResponse: 'denial',

        complainantContactDetails: 'kim.muster@example.tld',
        complainantAgreesToUnencryptedCommunication: true,

        userNetworkActivity,
    },
});
```

## License

This code is licensed under the MIT license, see the [`LICENSE`](LICENSE) file for details.

Issues and pull requests are welcome! Please be aware that by contributing, you agree for your work to be licensed under an MIT license.
