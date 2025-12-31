import React from "react";

import { DatePicker } from "@/components/ui/date-picker";

/**
 * Unified date field for the app.
 * - Displays as dd/MM/yyyy
 * - Stores value as yyyy-MM-dd (string)
 */
export function DateField(props) {
  return <DatePicker {...props} />;
}
