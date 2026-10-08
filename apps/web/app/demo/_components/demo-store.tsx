"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

import type { RecordBody, RecordId, RecordSummary } from "../_lib/record";
import {
  demoReducer,
  initialDemoState,
  type DemoAction,
  type DemoState,
} from "../_lib/store";

interface DemoStore {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
}

const DemoStoreContext = createContext<DemoStore | null>(null);

/** Holds the fixtures' writes for the visit; a reload starts over (D-DEMO-7). */
export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, undefined, initialDemoState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <DemoStoreContext.Provider value={value}>
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore(): DemoStore {
  const store = useContext(DemoStoreContext);
  if (!store) throw new Error("useDemoStore needs a DemoStoreProvider");
  return store;
}

/** The index entry and body for one record; either is undefined when unknown. */
export function useDemoRecord(id: RecordId): {
  summary: RecordSummary | undefined;
  body: RecordBody | undefined;
} {
  const { state } = useDemoStore();
  return {
    summary: state.records.find((record) => record.id === id),
    body: state.bodies[id],
  };
}
