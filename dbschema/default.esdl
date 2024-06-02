module default {
    scalar type Platform extending enum<android, ios>;

    type App {
        required platform: Platform;
        required appId: str { constraint max_len_value(150); };

        constraint exclusive on ((.platform, .appId));
    }

    type Analysis {
        required app: App;

        required startDate: datetime;
        required endDate: datetime;

        required appName: str { constraint max_len_value(150); };
        required appVersion: str { constraint max_len_value(20); };
        required appVersionCode: str { constraint max_len_value(20); };

        required har: str { constraint max_len_value(13000000); };
        required trackHarResult: json;
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

        initialAnalysis: Analysis { constraint exclusive; };
        secondAnalysis: Analysis { constraint exclusive; };

        required startedAt: datetime { default := datetime_current(); };
    }
}
