const validProceedingStates = [
    'needsInitialAnalysis',
    'initialAnalysisFoundNothing',
    'awaitingControllerNotice',
    'awaitingControllerResponse',
    'needsSecondAnalysis',
] as const;
export type ProceedingState = (typeof validProceedingStates)[number];
export const isValidProceedingState = (state: string): state is ProceedingState =>
    (validProceedingStates as readonly string[]).includes(state);
