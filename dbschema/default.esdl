module default {
    scalar type Platform extending enum<android, ios>;

    type App {
        required platform: Platform;
        required app_id: str { constraint max_len_value(150); };

        constraint exclusive on ((.platform, .app_id));
    }

    type Analysis {
        required app: App;

        required start_date: datetime;
        required end_date: datetime;

        required app_name: str { constraint max_len_value(150); };
        required app_version: str { constraint max_len_value(20); };
        required app_version_code: str { constraint max_len_value(20); };

        required har: json;
        required trackHarResult: json;
    }

    type Proceeding {
        required app: App;
        required token: str;

        initialAnalysis: Analysis { constraint exclusive; };
        secondAnalysis: Analysis { constraint exclusive; };

        required started_at: datetime;
    }
}
