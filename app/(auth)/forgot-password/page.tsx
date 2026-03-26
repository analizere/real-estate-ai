"use client"

import { useState } from "react"
import Link from "next/link"
import { requestPasswordReset } from "@/lib/auth-client"
import { AuthCard } from "@/components/auth/auth-card"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  function clearFieldError(field: string) {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
    setFormError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!email.trim()) newErrors.email = "Email is required."

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setFormError("")

    const { error } = await requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    })

    setLoading(false)

    if (error) {
      setFormError("Something went wrong. Please try again in a moment.")
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <AuthCard
        title="Link sent"
        footer={
          <Link
            href="/sign-in"
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          If {email} has an account, you&apos;ll receive a reset link shortly.
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Reset your password"
      footer={
        <Link
          href="/sign-in"
          className="text-sm text-accent underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <div role="alert" className="text-sm text-destructive">
            {formError}
          </div>
        )}

        <FormField label="Email" htmlFor="reset-email" error={errors.email}>
          <Input
            id="reset-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearFieldError("email")
            }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "reset-email-error" : undefined}
            className="min-h-[44px]"
          />
        </FormField>

        <Button
          type="submit"
          className="w-full min-h-[44px]"
          disabled={loading}
        >
          {loading && <Spinner size="sm" />}
          Send reset link
        </Button>
      </form>
    </AuthCard>
  )
}
