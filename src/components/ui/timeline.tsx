
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  children: React.ReactNode
}

const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ol ref={ref} className={cn("flex flex-col", className)} {...props}>
        {children}
      </ol>
    )
  }
)
Timeline.displayName = "Timeline"

interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode
}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("relative flex flex-col p-4 pt-0", className)}
        {...props}
      >
        {children}
      </li>
    )
  }
)
TimelineItem.displayName = "TimelineItem"

interface TimelineConnectorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  TimelineConnectorProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute left-[25.5px] top-5 h-full w-px -translate-x-1/2 bg-border",
        className
      )}
      {...props}
    />
  )
})
TimelineConnector.displayName = "TimelineConnector"

interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const TimelineHeader = React.forwardRef<HTMLDivElement, TimelineHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-4", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TimelineHeader.displayName = "TimelineHeader"

interface TimelineIconProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const TimelineIcon = React.forwardRef<HTMLDivElement, TimelineIconProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border bg-background",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TimelineIcon.displayName = "TimelineIcon"

interface TimelineTitleProps extends React.HTMLAttributes<HTMLHeadElement> {
  children: React.ReactNode
}

const TimelineTitle = React.forwardRef<HTMLHeadElement, TimelineTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("font-semibold text-foreground", className)}
        {...props}
      >
        {children}
      </h3>
    )
  }
)
TimelineTitle.displayName = "TimelineTitle"

interface TimelineDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  TimelineDescriptionProps
>(({ children, className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
})
TimelineDescription.displayName = "TimelineDescription"

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 p-4 pl-14", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TimelineContent.displayName = "TimelineContent"

export {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineTitle,
  TimelineDescription,
  TimelineContent,
}

