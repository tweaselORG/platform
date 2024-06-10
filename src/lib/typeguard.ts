export const validProceedingStates = [
    'needsInitialAnalysis',
    'initialAnalysisFoundNothing',
    'awaitingControllerNotice',
    'awaitingControllerResponse',
    'needsSecondAnalysis',
    'secondAnalysisFoundNothing',
    'awaitingComplaint',
] as const;
export type ProceedingState = (typeof validProceedingStates)[number];
export const isValidProceedingState = (state: string): state is ProceedingState =>
    (validProceedingStates as readonly string[]).includes(state);

export const validComplaintStates = ['askIsUserOfApp', 'askAuthority', 'askComplaintType'] as const;
export type ComplaintState = (typeof validComplaintStates)[number];
export const isValidComplaintState = (state: string): state is ComplaintState =>
    (validComplaintStates as readonly string[]).includes(state);
