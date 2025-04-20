"use client"

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Farewell Pass Manager
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/students">Students</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/scanner">Scanner</Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}