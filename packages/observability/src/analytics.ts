/**
 * Analytics, a typed stub with no vendor (D-STK-12). `track` checks an event's
 * name and properties at compile time and sends nothing; P-G wires the vendor
 * behind this signature, so a call written today needs no change then.
 *
 * Each event is a row in `AnalyticsEvents`: a snake_case past-tense name and
 * properties built from ids, enums, booleans and numbers. A property never
 * holds free text, an address or a name.
 */

export type AnalyticsEvents = {
  page_viewed: { path: string };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

/** Records an event. A no-op until P-G registers a vendor. */
export function track<Name extends AnalyticsEventName>(
  name: Name,
  properties: AnalyticsEvents[Name],
): void {
  void name;
  void properties;
}
