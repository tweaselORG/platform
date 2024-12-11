CREATE MIGRATION m1pd7fgqotuuyyajzxozq4tykwbs3vl45gjfjkbkknxjeurjev2una
    ONTO m15hqdjg6iixcvqk6mc7mnvato6xmgkzmituqfm5o63mck67agqhla
{
  ALTER TYPE default::Proceeding {
      CREATE PROPERTY erased: std::datetime;
      ALTER PROPERTY state {
          USING (('erased' IF EXISTS (.erased) ELSE ('needsInitialAnalysis' IF (NOT (EXISTS (.initialAnalysis)) AND EXISTS (.requestedAnalysis)) ELSE ('initialAnalysisFailed' IF (NOT (EXISTS (.initialAnalysis)) AND NOT (EXISTS (.requestedAnalysis))) ELSE ('initialAnalysisFoundNothing' IF std::all((std::json_typeof(std::json_array_unpack(.initialAnalysis.trackHarResult)) = 'null')) ELSE ('awaitingControllerNotice' IF (NOT (EXISTS (.uploads)) AND std::any((std::json_typeof(std::json_array_unpack(.initialAnalysis.trackHarResult)) != 'null'))) ELSE ('awaitingControllerResponse' IF NOT (EXISTS (.controllerResponse)) ELSE ('needsSecondAnalysis' IF (NOT (EXISTS (.secondAnalysis)) AND EXISTS (.requestedAnalysis)) ELSE ('secondAnalysisFailed' IF (NOT (EXISTS (.secondAnalysis)) AND NOT (EXISTS (.requestedAnalysis))) ELSE ('secondAnalysisFoundNothing' IF std::all((std::json_typeof(std::json_array_unpack(.secondAnalysis.trackHarResult)) = 'null')) ELSE ('awaitingComplaint' IF (NOT (EXISTS (.complaintSent)) AND std::any((std::json_typeof(std::json_array_unpack(.secondAnalysis.trackHarResult)) != 'null'))) ELSE 'complaintSent')))))))))));
      };
  };
};
