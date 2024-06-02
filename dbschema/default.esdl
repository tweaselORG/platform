module default {
    scalar type Platform extending enum<android, ios>;
    scalar type AnalysisType extending enum<initial, second>;

    type App {
        required platform: Platform;
        required appId: str { constraint max_len_value(150); };

        constraint exclusive on ((.platform, .appId));
    }

    type Analysis {
        required proceeding: Proceeding;
        required type: AnalysisType;

        required startDate: datetime;
        required endDate: datetime;

        required appName: str { constraint max_len_value(150); };
        required appVersion: str { constraint max_len_value(20); };
        required appVersionCode: str { constraint max_len_value(20); };

        required har: str { constraint max_len_value(13000000); };
        required trackHarResult: json;

        single app := .proceeding.app;

        constraint exclusive on ((.proceeding, .type));
    }

    type Proceeding {
        required app: App;
        required token: str;

          state := (
            'needsInitialAnalysis' if not exists(.initialAnalysis)  else
            # initialAnalysisFoundNothing
            # awaitingControllerNotice
            # awaitingControllerResponse
            # 'needsSecondAnalysis' if not exists(.initialAnalysis)  else
            # secondAnalysisFoundNothing
            # awaitingComplaint
            # complaintSent
            '<invalid>'
        );

        single initialAnalysis := (select Analysis filter .proceeding = Proceeding and .type = <AnalysisType>'initial' limit 1);
        single secondAnalysis := (select Analysis filter .proceeding = Proceeding and .type = <AnalysisType>'second' limit 1);

        required startedAt: datetime { default := datetime_current(); };
    }
}
