// Helpers.
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;

type Unit =
  | 'Years'
  | 'Year'
  | 'Yrs'
  | 'Yr'
  | 'Y'
  | 'Weeks'
  | 'Week'
  | 'W'
  | 'Days'
  | 'Day'
  | 'D'
  | 'Hours'
  | 'Hour'
  | 'Hrs'
  | 'Hr'
  | 'H'
  | 'Minutes'
  | 'Minute'
  | 'Mins'
  | 'Min'
  | 'M'
  | 'Seconds'
  | 'Second'
  | 'Secs'
  | 'Sec'
  | 's'
  | 'Milliseconds'
  | 'Millisecond'
  | 'Msecs'
  | 'Msec'
  | 'Ms';

type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>;

export type StringValue =
  | `${number}`
  | `${number}${UnitAnyCase}`
  | `${number} ${UnitAnyCase}`;

interface Options {
  /**
   * Set to `true` to use verbose formatting. Defaults to `false`.
   */
  long?: boolean;
}

/**
 * Parse or format the given value.
 *
 * @param value - The string or number to convert
 * @param options - Options for the conversion
 * @throws Error if `value` is not a non-empty string or a number
 */
function msFn(value: StringValue, options?: Options): number;
function msFn(value: number, options?: Options): string;
function msFn(value: StringValue | number, options?: Options): number | string {
  try {
    if (typeof value === 'string' && value.length > 0) {
      return parse(value);
    } else if (typeof value === 'number' && isFinite(value)) {
      return options?.long ? fmtLong(value) : fmtShort(value);
    }
    throw new Error('Value is not a string or number.');
  } catch (error) {
    const message = isError(error)
      ? `${error.message}. value=${JSON.stringify(value)}`
      : 'An unknown error has occurred.';
    throw new Error(message);
  }
}

/**
 * Parse the given string and return milliseconds.
 *
 * @param str - A string to parse to milliseconds
 * @returns The parsed value in milliseconds, or `NaN` if the string can't be
 * parsed
 */
function parse(str: string): number {

  const l_Regex =
    /^((?<yearsValue>-?(\d*)?(\.\d+)?)(\s+)?(years?|yrs?|y))?(\s+)?((?<weeksValue>-?(\d*)?(\.\d+)?)(\s+)?(weeks?|w))?(\s+)?((?<daysValue>-?(\d*)?(\.\d+)?)(\s+)?(days?|d))?(\s+)?((?<hoursValue>-?(\d*)?(\.\d+)?)(\s+)?(hours?|hrs?|h))?(\s+)?((?<minsValue>-?(\d*)?(\.\d+)?)(\s+)?(minutes?|mins?|m(?!s|i)))?(\s+)?((?<secsValue>-?(\d*)?(\.\d+)?)(\s+)?(seconds?|secs?|s))?(\s+)?((?<msecsValue>-?(\d*)?(\.\d+)?)(\s+)?(milliseconds?|msecs?|ms|$))?/gim;

  const l_Match = l_Regex.exec(
    str,
  );

  const l_Groups = l_Match?.groups as { yearsValue?: string; weeksValue?: string; daysValue?: string; hoursValue?: string; minsValue?: string; secsValue?: string; msecsValue?: string; } | undefined;

  if (!l_Groups || l_Groups.yearsValue == undefined && l_Groups.weeksValue == undefined && l_Groups.daysValue == undefined && l_Groups.hoursValue == undefined && l_Groups.minsValue == undefined && l_Groups.secsValue == undefined && l_Groups.msecsValue == undefined)
    return NaN;

  let l_TotalMS = 0;

  if (l_Groups.yearsValue != undefined) l_TotalMS += parseFloat(l_Groups.yearsValue) * y;
  if (l_Groups.weeksValue != undefined) l_TotalMS += parseFloat(l_Groups.weeksValue) * w;
  if (l_Groups.daysValue != undefined) l_TotalMS += parseFloat(l_Groups.daysValue) * d;
  if (l_Groups.hoursValue != undefined) l_TotalMS += parseFloat(l_Groups.hoursValue) * h;
  if (l_Groups.minsValue != undefined) l_TotalMS += parseFloat(l_Groups.minsValue) * m;
  if (l_Groups.secsValue != undefined) l_TotalMS += parseFloat(l_Groups.secsValue) * s;
  if (l_Groups.msecsValue != undefined) l_TotalMS += parseFloat(l_Groups.msecsValue);

  return l_TotalMS;
}

// eslint-disable-next-line import/no-default-export
export default msFn;

/**
 * Short format for `ms`.
 */
function fmtShort(ms: number): StringValue {
  const msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return `${Math.round(ms / d)}d`;
  }
  if (msAbs >= h) {
    return `${Math.round(ms / h)}h`;
  }
  if (msAbs >= m) {
    return `${Math.round(ms / m)}m`;
  }
  if (msAbs >= s) {
    return `${Math.round(ms / s)}s`;
  }
  return `${ms}ms`;
}

/**
 * Long format for `ms`.
 */
function fmtLong(ms: number): StringValue {
  const msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return `${ms} ms`;
}

/**
 * Pluralization helper.
 */
function plural(
  ms: number,
  msAbs: number,
  n: number,
  name: string,
): StringValue {
  const isPlural = msAbs >= n * 1.5;
  return `${Math.round(ms / n)} ${name}${isPlural ? 's' : ''}` as StringValue;
}

/**
 * A type guard for errors.
 *
 * @param value - The value to test
 * @returns A boolean `true` if the provided value is an Error-like object
 */
function isError(value: unknown): value is Error {
  return typeof value === 'object' && value !== null && 'message' in value;
}
