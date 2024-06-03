import { adapters, type Adapter, type AnnotatedResult, type processRequest } from 'trackhar';

// TODO: Yet again, stacks of yalc-ed dependencies due to unreleased changes stop me from actually importing the package
// I want. I'm copying the code over until then so that I can continue working. Fun.

export type PrepareTrafficOptions = {
    trackHarResult: ReturnType<typeof processRequest>[];

    entryFilter?: (entry: { harIndex: number; adapter: string; transmissions: AnnotatedResult }) => boolean;
};

export const prepareTraffic = (options: PrepareTrafficOptions) => {
    const trackHarResult = options.trackHarResult
        .map((transmissions, harIndex) =>
            !transmissions || transmissions.length === 0
                ? null
                : {
                      harIndex,
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      adapter: transmissions[0]!.adapter,
                      transmissions,
                  },
        )
        .filter((e): e is NonNullable<typeof e> => e !== null)
        .filter(options.entryFilter ?? (() => true));
    const findings = trackHarResult.reduce<
        Record<
            string,
            { adapter: Adapter; requests: typeof trackHarResult; receivedData: Record<string, Array<string>> }
        >
    >((acc, req) => {
        if (!acc[req.adapter]) {
            const adapter = adapters.find((a) => a.tracker.slug + '/' + a.slug === req.adapter);
            if (!adapter) throw new Error(`Unknown adapter: ${req.adapter}`);
            acc[req.adapter] = {
                adapter,
                requests: [],
                receivedData: {},
            };
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        acc[req.adapter]!.requests.push(req);

        for (const transmission of req.transmissions) {
            const property = String(transmission.property);

            if (!acc[req.adapter]?.receivedData[property]) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                acc[req.adapter]!.receivedData[property] = [];
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            acc[req.adapter]!.receivedData[property] = [
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                ...new Set([...acc[req.adapter]!.receivedData[property]!, transmission.value]),
            ];
        }

        return acc;
    }, {});

    return { trackHarResult, findings };
};
