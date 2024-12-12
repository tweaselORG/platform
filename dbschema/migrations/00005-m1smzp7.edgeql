CREATE MIGRATION m1osgfejsdyzdi2zrfrlsxokbs6nrk4aomuqd4hqpvktoicyxly5ta
    ONTO m14kn6nhfn4ujx45frwhr6h4xkjvmgvgshzxbafecelruhz37rra2a
{
  ALTER TYPE default::Proceeding {
      ALTER LINK initialAnalysis {
          RESET EXPRESSION;
          RESET EXPRESSION;
          ON SOURCE DELETE DELETE TARGET;
          RESET OPTIONALITY;
          CREATE CONSTRAINT std::exclusive;
          SET TYPE default::Analysis;
      };
      ALTER LINK secondAnalysis {
          RESET EXPRESSION;
          RESET EXPRESSION;
          ON SOURCE DELETE DELETE TARGET;
          RESET OPTIONALITY;
          CREATE CONSTRAINT std::exclusive;
          SET TYPE default::Analysis;
      };
  };
  CREATE TYPE default::ProceedingUpdateLog {
      CREATE REQUIRED SINGLE LINK proceeding: default::Proceeding {
          ON TARGET DELETE DELETE SOURCE;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY stateUpdatedOn: std::datetime {
          SET default := (std::datetime_current());
      };
  };
  FOR p IN (SELECT default::Proceeding {id, stateUpdatedOn}) UNION (
    INSERT ProceedingUpdateLog {
        proceeding := p,
        stateUpdatedOn := p.stateUpdatedOn
    }
  );
  ALTER TYPE default::Proceeding {
      DROP PROPERTY complaintState;
      DROP PROPERTY stateUpdatedOn;
  };
  ALTER TYPE default::Proceeding {
      DROP PROPERTY state;
  };
  ALTER TYPE default::Analysis {
      CREATE REQUIRED PROPERTY foundTrackers: std::bool {
          SET default := false;
          CREATE REWRITE
              INSERT
              USING ((std::any((std::json_typeof(std::json_array_unpack(.trackHarResult)) != 'null')) IF __specified__.trackHarResult ELSE .foundTrackers));
          CREATE REWRITE
              UPDATE
              USING ((std::any((std::json_typeof(std::json_array_unpack(.trackHarResult)) != 'null')) IF __specified__.trackHarResult ELSE .foundTrackers));
      };
  };
  UPDATE default::Analysis SET {
    foundTrackers := (std::any((std::json_typeof(std::json_array_unpack(.trackHarResult)) != 'null')))
  };
  CREATE SCALAR TYPE default::ProceedingState EXTENDING enum<erased, expired, needsInitialAnalysis, initialAnalysisFailed, initialAnalysisFoundNothing, awaitingControllerNotice, awaitingControllerResponse, needsSecondAnalysis, secondAnalysisFailed, secondAnalysisFoundNothing, awaitingComplaint, complaintSent>;
  ALTER TYPE default::Proceeding {
      CREATE REQUIRED PROPERTY state: default::ProceedingState {
          SET default := (default::ProceedingState.needsInitialAnalysis);
          CREATE REWRITE
              INSERT
              USING ((default::ProceedingState.erased IF EXISTS (.erased) ELSE (default::ProceedingState.expired IF EXISTS (.expired) ELSE (default::ProceedingState.needsInitialAnalysis IF (NOT (EXISTS (.initialAnalysis)) AND EXISTS (.requestedAnalysis)) ELSE (default::ProceedingState.initialAnalysisFailed IF (NOT (EXISTS (.initialAnalysis)) AND NOT (EXISTS (.requestedAnalysis))) ELSE (default::ProceedingState.initialAnalysisFoundNothing IF NOT (.initialAnalysis.foundTrackers) ELSE (default::ProceedingState.awaitingControllerNotice IF (NOT (EXISTS (.noticeSent)) AND .initialAnalysis.foundTrackers) ELSE (default::ProceedingState.awaitingControllerResponse IF NOT (EXISTS (.controllerResponse)) ELSE (default::ProceedingState.needsSecondAnalysis IF (NOT (EXISTS (.secondAnalysis)) AND EXISTS (.requestedAnalysis)) ELSE (default::ProceedingState.secondAnalysisFailed IF (NOT (EXISTS (.secondAnalysis)) AND NOT (EXISTS (.requestedAnalysis))) ELSE (default::ProceedingState.secondAnalysisFoundNothing IF NOT (.secondAnalysis.foundTrackers) ELSE (default::ProceedingState.awaitingComplaint IF (NOT (EXISTS (.complaintSent)) AND .secondAnalysis.foundTrackers) ELSE default::ProceedingState.complaintSent))))))))))));
          CREATE REWRITE
              UPDATE
              USING ((default::ProceedingState.erased IF EXISTS (.erased) ELSE (default::ProceedingState.expired IF EXISTS (.expired) ELSE (default::ProceedingState.needsInitialAnalysis IF (NOT (EXISTS (.initialAnalysis)) AND EXISTS (.requestedAnalysis)) ELSE (default::ProceedingState.initialAnalysisFailed IF (NOT (EXISTS (.initialAnalysis)) AND NOT (EXISTS (.requestedAnalysis))) ELSE (default::ProceedingState.initialAnalysisFoundNothing IF NOT (.initialAnalysis.foundTrackers) ELSE (default::ProceedingState.awaitingControllerNotice IF (NOT (EXISTS (.noticeSent)) AND .initialAnalysis.foundTrackers) ELSE (default::ProceedingState.awaitingControllerResponse IF NOT (EXISTS (.controllerResponse)) ELSE (default::ProceedingState.needsSecondAnalysis IF (NOT (EXISTS (.secondAnalysis)) AND EXISTS (.requestedAnalysis)) ELSE (default::ProceedingState.secondAnalysisFailed IF (NOT (EXISTS (.secondAnalysis)) AND NOT (EXISTS (.requestedAnalysis))) ELSE (default::ProceedingState.secondAnalysisFoundNothing IF NOT (.secondAnalysis.foundTrackers) ELSE (default::ProceedingState.awaitingComplaint IF (NOT (EXISTS (.complaintSent)) AND .secondAnalysis.foundTrackers) ELSE default::ProceedingState.complaintSent))))))))))));
      };
  };
  CREATE SCALAR TYPE default::ComplaintState EXTENDING enum<notYet, askIsUserOfApp, askAuthority, askComplaintType, askUserNetworkActivity, askLoggedIntoAppStore, askDeviceHasRegisteredSimCard, askDeveloperAddress, readyToSend>;
  ALTER TYPE default::Proceeding {
      CREATE REQUIRED PROPERTY complaintState := ((default::ComplaintState.notYet IF (.state != default::ProceedingState.awaitingComplaint) ELSE (default::ComplaintState.askIsUserOfApp IF NOT (EXISTS (.complainantIsUserOfApp)) ELSE (default::ComplaintState.askAuthority IF NOT (EXISTS (.complaintAuthority)) ELSE (default::ComplaintState.askComplaintType IF NOT (EXISTS (.complaintType)) ELSE (default::ComplaintState.askUserNetworkActivity IF ((.complaintType ?= default::ComplaintType.formal) AND NOT (EXISTS (.userNetworkActivity))) ELSE (default::ComplaintState.askLoggedIntoAppStore IF ((.complaintType ?= default::ComplaintType.formal) AND NOT (EXISTS (.loggedIntoAppStore))) ELSE (default::ComplaintState.askDeviceHasRegisteredSimCard IF ((.complaintType ?= default::ComplaintType.formal) AND NOT (EXISTS (.deviceHasRegisteredSimCard))) ELSE (default::ComplaintState.askDeveloperAddress IF NOT (EXISTS (.developerAddress)) ELSE default::ComplaintState.readyToSend)))))))));
  };
  ALTER TYPE default::Proceeding {
      CREATE TRIGGER logStateUpdate
          AFTER UPDATE
          FOR EACH
              WHEN ((__old__.state != __new__.state))
          DO (UPDATE
              default::ProceedingUpdateLog
          FILTER
              (.proceeding = __new__)
          SET {
              stateUpdatedOn := std::datetime_of_statement()
          });
  };
  UPDATE default::Proceeding SET {
    secondAnalysis := (SELECT .<proceeding[IS default::Analysis] FILTER .type = default::AnalysisType.second LIMIT 1),
    initialAnalysis := (SELECT .<proceeding[IS default::Analysis] FILTER .type = default::AnalysisType.initial LIMIT 1)
  };
  ALTER TYPE default::Analysis {
    DROP CONSTRAINT std::exclusive ON ((.proceeding, .type));
    ALTER LINK proceeding {
      USING ((.<initialAnalysis[IS default::Proceeding] IF (.type = default::AnalysisType.initial) ELSE .<secondAnalysis[IS default::Proceeding]));
      RESET ON TARGET DELETE;
      SET SINGLE;
      RESET OPTIONALITY;
    };
  };
  ALTER TYPE default::Proceeding {
      CREATE PROPERTY stateUpdatedOn := (.<proceeding[IS default::ProceedingUpdateLog].stateUpdatedOn);
      CREATE TRIGGER createUpdateLog
          AFTER INSERT
          FOR EACH DO (INSERT
              default::ProceedingUpdateLog
              {
                  proceeding := __new__,
                  stateUpdatedOn := __new__.createdOn
              });
  };
};
