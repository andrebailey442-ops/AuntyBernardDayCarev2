
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

export default function DateTimeDisplay() {
  const [currentDateTime, setCurrentDateTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update every second

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Card className="backdrop-blur-sm bg-card/80">
        <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Calendar className="h-6 w-6 text-primary" />
                <div>
                    <p className="font-semibold">{format(currentDateTime, 'eeee, MMMM do, yyyy')}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                    <p className="font-mono text-lg">{format(currentDateTime, 'h:mm:ss a')}</p>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
