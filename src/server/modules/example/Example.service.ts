import { type MultiplyService } from './Multiply.service';

export type ExampleService = ReturnType<typeof createExampleService>;
export const createExampleService = ({
  multiplyService,
}: {
  multiplyService: MultiplyService;
}) => {
  return {
    handleExample: (a: number, b: number) => multiplyService.multiply(a, b),
  };
};
