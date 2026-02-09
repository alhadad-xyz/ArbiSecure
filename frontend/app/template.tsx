"use client";

import Transition from "@/components/animations/Transition";

export default function Template({ children }: { children: React.ReactNode }) {
    return <Transition>{children}</Transition>;
}
