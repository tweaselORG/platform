CREATE MIGRATION m1o43u7awhxou3dd7aa6nkf7d2hyi5u62jbvykj2c2vi4rknloatcq
    ONTO m1osgfejsdyzdi2zrfrlsxokbs6nrk4aomuqd4hqpvktoicyxly5ta
{
  ALTER TYPE default::Proceeding {
      ALTER LINK requestedAnalysis {
          ON TARGET DELETE DEFERRED RESTRICT;
      };
      CREATE TRIGGER removeRequestedAnalysis
          AFTER UPDATE 
          FOR EACH 
              WHEN ((__old__.requestedAnalysis NOT IN __new__.requestedAnalysis))
          DO (DELETE
              __old__.requestedAnalysis
          );
  };
};
