export type SnakeToPascal<T extends string> = T extends `${infer A}_${infer B}`
  ? `${Capitalize<Lowercase<A>>}${SnakeToPascal<B>}`
  : Capitalize<Lowercase<T>>
