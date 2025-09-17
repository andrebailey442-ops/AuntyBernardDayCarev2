
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
import { getPermissionsByRole, savePermissionsByRole } from '@/services/permissions';
import type { UserRole } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PermissionManager() {
  const { toast } = useToast();
  const [teacherPermissions, setTeacherPermissions] = React.useState<string[]>([]);
  const [adminPermissions, setAdminPermissions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<UserRole>('Teacher');

  React.useEffect(() => {
    const fetchPermissions = () => {
      setLoading(true);
      const teacherPerms = getPermissionsByRole('Teacher');
      const adminPerms = getPermissionsByRole('Admin');
      setTeacherPermissions(teacherPerms);
      setAdminPermissions(adminPerms);
      setLoading(false);
    };
    fetchPermissions();
  }, []);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const setPermissions = activeTab === 'Teacher' ? setTeacherPermissions : setAdminPermissions;
    setPermissions(prev =>
      checked
        ? [...prev, permissionId]
        : prev.filter(p => p !== permissionId)
    );
  };

  const handleSaveChanges = () => {
    setSaving(true);
    try {
      const permissionsToSave = activeTab === 'Teacher' ? teacherPermissions : adminPermissions;
      savePermissionsByRole(activeTab, permissionsToSave);
      toast({
        title: 'Permissions Updated',
        description: `${activeTab} role permissions have been saved.`,
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
          <Card className="backdrop-blur-sm bg-card/80">
              <CardHeader>
                  <CardTitle>Loading Permissions...</CardTitle>
              </CardHeader>
          </Card>
      )
  }

  const renderPermissionsGrid = (permissions: string[]) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PERMISSIONS.map(permission => (
              <div key={permission.id} className="flex items-center space-x-2 p-4 border rounded-lg bg-background/50">
                  <Checkbox
                      id={`${activeTab}-${permission.id}`}
                      checked={permissions.includes(permission.id)}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                      disabled={activeTab === 'Admin' && permission.id === '/dashboard/manage-users'}
                  />
                  <Label htmlFor={`${activeTab}-${permission.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                     {permission.label}
                  </Label>
              </div>
          ))}
      </div>
      <div className="flex justify-end pt-4">
          <Button onClick={handleSaveChanges} disabled={saving}>
              {saving ? 'Saving...' : `Save ${activeTab} Permissions`}
          </Button>
      </div>
    </div>
  )

  return (
    <Card className="backdrop-blur-sm bg-card/80">
      <CardHeader>
        <CardTitle>Role Permissions</CardTitle>
        <CardDescription>
          Select the dashboard sections that each user role can access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserRole)}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="Teacher">Teacher Role</TabsTrigger>
                <TabsTrigger value="Admin">Admin Role</TabsTrigger>
            </TabsList>
            <TabsContent value="Teacher" className="mt-4">
                {renderPermissionsGrid(teacherPermissions)}
            </TabsContent>
            <TabsContent value="Admin" className="mt-4">
                {renderPermissionsGrid(adminPermissions)}
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
