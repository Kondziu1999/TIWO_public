import { OperatorFunction } from "rxjs";
import { filter } from "rxjs/operators";

/**
 * Convenience RxJS operator that filters out undefined & false & null & empty strings
 */
export const onlyTruthy = <T>(): OperatorFunction<T | undefined | null, T> =>
    filter(
        (v: T | undefined | null | boolean | string): v is T => v !== false && v !== undefined && v !== null && v !== "",
    );