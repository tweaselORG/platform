module default {
    scalar type Platform extending enum<android, ios>;
    scalar type AnalysisType extending enum<initial, second>;
    scalar type ControllerResponse extending enum<promise, denial, none>;
    scalar type ComplaintType extending enum<formal, informal>;

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

        required appVersion: str { constraint max_len_value(20); };
        required appVersionCode: str { constraint max_len_value(20); };

        required har: str { constraint max_len_value(13000000); };
        required trackHarResult: json;

        single app := .proceeding.app;

        constraint exclusive on ((.proceeding, .type));
    }

    type Proceeding extending CreatedOn {
        required app: App;
        required token: str { constraint exclusive; };
        required reference: str { constraint exclusive; };

        required appName: str { constraint max_len_value(150); };
        required developerName: str { constraint max_len_value(150); };
        developerEmail: str { constraint max_len_value(150); };
        developerAddress: str { constraint max_len_value(300); };
        developerAddressSourceUrl: str { constraint max_len_value(200); };
        privacyPolicyUrl: str { constraint max_len_value(250); };

        state := (
            'needsInitialAnalysis' if not exists(.initialAnalysis) else
            'initialAnalysisFoundNothing' if all(std::json_typeof(json_array_unpack(.initialAnalysis.trackHarResult)) = 'null') else
            'awaitingControllerNotice' if not exists(.uploads) and any(std::json_typeof(json_array_unpack(.initialAnalysis.trackHarResult)) != 'null') else
            'awaitingControllerResponse' if not exists(.controllerResponse) else
            'needsSecondAnalysis' if not exists(.secondAnalysis) else
            'secondAnalysisFoundNothing' if all(std::json_typeof(json_array_unpack(.secondAnalysis.trackHarResult)) = 'null') else
            'awaitingComplaint' if not exists(.complaintSent) and any(std::json_typeof(json_array_unpack(.secondAnalysis.trackHarResult)) != 'null') else
            'complaintSent'
        );
        complaintState := (
            'notYet' if .state != 'awaitingComplaint' else
            'askIsUserOfApp' if not exists(.complainantIsUserOfApp) else
            'askAuthority' if not exists(.complaintAuthority) else
            'askComplaintType' if .complainantIsUserOfApp and not exists(.complaintType) else
            'askUserNetworkActivity' if .complaintType = <ComplaintType>'formal' and not exists(.userNetworkActivity) else
            'readyToSend'
        );

        single initialAnalysis := (select Analysis filter .proceeding = Proceeding and .type = <AnalysisType>'initial' limit 1);
        single secondAnalysis := (select Analysis filter .proceeding = Proceeding and .type = <AnalysisType>'second' limit 1);

        noticeSent: datetime;
        controllerResponse: ControllerResponse;

        complainantIsUserOfApp: bool;
        complaintType: ComplaintType;
        complaintAuthority: str { constraint max_len_value(255); };
        userNetworkActivityRaw: bytes { constraint max_size_bytes(1048576); };
        userNetworkActivity: json;
        loggedIntoAppStore: bool;
        deviceHasRegisteredSimCard: bool;
        complaintSent: datetime;

        multi uploads := .<proceeding[is MessageUpload];
    }

    type MessageUpload extending CreatedOn {
        required proceeding: Proceeding;

        required filename: str { constraint max_len_value(255); };
        required file: bytes { constraint max_size_bytes(20971520); };
    }
}
