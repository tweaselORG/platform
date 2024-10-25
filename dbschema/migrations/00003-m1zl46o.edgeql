CREATE MIGRATION m1zl46o2wgqwo6ctyaw2u7kmj5h5hpctixpiddpjp5dynl4bmnvi7q
    ONTO m1pd7fgqotuuyyajzxozq4tykwbs3vl45gjfjkbkknxjeurjev2una
{
  ALTER TYPE default::Proceeding {
      ALTER PROPERTY state {
          USING (('erased' IF EXISTS (.erased) ELSE ('needsInitialAnalysis' IF (NOT (EXISTS (.initialAnalysis)) AND EXISTS (.requestedAnalysis)) ELSE ('initialAnalysisFailed' IF (NOT (EXISTS (.initialAnalysis)) AND NOT (EXISTS (.requestedAnalysis))) ELSE ('initialAnalysisFoundNothing' IF std::all((std::json_typeof(std::json_array_unpack(.initialAnalysis.trackHarResult)) = 'null')) ELSE ('awaitingControllerNotice' IF (NOT (EXISTS (.noticeSent)) AND std::any((std::json_typeof(std::json_array_unpack(.initialAnalysis.trackHarResult)) != 'null'))) ELSE ('awaitingControllerResponse' IF NOT (EXISTS (.controllerResponse)) ELSE ('needsSecondAnalysis' IF (NOT (EXISTS (.secondAnalysis)) AND EXISTS (.requestedAnalysis)) ELSE ('secondAnalysisFailed' IF (NOT (EXISTS (.secondAnalysis)) AND NOT (EXISTS (.requestedAnalysis))) ELSE ('secondAnalysisFoundNothing' IF std::all((std::json_typeof(std::json_array_unpack(.secondAnalysis.trackHarResult)) = 'null')) ELSE ('awaitingComplaint' IF (NOT (EXISTS (.complaintSent)) AND std::any((std::json_typeof(std::json_array_unpack(.secondAnalysis.trackHarResult)) != 'null'))) ELSE 'complaintSent')))))))))));
      };
  };
};
