"use client"

import { Suspense } from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { resetPassword } from "@/lib/auth-client"
import { AuthCard } from "@/components/auth/auth-card"
import { PasswordInput } from "@/components/auth/password-input"
import { FormField } from "@/components/ui/form-field"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)

  function clearFieldError(field: string) {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
    setFormError("")
  }

  if (!token) {
    return (
      <AuthCard title="Reset your password">
        <div className="space-y-4">
          <p className="text-sm text-destructive">
            This reset link has expired. Request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </AuthCard>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!newPassword)
      newErrors.newPassword = "Password is required."
    else if (newPassword.length < 8)
      newErrors.newPassword = "Password must be at least 8 characters."
    if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match."

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setFormError("")

    const { error } = await resetPassword({
      newPassword,
      token: token!,
    })

    if (error) {
      setLoading(false)
      setFormError("This reset link has expired. Request a new one.")
      return
    }

    router.push("/sign-in")
  }

  return (
    <AuthCard title="Set a new password">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <div role="alert" className="text-sm text-destructive">
            {formError}
          </div>
        )}

        <FormField
          label="New password"
          htmlFor="new-password"
          error={errors.newPassword}
        >
          <PasswordInput
            id="new-password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              clearFieldError("newPassword")
            }}
            aria-invalid={!!errors.newPassword}
            aria-describedby={errors.newPassword ? "new-password-error" : undefined}
            className="min-h-[44px]"
          />
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="confirm-password"
          error={errors.confirmPassword}
        >
          <PasswordInput
            id="confirm-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              clearFieldError("confirmPassword")
            }}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            className="min-h-[44px]"
          />
        </FormField>

        <Button
          type="submit"
          className="w-full min-h-[44px]"
          disabled={loading}
        >
          {loading && <Spinner size="sm" />}
          Set new password
        </Button>
      </form>
    </AuthCard>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthCard title="Reset your password"><p className="text-sm text-muted-foreground">Loading...</p></AuthCard>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
