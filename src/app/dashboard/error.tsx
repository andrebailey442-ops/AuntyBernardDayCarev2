
'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md text-center backdrop-blur-sm bg-card/80">
            <CardHeader>
                <CardTitle className="text-2xl text-destructive">Something went wrong!</CardTitle>
                <CardDescription>{error.message || 'An unexpected error occurred.'}</CardDescription>
            </CardHeader>
            <CardContent>
            <Button
                onClick={
                // Attempt to recover by trying to re-render the segment
                () => reset()
                }
            >
                Try again
            </Button>
            </CardContent>
        </Card>
    </div>
  )
}
