export const Avatar = ({ initials, size = "md", color = "bg-amber-600" }: { initials: string; size?: "sm" | "md" | "lg"; color?: string }) => {
    const sz = size === "lg" ? "w-12 h-12 text-base" : size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
    return <div className={`${sz} ${color} rounded-full flex items-center justify-center font-bold text-white shrink-0`}>{initials}</div>;
};
