module default {
    scalar type Platform extending enum<android, ios>;
    scalar type AnalysisType extending enum<initial, second>;
    scalar type ControllerResponse extending enum<promise, denial, none>;
    scalar type ComplaintType extending enum<formal, informal>;
    scalar type ProceedingState extending
        enum<erased,
            expired,
            needsInitialAnalysis,
            initialAnalysisFailed,
            initialAnalysisFoundNothing,
            awaitingControllerNotice,
            awaitingControllerResponse,
            needsSecondAnalysis,
            secondAnalysisFailed,
            secondAnalysisFoundNothing,
            awaitingComplaint,
            complaintSent>;
    scalar type ComplaintState extending
        enum<notYet,
            askIsUserOfApp,
            askAuthority,
            askComplaintType,
            askUserNetworkActivity,
            askLoggedIntoAppStore,
            askDeviceHasRegisteredSimCard,
            askDeveloperAddress,
            readyToSend>;


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
        single proceeding :=
            .<initialAnalysis[is Proceeding] if .type = AnalysisType.initial else
            .<secondAnalysis[is Proceeding];
        required type: AnalysisType;

        required startDate: datetime;
        required endDate: datetime;

        appVersion: str { constraint max_len_value(20); };
        appVersionCode: str { constraint max_len_value(20); };

        required har: str { constraint max_size_bytes(52428800); };
        required trackHarResult: json;
        required foundTrackers: bool {
            rewrite insert, update using (
                any(std::json_typeof(json_array_unpack(.trackHarResult)) != 'null') if __specified__.trackHarResult else .foundTrackers
            );
            default := false;
        }

        single app := .proceeding.app;
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

        required state: ProceedingState {
            rewrite insert, update using (
                ProceedingState.erased if exists(.erased) else
                ProceedingState.expired if exists(.expired) else
                ProceedingState.needsInitialAnalysis if not exists(.initialAnalysis) and exists(.requestedAnalysis) else
                ProceedingState.initialAnalysisFailed if not exists(.initialAnalysis) and not exists(.requestedAnalysis) else
                ProceedingState.initialAnalysisFoundNothing if not .initialAnalysis.foundTrackers else
                ProceedingState.awaitingControllerNotice if not exists(.noticeSent) and .initialAnalysis.foundTrackers else
                ProceedingState.awaitingControllerResponse if not exists(.controllerResponse) else
                ProceedingState.needsSecondAnalysis if not exists(.secondAnalysis) and exists(.requestedAnalysis) else
                ProceedingState.secondAnalysisFailed if not exists(.secondAnalysis) and not exists(.requestedAnalysis) else
                ProceedingState.secondAnalysisFoundNothing if not .secondAnalysis.foundTrackers else
                ProceedingState.awaitingComplaint if not exists(.complaintSent) and .secondAnalysis.foundTrackers else
                ProceedingState.complaintSent
            );
            default := ProceedingState.needsInitialAnalysis;
        };

        trigger logStateUpdate after update for each
        when (__old__.state != __new__.state)
        do (
            update ProceedingUpdateLog filter .proceeding = __new__ set {
                stateUpdatedOn := datetime_of_statement()
            }
        );

        trigger createUpdateLog after insert for each
        do (
            insert ProceedingUpdateLog {
                proceeding := __new__,
                stateUpdatedOn := __new__.createdOn
            }
        );

        required complaintState := (
            ComplaintState.notYet if .state != ProceedingState.awaitingComplaint else
            ComplaintState.askIsUserOfApp if not exists(.complainantIsUserOfApp) else
            ComplaintState.askAuthority if not exists(.complaintAuthority) else
            ComplaintState.askComplaintType if not exists(.complaintType) else
            ComplaintState.askUserNetworkActivity if .complaintType ?= ComplaintType.formal and not exists(.userNetworkActivity) else
            ComplaintState.askLoggedIntoAppStore if .complaintType ?= ComplaintType.formal and not exists(.loggedIntoAppStore) else
            ComplaintState.askDeviceHasRegisteredSimCard if .complaintType ?= ComplaintType.formal and not exists(.deviceHasRegisteredSimCard) else
            ComplaintState.askDeveloperAddress if not exists(.developerAddress) else
            ComplaintState.readyToSend
        );

        stateUpdatedOn := (.<proceeding[is ProceedingUpdateLog]).stateUpdatedOn;

        single initialAnalysis: Analysis {
            constraint exclusive;
            on source delete delete target;
        };
        single secondAnalysis: Analysis {
            constraint exclusive;
            on source delete delete target;
        };

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

        erased: datetime;
        expired: datetime;

        multi uploads := .<proceeding[is MessageUpload];
        single requestedAnalysis: RequestedAnalysis {
            constraint exclusive;
            on target delete allow;
            on source delete delete target;
        };
    }

    type ProceedingUpdateLog {
        required single proceeding: Proceeding {
            on target delete delete source;
            constraint exclusive;
        }
        required stateUpdatedOn: datetime {
            default := datetime_current();
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
