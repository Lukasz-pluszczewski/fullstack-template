export type MultiplyService = ReturnType<typeof createMultiplyService>;
export const createMultiplyService = () => {
  return {
    multiply: (a: number, b: number) => a * b,
  };
};
