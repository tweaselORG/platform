CREATE MIGRATION m15hqdjg6iixcvqk6mc7mnvato6xmgkzmituqfm5o63mck67agqhla
    ONTO initial
{
  CREATE ABSTRACT CONSTRAINT default::max_size_bytes(size: std::int64) {
      SET errmessage := 'Maximum allowed size for {__subject__} is {size} bytes.';
      USING ((std::len(__subject__) <= size));
  };
  CREATE ABSTRACT TYPE default::CreatedOn {
      CREATE REQUIRED PROPERTY createdOn: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
  };
  CREATE TYPE default::MessageUpload EXTENDING default::CreatedOn {
      CREATE REQUIRED PROPERTY file: std::bytes {
          CREATE CONSTRAINT default::max_size_bytes(20971520);
      };
      CREATE REQUIRED PROPERTY filename: std::str {
          CREATE CONSTRAINT std::max_len_value(255);
      };
  };
  CREATE SCALAR TYPE default::Platform EXTENDING enum<android, ios>;
  CREATE TYPE default::App {
      CREATE REQUIRED PROPERTY appId: std::str {
          CREATE CONSTRAINT std::max_len_value(150);
      };
      CREATE REQUIRED PROPERTY platform: default::Platform;
      CREATE CONSTRAINT std::exclusive ON ((.platform, .appId));
      CREATE PROPERTY adamId: std::int64;
  };
  CREATE SCALAR TYPE default::AnalysisType EXTENDING enum<initial, second>;
  CREATE TYPE default::Analysis {
      CREATE REQUIRED PROPERTY har: std::str {
          CREATE CONSTRAINT default::max_size_bytes(52428800);
      };
      CREATE REQUIRED PROPERTY trackHarResult: std::json;
      CREATE REQUIRED PROPERTY type: default::AnalysisType;
      CREATE PROPERTY appVersion: std::str {
          CREATE CONSTRAINT std::max_len_value(20);
      };
      CREATE PROPERTY appVersionCode: std::str {
          CREATE CONSTRAINT std::max_len_value(20);
      };
      CREATE REQUIRED PROPERTY endDate: std::datetime;
      CREATE REQUIRED PROPERTY startDate: std::datetime;
  };
  CREATE SCALAR TYPE default::ComplaintType EXTENDING enum<formal, informal>;
  CREATE SCALAR TYPE default::ControllerResponse EXTENDING enum<promise, denial, none>;
  CREATE TYPE default::Proceeding EXTENDING default::CreatedOn {
      CREATE PROPERTY userNetworkActivityRaw: std::bytes {
          CREATE CONSTRAINT default::max_size_bytes(1048576);
      };
      CREATE PROPERTY complainantIsUserOfApp: std::bool;
      CREATE PROPERTY complaintAuthority: std::str {
          CREATE CONSTRAINT std::max_len_value(255);
      };
      CREATE PROPERTY complaintSent: std::datetime;
      CREATE PROPERTY complaintType: default::ComplaintType;
      CREATE PROPERTY controllerResponse: default::ControllerResponse;
      CREATE PROPERTY developerAddress: std::str {
          CREATE CONSTRAINT std::max_len_value(300);
      };
      CREATE PROPERTY deviceHasRegisteredSimCard: std::bool;
      CREATE PROPERTY loggedIntoAppStore: std::bool;
      CREATE PROPERTY userNetworkActivity: std::json;
      CREATE REQUIRED LINK app: default::App;
      CREATE REQUIRED PROPERTY appName: std::str {
          CREATE CONSTRAINT std::max_len_value(150);
      };
      CREATE PROPERTY developerAddressSourceUrl: std::str {
          CREATE CONSTRAINT std::max_len_value(200);
      };
      CREATE PROPERTY developerEmail: std::str {
          CREATE CONSTRAINT std::max_len_value(150);
      };
      CREATE REQUIRED PROPERTY developerName: std::str {
          CREATE CONSTRAINT std::max_len_value(150);
      };
      CREATE PROPERTY noticeSent: std::datetime;
      CREATE PROPERTY privacyPolicyUrl: std::str {
          CREATE CONSTRAINT std::max_len_value(250);
      };
      CREATE REQUIRED PROPERTY reference: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY token: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::Analysis {
      CREATE REQUIRED LINK proceeding: default::Proceeding {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE CONSTRAINT std::exclusive ON ((.proceeding, .type));
      CREATE SINGLE LINK app := (.proceeding.app);
  };
  ALTER TYPE default::Proceeding {
      CREATE SINGLE LINK initialAnalysis := (SELECT
          default::Analysis FILTER
              ((.proceeding = default::Proceeding) AND (.type = <default::AnalysisType>'initial'))
      LIMIT
          1
      );
      CREATE SINGLE LINK secondAnalysis := (SELECT
          default::Analysis FILTER
              ((.proceeding = default::Proceeding) AND (.type = <default::AnalysisType>'second'))
      LIMIT
          1
      );
  };
  ALTER TYPE default::MessageUpload {
      CREATE REQUIRED LINK proceeding: default::Proceeding {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
  CREATE TYPE default::RequestedAnalysis EXTENDING default::CreatedOn {
      CREATE REQUIRED PROPERTY token: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY type: default::AnalysisType;
  };
  ALTER TYPE default::Proceeding {
      CREATE SINGLE LINK requestedAnalysis: default::RequestedAnalysis {
          ON SOURCE DELETE DELETE TARGET;
          ON TARGET DELETE ALLOW;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE MULTI LINK uploads := (.<proceeding[IS default::MessageUpload]);
      CREATE REQUIRED PROPERTY state := (('needsInitialAnalysis' IF (NOT (EXISTS (.initialAnalysis)) AND EXISTS (.requestedAnalysis)) ELSE ('initialAnalysisFailed' IF (NOT (EXISTS (.initialAnalysis)) AND NOT (EXISTS (.requestedAnalysis))) ELSE ('initialAnalysisFoundNothing' IF std::all((std::json_typeof(std::json_array_unpack(.initialAnalysis.trackHarResult)) = 'null')) ELSE ('awaitingControllerNotice' IF (NOT (EXISTS (.uploads)) AND std::any((std::json_typeof(std::json_array_unpack(.initialAnalysis.trackHarResult)) != 'null'))) ELSE ('awaitingControllerResponse' IF NOT (EXISTS (.controllerResponse)) ELSE ('needsSecondAnalysis' IF (NOT (EXISTS (.secondAnalysis)) AND EXISTS (.requestedAnalysis)) ELSE ('secondAnalysisFailed' IF (NOT (EXISTS (.secondAnalysis)) AND NOT (EXISTS (.requestedAnalysis))) ELSE ('secondAnalysisFoundNothing' IF std::all((std::json_typeof(std::json_array_unpack(.secondAnalysis.trackHarResult)) = 'null')) ELSE ('awaitingComplaint' IF (NOT (EXISTS (.complaintSent)) AND std::any((std::json_typeof(std::json_array_unpack(.secondAnalysis.trackHarResult)) != 'null'))) ELSE 'complaintSent'))))))))));
      CREATE REQUIRED PROPERTY complaintState := (('notYet' IF (.state != 'awaitingComplaint') ELSE ('askIsUserOfApp' IF NOT (EXISTS (.complainantIsUserOfApp)) ELSE ('askAuthority' IF NOT (EXISTS (.complaintAuthority)) ELSE ('askComplaintType' IF NOT (EXISTS (.complaintType)) ELSE ('askUserNetworkActivity' IF ((.complaintType ?= <default::ComplaintType>'formal') AND NOT (EXISTS (.userNetworkActivity))) ELSE ('askLoggedIntoAppStore' IF ((.complaintType ?= <default::ComplaintType>'formal') AND NOT (EXISTS (.loggedIntoAppStore))) ELSE ('askDeviceHasRegisteredSimCard' IF ((.complaintType ?= <default::ComplaintType>'formal') AND NOT (EXISTS (.deviceHasRegisteredSimCard))) ELSE ('askDeveloperAddress' IF NOT (EXISTS (.developerAddress)) ELSE 'readyToSend')))))))));
  };
  ALTER TYPE default::RequestedAnalysis {
      CREATE SINGLE LINK proceeding := (.<requestedAnalysis[IS default::Proceeding]);
  };
};
