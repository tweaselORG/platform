export const validProceedingStates = [
    'needsInitialAnalysis',
    'initialAnalysisFailed',
    'initialAnalysisFoundNothing',
    'awaitingControllerNotice',
    'awaitingControllerResponse',
    'needsSecondAnalysis',
    'secondAnalysisFailed',
    'secondAnalysisFoundNothing',
    'awaitingComplaint',
    'complaintSent',
] as const;
export type ProceedingState = (typeof validProceedingStates)[number];
export const isValidProceedingState = (state: string): state is ProceedingState =>
    (validProceedingStates as readonly string[]).includes(state);

export const validComplaintStates = [
    'askIsUserOfApp',
    'askAuthority',
    'askComplaintType',
    'askUserNetworkActivity',
    'askLoggedIntoAppStore',
    'askDeviceHasRegisteredSimCard',
    'askDeveloperAddress',
    'readyToSend',
] as const;
export type ComplaintState = (typeof validComplaintStates)[number];
export const isValidComplaintState = (state: string): state is ComplaintState =>
    (validComplaintStates as readonly string[]).includes(state);
