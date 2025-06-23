export interface PraxisTableEvent<T = any> {
  /** Type or identifier of the emitted event */
  type: string;
  /** Event payload */
  payload: T;
}
