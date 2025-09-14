
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PERMISSIONS } from '@/lib/data';
import { getTeacherPermissions, saveTeacherPermissions } from '@/services/permissions';

export default function PermissionManager() {
  const { toast } = useToast();
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const fetchPermissions = async () => {
      setLoading(true);
      const currentPermissions = await getTeacherPermissions();
      setPermissions(currentPermissions);
      setLoading(false);
    };
    fetchPermissions();
  }, []);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setPermissions(prev =>
      checked
        ? [...prev, permissionId]
        : prev.filter(p => p !== permissionId)
    );
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      await saveTeacherPermissions(permissions);
      toast({
        title: 'Permissions Updated',
        description: "Teacher role permissions have been saved.",
      });
    } catch (error) {
      console.error('Failed to save permissions:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the new permission settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Loading Permissions...</CardTitle>
              </CardHeader>
          </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Role Permissions</CardTitle>
        <CardDescription>
          Select the dashboard sections that users with the 'Teacher' role can access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERMISSIONS.map(permission => (
                <div key={permission.id} className="flex items-center space-x-2 p-4 border rounded-lg">
                    <Checkbox
                        id={permission.id}
                        checked={permissions.includes(permission.id)}
                        onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                    />
                    <Label htmlFor={permission.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                       {permission.label}
                    </Label>
                </div>
            ))}
        </div>
        <div className="flex justify-end pt-4">
            <Button onClick={handleSaveChanges} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
