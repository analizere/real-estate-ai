"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/lib/auth-client"
import { AuthCard } from "@/components/auth/auth-card"
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button"
import { PasswordInput } from "@/components/auth/password-input"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
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
    if (!name.trim()) newErrors.name = "Name is required."
    if (!email.trim()) newErrors.email = "Email is required."
    if (!password) newErrors.password = "Password is required."
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters."

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setFormError("")

    const { error } = await signUp.email({
      email,
      password,
      name,
    })

    if (error) {
      setLoading(false)
      if (
        error.message?.toLowerCase().includes("already exists") ||
        error.message?.toLowerCase().includes("already registered")
      ) {
        setFormError(
          "An account with this email already exists. Sign in instead."
        )
      } else {
        setFormError("Something went wrong. Please try again in a moment.")
      }
      return
    }

    router.push(`/verify-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <>
      <h1 className="text-[28px] font-semibold leading-[1.15] text-center mb-6">
        Analyze any deal in 60 seconds.
      </h1>

      <AuthCard
        title="Create your account"
        footer={
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-accent underline-offset-4 hover:underline"
            >
              Sign in
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

          <FormField label="Name" htmlFor="name" error={errors.name}>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                clearFieldError("name")
              }}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              className="min-h-[44px]"
            />
          </FormField>

          <FormField label="Email" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearFieldError("email")
              }}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="min-h-[44px]"
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password}
          >
            <PasswordInput
              id="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearFieldError("password")
              }}
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "password-error" : undefined
              }
              className="min-h-[44px]"
            />
          </FormField>

          <Button
            type="submit"
            className="w-full min-h-[44px]"
            disabled={loading}
          >
            {loading && <Spinner size="sm" />}
            Create account
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
    </>
  )
}
