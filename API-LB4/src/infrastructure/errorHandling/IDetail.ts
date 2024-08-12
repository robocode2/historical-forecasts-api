export interface IDetail<Type> {
  [key: string]: string | Type | undefined;
  type?: Type;
}
