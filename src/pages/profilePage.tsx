import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserProfile, ProfileFormData } from './types';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import { User, Mail, Phone, Calendar, Camera, Save, Edit, AlertCircle, Briefcase, Link as LinkIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/app/rootReducer';
import { useParams } from 'react-router-dom';
import { fetchUserByIdRequest } from '@/store/features/users/users.actions';
import type { AppDispatch } from '@/store/app/store';
import LoadingProfileInfo from '@/components/profileComponents/loadingProfile-info';
import ProfileNotFound from '@/components/profileComponents/profileNotFound';
import ErrorAlert from '@/components/profileComponents/errorAlert';
import PageHead from '@/components/shared/page-head';
import { fetchRoleByIdRequest } from '@/store/features/roles/roles.actions';

// Validation Schema
const profileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number').optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  company: z.object({
    name: z.string().optional().or(z.literal('')),
    jobTitle: z.string().optional().or(z.literal('')),
    size: z.string().optional().or(z.literal('')),
    industry: z.string().optional().or(z.literal('')),
  }).optional(),
  socialNetworks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
});

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { user, isLoading: loadingData, error } = useSelector((state: RootState) => state.users);
  const { role } = useSelector((state: RootState) => state.roles);
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();

  // Safe date formatting function
  const formatDate = (dateInput: any): string => {
    if (!dateInput) return '';
    
    try {
      if (typeof dateInput === 'string') {
        return new Date(dateInput).toISOString().split('T')[0];
      } else if (dateInput.$date && dateInput.$date.$numberLong) {
        return new Date(parseInt(dateInput.$date.$numberLong)).toISOString().split('T')[0];
      } else if (dateInput.$numberLong) {
        return new Date(parseInt(dateInput.$numberLong)).toISOString().split('T')[0];
      } else if (dateInput instanceof Date) {
        return dateInput.toISOString().split('T')[0];
      }
      return '';
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  useEffect(() => {
    console.log(role)
  }, [role]);

  // Safe date display formatting
  const formatDateForDisplay = (dateInput: any): string => {
    if (!dateInput) return 'N/A';
    
    try {
      let date: Date;
      
      if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      } else if (dateInput.$date && dateInput.$date.$numberLong) {
        date = new Date(parseInt(dateInput.$date.$numberLong));
      } else if (dateInput.$numberLong) {
        date = new Date(parseInt(dateInput.$numberLong));
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        return 'N/A';
      }
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date for display:', error);
      return 'N/A';
    }
  };

  // Helper function to check if value exists
  const hasValue = (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
  };

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      birthday: '',
      country: '',
      city: '',
      gender: 'MALE',
      company: {
        name: '',
        jobTitle: '',
        size: '',
        industry: '',
      },
      socialNetworks: {
        linkedin: '',
        website: '',
      },
    },
  });

  // Reset form when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        birthday: user.birthday ? formatDate(user.birthday) : '',
        country: user.country || '',
        city: user.city || '',
        gender: user.gender || 'MALE',
        company: {
          name: user.company?.name || '',
          jobTitle: user.company?.jobTitle || '',
          size: user.company?.size || '',
          industry: user.company?.industry || '',
        },
        socialNetworks: {
          linkedin: user.socialNetworks?.linkedin || '',
          website: user.socialNetworks?.website || '',
        },
      });

      dispatch(fetchRoleByIdRequest(user.role));
    }
  }, [user, form]);

  // Fetch user data when component mounts or userId changes
  useEffect(() => {
    if (params.userId) {
      dispatch(fetchUserByIdRequest(params.userId));
    }
  }, [params.userId, dispatch]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement update profile action
      // await dispatch(updateUserProfileRequest({ userId: params.userId!, data }));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handlePasswordChange = async () => {
    setPasswordError('');
    
    // Validation
    if (!newPassword || !confirmPassword) {
      setPasswordError('Both password fields are required');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement change password action
      // await dispatch(changePasswordRequest({ userId: params.userId!, newPassword }));
      setShowPasswordChange(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError('Failed to change password. Please try again.');
      console.error('Failed to change password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loadingData) {
    return <LoadingProfileInfo />;
  }

  if (error) {
    return <ErrorAlert error={error} userId={params.userId} />;
  }

  if (!user) {
    return <ProfileNotFound userId={params.userId} />;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <PageHead title='Profile' description='Manage your account settings and personal information' icon={User} />
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing(!isEditing)}
          disabled={isLoading}
        >
          <Edit className="w-4 h-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="account">Account Details</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  This will be displayed on your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={user.picture} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" disabled={!isEditing}>
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  {hasValue(user.isActive) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  )}
                  {hasValue(user.registrationCompleted) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Registration</span>
                      <Badge variant={user.registrationCompleted ? "default" : "secondary"}>
                        {user.registrationCompleted ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  )}
                  {hasValue(role) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Role</span>
                      <Badge variant="default">
                        {role}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder="Enter your first name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder="Enter your last name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              disabled={!isEditing || isLoading}
                              placeholder="Enter your email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={!isEditing || isLoading}
                              placeholder="Enter your phone number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {hasValue(user.birthday) && (
                        <FormField
                          control={form.control}
                          name="birthday"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Birthday</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="date"
                                  disabled={!isEditing || isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {hasValue(user.gender) && (
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                disabled={!isEditing || isLoading}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MALE">Male</SelectItem>
                                  <SelectItem value="FEMALE">Female</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {hasValue(user.country) && (
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled={!isEditing || isLoading}
                                  placeholder="Enter your country"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {hasValue(user.city) && (
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled={!isEditing || isLoading}
                                  placeholder="Enter your city"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          <Save className="w-4 h-4 mr-2" />
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Information
              </CardTitle>
              <CardDescription>
                Your company and professional details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hasValue(user.company?.name) && (
                      <FormField
                        control={form.control}
                        name="company.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder="Enter company name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {hasValue(user.company?.jobTitle) && (
                      <FormField
                        control={form.control}
                        name="company.jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder="Enter your job title"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {hasValue(user.company?.industry) && (
                      <FormField
                        control={form.control}
                        name="company.industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder="Enter industry"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {hasValue(user.company?.size) && (
                      <FormField
                        control={form.control}
                        name="company.size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Size</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder="Enter company size"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <LinkIcon className="w-5 h-5" />
                      Social Networks
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {hasValue(user.socialNetworks?.linkedin) && (
                        <FormField
                          control={form.control}
                          name="socialNetworks.linkedin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LinkedIn</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="url"
                                  disabled={!isEditing || isLoading}
                                  placeholder="https://linkedin.com/in/yourprofile"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {hasValue(user.socialNetworks?.website) && (
                        <FormField
                          control={form.control}
                          name="socialNetworks.website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="url"
                                  disabled={!isEditing || isLoading}
                                  placeholder="https://yourwebsite.com"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
           <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details and verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hasValue(user.user) && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg border">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">User Type</p>
                        <p className="text-sm text-muted-foreground">{user.user}</p>
                      </div>
                    </div>
                  )}

                  {hasValue(user.verificationCode?.code) && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-400">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Verification Code</p>
                        <p className="text-sm text-muted-foreground">{user.verificationCode?.code}</p>
                      </div>
                    </div>
                  )}

                  {hasValue(user.createdAt) && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-400">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Member Since</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateForDisplay(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {hasValue(user.updatedAt) && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-400">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateForDisplay(user.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Security</h4>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-400">
                    <div>
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated {formatDateForDisplay(user.updatedAt)}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      disabled={isLoading}
                    >
                      {showPasswordChange ? 'Cancel' : 'Change Password'}
                    </Button>
                  </div>

                  {showPasswordChange && (
                    <Card className="bg-muted/50 border-dashed mt-4">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">New Password</label>
                            <Input
                              type="password"
                              placeholder="Enter new password (min 8 characters)"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              disabled={isLoading}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium">Confirm Password</label>
                            <Input
                              type="password"
                              placeholder="Confirm new password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={isLoading}
                              className="mt-1"
                            />
                          </div>

                          {passwordError && (
                            <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                              <AlertCircle className="w-4 h-4" />
                              <span>{passwordError}</span>
                            </div>
                          )}

                          <div className="flex justify-end space-x-3 pt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowPasswordChange(false);
                                setNewPassword('');
                                setConfirmPassword('');
                                setPasswordError('');
                              }}
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handlePasswordChange}
                              disabled={isLoading}
                            >
                              {isLoading ? 'Updating...' : 'Update Password'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;