module default {
    scalar type Platform extending enum<android, ios>;
    scalar type AnalysisType extending enum<initial, second>;

    abstract type CreatedOn {
        required property createdOn: datetime {
            default := datetime_current();
            readonly := true;
        };
    }

    abstract constraint max_size_bytes(size: int64) {
        errmessage := 'Maximum allowed size for {__subject__} is {size} bytes.';

        using (len(__subject__) <= size);
    }

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

    type Proceeding extending CreatedOn {
        required app: App;
        required token: str;
        required reference: str { constraint exclusive; };

          state := (
            'needsInitialAnalysis' if not exists(.initialAnalysis) else
            'initialAnalysisFoundNothing' if all(std::json_typeof(json_array_unpack(.initialAnalysis.trackHarResult)) = 'null') else
            'awaitingControllerNotice' if any(std::json_typeof(json_array_unpack(.initialAnalysis.trackHarResult)) != 'null') else
            # awaitingControllerResponse
            # 'needsSecondAnalysis' if not exists(.initialAnalysis) else
            # secondAnalysisFoundNothing
            # awaitingComplaint
            # complaintSent
            '<invalid>'
        );

        single initialAnalysis := (select Analysis filter .proceeding = Proceeding and .type = <AnalysisType>'initial' limit 1);
        single secondAnalysis := (select Analysis filter .proceeding = Proceeding and .type = <AnalysisType>'second' limit 1);

        multi uploads := .<proceeding[is MessageUpload];
    }

    type MessageUpload extending CreatedOn {
        required proceeding: Proceeding;

        required filename: str { constraint max_len_value(255); };
        required file: bytes { constraint max_size_bytes(20971520); };
    }
}