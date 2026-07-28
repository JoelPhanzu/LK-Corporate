import { cn } from "@/lib/utils";

/**
 * Primitives de formulaire.
 *
 * Règles appliquées partout : le libellé est AU-DESSUS du champ, jamais dans
 * le placeholder ; le texte d'aide suit le libellé ; le message d'erreur se
 * place SOUS le champ et est relié par aria-describedby.
 */

const CHAMP_BASE = [
  "w-full rounded-brand border bg-surface px-3.5 py-2.5",
  "text-base text-ink placeholder:text-ink-muted",
  "transition-colors",
  "disabled:opacity-60",
].join(" ");

function bordure(enErreur?: boolean) {
  return enErreur
    ? "border-red-600 dark:border-red-400"
    : "border-line-strong hover:border-ink-muted";
}

export function Champ({
  htmlFor,
  label,
  aide,
  erreur,
  obligatoire,
  children,
}: {
  htmlFor: string;
  label: string;
  aide?: string;
  erreur?: string;
  obligatoire?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
        {obligatoire && (
          <span className="ml-1 text-accent-text" aria-hidden>
            *
          </span>
        )}
        {!obligatoire && (
          <span className="ml-2 font-normal text-ink-muted">(facultatif)</span>
        )}
      </label>
      {aide && (
        <p id={`${htmlFor}-aide`} className="text-sm text-ink-muted">
          {aide}
        </p>
      )}
      {children}
      {erreur && (
        <p
          id={`${htmlFor}-erreur`}
          role="alert"
          className="text-sm font-medium text-red-700 dark:text-red-400"
        >
          {erreur}
        </p>
      )}
    </div>
  );
}

type PropsCommunes = { enErreur?: boolean; className?: string };

export function Input({
  enErreur,
  className,
  ...props
}: PropsCommunes & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(CHAMP_BASE, bordure(enErreur), className)}
      aria-invalid={enErreur || undefined}
      {...props}
    />
  );
}

export function Textarea({
  enErreur,
  className,
  ...props
}: PropsCommunes & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(CHAMP_BASE, bordure(enErreur), "min-h-40 resize-y", className)}
      aria-invalid={enErreur || undefined}
      {...props}
    />
  );
}

export function Select({
  enErreur,
  className,
  children,
  ...props
}: PropsCommunes & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(CHAMP_BASE, bordure(enErreur), className)}
      aria-invalid={enErreur || undefined}
      {...props}
    >
      {children}
    </select>
  );
}
