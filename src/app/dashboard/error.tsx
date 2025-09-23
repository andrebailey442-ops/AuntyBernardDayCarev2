
'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
 
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
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl text-destructive">Something went wrong!</CardTitle>
                <CardDescription>{error.message || 'An unexpected error occurred. Please try again or contact support if the problem persists.'}</CardDescription>
            </CardHeader>
            <CardContent>
                {error.digest && (
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                        <p>Error Code: {error.digest}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                    }
                    className="w-full"
                >
                    Try again
                </Button>
            </CardFooter>
        </Card>
    </div>
  )
}
