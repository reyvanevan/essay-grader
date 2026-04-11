"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type AssignmentRealtimeListenerProps = {
  assignmentId: string;
};

export function AssignmentRealtimeListener({ assignmentId }: AssignmentRealtimeListenerProps) {
  const router = useRouter();
  const refreshTimer = useRef<number | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const triggerRefresh = () => {
      if (refreshTimer.current) {
        window.clearTimeout(refreshTimer.current);
      }

      refreshTimer.current = window.setTimeout(() => {
        router.refresh();
      }, 300);
    };

    const channel = supabase
      .channel(`assignment-${assignmentId}-changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "submissions",
          filter: `assignment_id=eq.${assignmentId}`,
        },
        triggerRefresh
      )
      .subscribe();

    return () => {
      if (refreshTimer.current) {
        window.clearTimeout(refreshTimer.current);
      }
      supabase.removeChannel(channel);
    };
  }, [assignmentId, router]);

  return null;
}
