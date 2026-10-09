"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Info, TriangleAlert, WifiOff } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@pem/ui/alert";
import { Button } from "@pem/ui/button";
import { cn } from "@pem/ui/cn";
import { FieldLegend, FieldSet } from "@pem/ui/field";
import { Label } from "@pem/ui/label";
import { RadioGroup, RadioGroupItem } from "@pem/ui/radio-group";
import { Separator } from "@pem/ui/separator";
import { Skeleton } from "@pem/ui/skeleton";
import { Switch } from "@pem/ui/switch";
import { useTheme } from "@pem/ui/theme";
import { toast } from "@pem/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@pem/ui/toggle-group";

import { ConfirmDialog } from "../../_components/confirm-dialog";
import { useDemoStore } from "../../../_components/demo-store";
import {
  DEFAULT_DEMO_PREFS,
  DEMO_PREFS_COOKIE,
  parseDemoPrefs,
  writeDemoPrefs,
} from "../../../_lib/prefs";
import type { DemoPrefs } from "../../../_lib/record";
import { SETTINGS_COPY as COPY } from "./copy";

type Sort = DemoPrefs["defaultSort"];
type ThemeChoice = (typeof COPY.themeOptions)[number]["value"];

/** The change `error` stages as having failed to save. */
const FAILED_SORT: Sort = "renews-asc";
const NOT_SUBSCRIBED = () => () => {};

/** False on the server and during hydration, so the stored theme never mismatches. */
function useIsClient() {
  return useSyncExternalStore(
    NOT_SUBSCRIBED,
    () => true,
    () => false,
  );
}

