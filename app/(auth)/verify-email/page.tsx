"use client"

import { Suspense, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { sendVerificationEmail } from "@/lib/auth-client"
import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const confirmRef = useRef<HTMLDivElement>(null)

  async function handleResend() {
    if (!email) return
    setResending(true)
    setResent(false)
    await sendVerificationEmail({ email })
    setResending(false)
    setResent(true)
    setTimeout(() => { confirmRef.current?.focus() }, 0)
  }

  return (
    <AuthCard
      title="Check your inbox"
      footer={
        <Link href="/sign-in" className="text-sm text-accent underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Click it to activate your account.
        </p>
        <p className="text-sm text-muted-foreground">
          Verification is required before accessing paid features.
        </p>
        <Button type="button" variant="outline" className="w-full min-h-[44px]" onClick={handleResend} disabled={resending}>
          {resending && <Spinner size="sm" />}
          Didn&apos;t get it? Resend email
        </Button>
        {resent && (
          <div ref={confirmRef} role="status" tabIndex={-1} className="text-sm text-muted-foreground text-center outline-none">
            Verification email resent.
          </div>
        )}
      </div>
    </AuthCard>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthCard title="Check your inbox"><p className="text-sm text-muted-foreground">Loading...</p></AuthCard>}>
      <VerifyEmailForm />
    </Suspense>
  )
}
