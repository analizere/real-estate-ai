"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AuthCardProps = {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <Card className={cn("p-6 md:p-8", className)}>
      <CardHeader className="px-0 pt-0">
        <h1 className="text-2xl font-semibold leading-[1.2]">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="px-0">{children}</CardContent>
      {footer && (
        <CardFooter className="justify-center border-t-0 bg-transparent px-0 pb-0 pt-4">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}

export { AuthCard }
export type { AuthCardProps }
