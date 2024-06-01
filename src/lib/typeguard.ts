const validProceedingStates = ['needsInitialAnalysis'] as const;
export const isValidProceedingState = (state: string): state is (typeof validProceedingStates)[number] =>
    (validProceedingStates as readonly string[]).includes(state);
