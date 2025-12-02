import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
function Input({ className, type, ...props }) {
    return (_jsx("input", { type: type, "data-slot": "input", className: cn("h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className), ...props }));
}
export { Input };
