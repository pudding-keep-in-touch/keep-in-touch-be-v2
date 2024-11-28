export const numberToStringTransformer = {
  from: (value: number | null) => (value === null ? null : String(value)),
  to: (value: string | null) => (value === null ? null : Number(value)),
};
