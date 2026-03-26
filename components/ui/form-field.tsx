"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FormFieldProps = {
  label: string
  htmlFor: string
  error?: string
  helperText?: string
  className?: string
  children: React.ReactNode
}

function FormField({
  label,
  htmlFor,
  error,
  helperText,
  className,
  children,
}: FormFieldProps) {
  const errorId = `${htmlFor}-error`
  const helperId = `${htmlFor}-helper`

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  )
}

export { FormField }
export type { FormFieldProps }
