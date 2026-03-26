"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "@/lib/auth-client"
import { AuthCard } from "@/components/auth/auth-card"
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button"
import { PasswordInput } from "@/components/auth/password-input"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!email.trim()) newErrors.email = "Email is required."
    if (!password) newErrors.password = "Password is required."

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setFormError("")

    const { error } = await signIn.email({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      setFormError(
        "Email or password is incorrect. Try again or reset your password."
      )
      return
    }

    router.push("/")
  }

  return (
    <AuthCard
      title="Sign in to your account"
      footer={
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-accent underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <div role="alert" className="text-sm text-destructive">
            {formError}
          </div>
        )}

        <FormField label="Email" htmlFor="signin-email" error={errors.email}>
          <Input
            id="signin-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearFieldError("email")
            }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "signin-email-error" : undefined}
            className="min-h-[44px]"
          />
        </FormField>

        <div>
          <FormField
            label="Password"
            htmlFor="signin-password"
            error={errors.password}
          >
            <PasswordInput
              id="signin-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearFieldError("password")
              }}
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "signin-password-error" : undefined
              }
              className="min-h-[44px]"
            />
          </FormField>
          <div className="mt-1.5 text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-accent underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full min-h-[44px]"
          disabled={loading}
        >
          {loading && <Spinner size="sm" />}
          Sign in
        </Button>
      </form>

      <div className="relative my-6 flex items-center justify-center">
        <Separator className="absolute w-full" />
        <span className="relative bg-card px-3 text-sm text-muted-foreground">
          Or continue with
        </span>
      </div>

      <GoogleOAuthButton />
    </AuthCard>
  )
}
