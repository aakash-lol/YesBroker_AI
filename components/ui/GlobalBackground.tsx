"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";

export default function GlobalBackground() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      <Image
        src="/images/backimg.png"
        alt="Background"
        fill
        className="object-cover object-bottom"
        priority
      />
    </div>
  );
}
