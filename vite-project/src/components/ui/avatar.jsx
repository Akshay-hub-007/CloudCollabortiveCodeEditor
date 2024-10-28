import { cn } from "../../lib/utils";

export default function Avatar({
  name,
  className,
}) {
  return (
    <div
      className={cn(
        className,
        "w-6 h-6 font-mono rounded-full overflow-hidden bg-gradient-to-t from-neutral-800 to-neutral-600 flex items-center justify-center text-[.7rem] font-medium"
      )}
    >
      {name
        ?.split("")
        .splice(0, 2)
        .map((letter) => letter[0].toUpperCase())}
    </div>
  );
}