/** The cookie is read fresh so a write never undoes onboarding set elsewhere. */
function persist(
  patch: Partial<Pick<DemoPrefs, "compactRows" | "defaultSort">>,
) {
  const raw = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${DEMO_PREFS_COOKIE}=`))
    ?.slice(DEMO_PREFS_COOKIE.length + 1);
  writeDemoPrefs({ ...parseDemoPrefs(raw), ...patch });
}

function announce(title: string, description: string) {
  toast.add({ title, description });
}

interface RowProps {
  labelId: string;
  label: string;
  helper: string;
  control: ReactNode;
  /** The control stays beside its label at every width (the switch). */
  inline?: boolean;
  dimmed?: boolean;
}

function Row({ labelId, label, helper, control, inline, dimmed }: RowProps) {
  return (
    <div
      data-dimmed={dimmed ? "" : undefined}
      className={cn(
        "flex gap-3 md:flex-row md:items-center md:justify-between",
        inline ? "flex-row items-center justify-between" : "flex-col",
        dimmed && "opacity-50",
      )}
    >
      <div className="flex min-w-0 flex-col">
        <p id={labelId} className="text-sm font-medium">
          {label}
        </p>
        <p id={`${labelId}-helper`} className="text-sm text-muted-foreground">
          {helper}
        </p>
      </div>
      {control}
    </div>
  );
}

function Group({
  title,
  titleId,
  children,
}: {
  title: string;
  titleId: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4">
      <h2 id={titleId} className="text-base font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Notice({
  id,
  icon,
  title,
  body,
  action,
  variant,
}: {
  id?: string;
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
  variant?: "default" | "destructive";
}) {
  return (
    <Alert id={id} variant={variant}>
      {icon}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{body}</AlertDescription>
      {action ? (
        <AlertAction className="top-1/2 -translate-y-1/2">{action}</AlertAction>
      ) : null}
    </Alert>
  );
}

/** Each width's final layout, static labels as text (D-DEMO-16). */
function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <Group title={COPY.display} titleId="loading-display">
        <Row
          labelId="loading-theme"
          label={COPY.theme.label}
          helper={COPY.theme.helper}
          control={<Skeleton className="h-9 w-52" />}
        />
        <Row
          inline
          labelId="loading-compact"
          label={COPY.compact.label}
          helper={COPY.compact.helper}
          control={<Skeleton className="h-4.5 w-8 rounded-full" />}
        />
      </Group>
      <Separator />
      <Group title={COPY.records} titleId="loading-records">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">{COPY.sort.legend}</p>
          {COPY.sortOptions.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-4 w-44" />
            </div>
          ))}
        </div>
      </Group>
      <Separator />
      <Group title={COPY.demo} titleId="loading-demo">
        <Row
          labelId="loading-onboarding"
          label={COPY.onboarding.label}
          helper={COPY.onboarding.helper}
          control={<Skeleton className="h-9 w-40" />}
        />
        <Row
          labelId="loading-data"
          label={COPY.data.label}
          helper={COPY.data.helper}
          control={<Skeleton className="h-9 w-36" />}
        />
      </Group>
    </div>
  );
}

export function SettingsView({
  state,
  prefs: serverPrefs,
}: {
  state: string | null;
  prefs: DemoPrefs;
}) {
  const ids = useId();
  const { dispatch } = useDemoStore();
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  // `empty` draws the defaults; `saved` stages the sort change it confirms.
  const initial: DemoPrefs =
    state === "empty"
      ? { ...DEFAULT_DEMO_PREFS }
      : state === "saved"
        ? { ...serverPrefs, defaultSort: "renews-asc" }
        : serverPrefs;
  const [compactRows, setCompactRows] = useState(initial.compactRows);
  const [defaultSort, setDefaultSort] = useState<Sort>(
    state === "error" ? "vendor-asc" : initial.defaultSort,
  );
  const [failedSort, setFailedSort] = useState<Sort | null>(
    state === "error" ? FAILED_SORT : null,
  );
  const [recordsFailed, setRecordsFailed] = useState(state === "partial");
  const [resetOpen, setResetOpen] = useState(state === "reset");
  const resetTrigger = useRef<HTMLButtonElement>(null);
  const staged = useRef(false);

  useEffect(() => {
    if (state !== "saved" || staged.current) return;
    staged.current = true;
    announce(COPY.toasts.sort.title, COPY.toasts.sort.body["renews-asc"]);
  }, [state]);

  if (state === "loading") return <SettingsSkeleton />;

  const offline = state === "offline";
  const noticeId = `${ids}-notice`;
  const lockedBy = offline ? noticeId : undefined;

  function chooseTheme(next: ThemeChoice) {
    setTheme(next);
    announce(COPY.toasts.theme.title, COPY.toasts.theme.body[next]);
  }

  function chooseCompact(next: boolean) {
    setCompactRows(next);
    persist({ compactRows: next });
    announce(
      COPY.toasts.compact.title,
      next ? COPY.toasts.compact.on : COPY.toasts.compact.off,
    );
  }

  function chooseSort(next: Sort) {
    setDefaultSort(next);
    setFailedSort(null);
    persist({ defaultSort: next });
    announce(COPY.toasts.sort.title, COPY.toasts.sort.body[next]);
  }

  function confirmReset() {
    dispatch({ type: "reset" });
    setResetOpen(false);
    announce(COPY.toasts.reset.title, COPY.toasts.reset.body);
  }

  return (
    <div className="flex flex-col gap-8">
      {offline ? (
        <Notice
          id={noticeId}
          icon={<WifiOff aria-hidden="true" />}
          title={COPY.offline.title}
          body={COPY.offline.body}
        />
      ) : null}

      <Group title={COPY.display} titleId={`${ids}-display`}>
        <Row
          labelId={`${ids}-theme`}
          label={COPY.theme.label}
          helper={COPY.theme.helper}
          control={
            <ToggleGroup
              aria-labelledby={`${ids}-theme`}
              aria-describedby={`${ids}-theme-helper`}
              variant="outline"
              spacing={0}
              value={isClient && theme ? [theme] : []}
              onValueChange={(next) => {
                const choice = COPY.themeOptions.find(
                  (option) => option.value === next[0],
                );
                if (choice) chooseTheme(choice.value);
              }}
            >
              {COPY.themeOptions.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="aria-pressed:bg-muted aria-pressed:text-foreground aria-pressed:hover:bg-muted aria-pressed:hover:text-foreground"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          }
        />
        <Row
          inline
          dimmed={offline}
          labelId={`${ids}-compact`}
          label={COPY.compact.label}
          helper={COPY.compact.helper}
          control={
            <Switch
              aria-labelledby={`${ids}-compact`}
              aria-describedby={cn(`${ids}-compact-helper`, lockedBy)}
              checked={compactRows}
              disabled={offline}
              className="data-disabled:opacity-100"
              onCheckedChange={chooseCompact}
            />
          }
        />
      </Group>

      <Separator />

      <Group title={COPY.records} titleId={`${ids}-records`}>
        {recordsFailed ? (
          <Notice
            icon={<Info aria-hidden="true" />}
            title={COPY.partial.title}
            body={COPY.partial.body}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRecordsFailed(false)}
              >
                {COPY.retry}
              </Button>
            }
          />
        ) : (
          <>
            <FieldSet
              aria-describedby={lockedBy}
              className={cn("gap-3", offline && "opacity-50")}
            >
              <FieldLegend variant="label" className="mb-0">
                {COPY.sort.legend}
              </FieldLegend>
              <RadioGroup
                value={defaultSort}
                disabled={offline}
                onValueChange={(next) => chooseSort(next as Sort)}
              >
                {COPY.sortOptions.map((option) => {
                  const id = `${ids}-sort-${option.value}`;
                  return (
                    <Label
                      key={option.value}
                      htmlFor={id}
                      className="gap-2 font-normal"
                    >
                      <RadioGroupItem
                        id={id}
                        value={option.value}
                        className="disabled:opacity-100"
                      />
                      {option.label}
                    </Label>
                  );
                })}
              </RadioGroup>
            </FieldSet>
            {failedSort ? (
              <Notice
                variant="destructive"
                icon={<TriangleAlert aria-hidden="true" />}
                title={COPY.error.title}
                body={COPY.error.body}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => chooseSort(failedSort)}
                  >
                    {COPY.retry}
                  </Button>
                }
              />
            ) : null}
          </>
        )}
      </Group>

      <Separator />

      <Group title={COPY.demo} titleId={`${ids}-demo`}>
        <Row
          labelId={`${ids}-onboarding`}
          label={COPY.onboarding.label}
          helper={COPY.onboarding.helper}
          control={
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/demo/welcome" />}
            >
              {COPY.onboarding.action}
            </Button>
          }
        />
        <Row
          dimmed={offline}
          labelId={`${ids}-data`}
          label={COPY.data.label}
          helper={COPY.data.helper}
          control={
            <Button
              ref={resetTrigger}
              variant="destructive"
              disabled={offline}
              aria-describedby={cn(`${ids}-data-helper`, lockedBy)}
              className="disabled:opacity-100"
              onClick={() => setResetOpen(true)}
            >
              {COPY.data.action}
            </Button>
          }
        />
      </Group>

      <ConfirmDialog
        open={resetOpen}
        title={COPY.reset.title}
        body={COPY.reset.body}
        confirmLabel={COPY.reset.confirm}
        pendingLabel={COPY.reset.pending}
        onConfirm={confirmReset}
        onCancel={() => setResetOpen(false)}
        triggerRef={resetTrigger}
      />
    </div>
  );
}
