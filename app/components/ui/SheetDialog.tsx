import type { ReactNode, RefObject } from "react";

/**
 * The shared chrome for both sheets: a full-viewport dialog with a dimmed
 * backdrop, holding a right-aligned scrolling panel. Below the lap breakpoint
 * the panel fills the screen instead of insetting.
 *
 * The panel is only rendered when there is something to put in it, so a closed
 * dialog contributes nothing to the prerendered HTML.
 */
const sheet =
  "m-auto h-[100dvh] w-screen max-h-none max-w-none border-0 bg-transparent p-[15px] backdrop:bg-[rgba(20,23,22,0.7)] backdrop:backdrop-blur-[5px] max-lap:p-0";

const shell =
  "ml-auto h-[calc(100dvh-30px)] overflow-y-auto bg-paper max-lap:h-[100dvh] max-lap:max-w-none max-lap:pb-[env(safe-area-inset-bottom)]";

export function SheetDialog({
  dialogRef,
  maxWidth = "max-w-[1180px]",
  onClose,
  onDismiss,
  children,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  maxWidth?: string;
  onClose?: () => void;
  onDismiss: () => void;
  children: ReactNode;
}) {
  return (
    <dialog
      ref={dialogRef}
      className={sheet}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      {children ? <div className={`${shell} ${maxWidth}`}>{children}</div> : null}
    </dialog>
  );
}

export function SheetHeader({
  label,
  title,
  closeLabel,
  onDismiss,
}: {
  label: string;
  title: ReactNode;
  closeLabel: string;
  onDismiss: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex min-h-[78px] items-center justify-between border-b border-line bg-[rgba(246,244,237,0.94)] px-[25px] py-[13px] backdrop-blur-[15px]">
      <div>
        <span className="mb-1 block font-mona text-[9px] tracking-[0.11em] uppercase opacity-50">
          {label}
        </span>
        <strong className="block font-mona text-[17px]">{title}</strong>
      </div>
      <button
        type="button"
        className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-line-strong bg-transparent text-2xl leading-none"
        onClick={onDismiss}
        aria-label={closeLabel}
      >
        ×
      </button>
    </header>
  );
}
