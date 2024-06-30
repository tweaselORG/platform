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
        adamId: int64;

        constraint exclusive on ((.platform, .appId));
    }

    type Analysis {
        required proceeding: Proceeding { on target delete delete source; };
        required type: AnalysisType;

        required startDate: datetime;
        required endDate: datetime;

        appVersion: str { constraint max_len_value(20); };
        appVersionCode: str { constraint max_len_value(20); };

        required har: str { constraint max_size_bytes(52428800); };
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

        required state := (
            'needsInitialAnalysis' if not exists(.initialAnalysis) and exists(.requestedAnalysis) else
            'initialAnalysisFailed' if not exists(.initialAnalysis) and not exists(.requestedAnalysis) else
            'initialAnalysisFoundNothing' if all(std::json_typeof(json_array_unpack(.initialAnalysis.trackHarResult)) = 'null') else
            'awaitingControllerNotice' if not exists(.uploads) and any(std::json_typeof(json_array_unpack(.initialAnalysis.trackHarResult)) != 'null') else
            'awaitingControllerResponse' if not exists(.controllerResponse) else
            'needsSecondAnalysis' if not exists(.secondAnalysis) and exists(.requestedAnalysis) else
            'secondAnalysisFailed' if not exists(.secondAnalysis) and not exists(.requestedAnalysis) else
            'secondAnalysisFoundNothing' if all(std::json_typeof(json_array_unpack(.secondAnalysis.trackHarResult)) = 'null') else
            'awaitingComplaint' if not exists(.complaintSent) and any(std::json_typeof(json_array_unpack(.secondAnalysis.trackHarResult)) != 'null') else
            'complaintSent'
        );
        required complaintState := (
            'notYet' if .state != 'awaitingComplaint' else
            'askIsUserOfApp' if not exists(.complainantIsUserOfApp) else
            'askAuthority' if not exists(.complaintAuthority) else
            'askComplaintType' if not exists(.complaintType) else
            'askUserNetworkActivity' if .complaintType ?= <ComplaintType>'formal' and not exists(.userNetworkActivity) else
            'askLoggedIntoAppStore' if .complaintType ?= <ComplaintType>'formal' and not exists(.loggedIntoAppStore) else
            'askDeviceHasRegisteredSimCard' if .complaintType ?= <ComplaintType>'formal' and not exists(.deviceHasRegisteredSimCard) else
            'askDeveloperAddress' if not exists(.developerAddress) else
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
        single requestedAnalysis: RequestedAnalysis {
            constraint exclusive;
            on target delete allow;
            on source delete delete target;
        };
    }

    type MessageUpload extending CreatedOn {
        required proceeding: Proceeding { on target delete delete source; };

        required filename: str { constraint max_len_value(255); };
        required file: bytes { constraint max_size_bytes(20971520); };
    }

    type RequestedAnalysis extending CreatedOn {
        required type: AnalysisType;
        required token: str { constraint exclusive; };

        single proceeding := .<requestedAnalysis[is Proceeding];
    }
}
