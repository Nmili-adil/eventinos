import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import { User, Mail, Phone, Calendar, Camera, Save, Edit, AlertCircle, Briefcase, Link as LinkIcon, Plus, ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/app/rootReducer';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUserByIdRequest } from '@/store/features/users/users.actions';
import type { AppDispatch } from '@/store/app/store';
import LoadingProfileInfo from '@/components/profileComponents/loadingProfile-info';
import ProfileNotFound from '@/components/profileComponents/profileNotFound';
import ErrorAlert from '@/components/profileComponents/errorAlert';
import PageHead from '@/components/shared/page-head';
import { fetchRoleByIdRequest } from '@/store/features/roles/roles.actions';
import { fetchRightsRequest } from '@/store/features/rights/rights.actions';
import { updateUserApi, updateUserPasswordApi } from '@/api/usersApi';
import { uploadFileApi } from '@/api/filesApi';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getRole } from '@/services/localStorage';

interface ProfileFormData {

  firstName: string;
  lastName: string;
  email: string;
  // phoneNumber: string;
  birthday: string;
  country: string;
  city: string;
  gender: string;
}
        // Validation Schema
const profileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  // phoneNumber: z.string().min(10, 'Please enter a valid phone number').optional().or(z.literal('')),
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
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading: loadingData, error } = useSelector((state: RootState) => state.users);
  const { role } = useSelector((state: RootState) => state.roles);
  const { rights, loading: rightsLoading } = useSelector((state: RootState) => state.rights);
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate()

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
    if (!dateInput) return t('profilePage.common.notAvailable');
    
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
        return t('profilePage.common.notAvailable');
      }
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date for display:', error);
        return t('profilePage.common.notAvailable');
      return t('profilePage.common.notAvailable');
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
      // phoneNumber: '',
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
        // phoneNumber: user.phoneNumber || '',
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
      dispatch(fetchRightsRequest());
    }
  }, [user, form, dispatch]);

  // Fetch user data when component mounts or userId changes
  useEffect(() => {
    if (params.userId) {
      dispatch(fetchUserByIdRequest(params.userId));
    }
  }, [params.userId, dispatch]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      if (params.userId) {
        await updateUserApi(params.userId, data);
        toast.success(t('profilePage.messages.profileUpdated'));
        setIsEditing(false);
        // Refresh user data
        dispatch(fetchUserByIdRequest(params.userId));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || t('profilePage.messages.profileUpdateFailed'));
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handlePasswordChange = async () => {
    setPasswordError('');
    
    // Validation
    if (!newPassword || !confirmPassword) {
      setPasswordError(t('profilePage.errors.passwordRequired'));
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError(t('profilePage.errors.passwordMinLength'));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError(t('profilePage.errors.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    try {
      if (params.userId) {
        await updateUserPasswordApi(params.userId, newPassword);
        toast.success(t('profilePage.messages.passwordUpdated'));
        setShowPasswordChange(false);
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      setPasswordError(error?.response?.data?.message || t('profilePage.messages.passwordFailed'));
      console.error('Failed to change password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('profilePage.messages.invalidFileType'));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('profilePage.messages.fileTooLarge'));
        return;
      }

      setSelectedPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto || !params.userId) return;

    setIsUploadingPhoto(true);
    
    try {
      // Step 1: Upload the file to get the file ID
      const imagePath = await uploadFileApi(selectedPhoto);
      
      
      // Step 2: Update user profile with the new picture ID
     await updateUserApi(params.userId, { picture: imagePath.data?.data?.path });
      
      toast.success(t('profilePage.messages.photoUpdated'));
      
      // Clear selection and refresh user data
      setSelectedPhoto(null);
      setPhotoPreview(null);
      dispatch(fetchUserByIdRequest(params.userId));
    } catch (error: any) {
      toast.error(error?.message || t('profilePage.messages.photoUploadFailed'));
      console.error('Failed to upload photo:', error);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCancelPhotoUpload = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRoleChange = () => {
    
  }

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <PageHead
          title={t('profilePage.title')}
          description={t('profilePage.description')}
          icon={User}
          total={0}
        />
        <div className='flex items-center gap-3'>
    <Button
      variant={"outline"}
      size={'icon'}
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className='w-4 h-4'/>
    </Button>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing(!isEditing)}
          disabled={isLoading}
        >
          <Edit className="w-4 h-4 mr-2" />
          {isEditing ? t('profilePage.buttons.cancelEdit') : t('profilePage.buttons.editProfile')}
        </Button>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">{t('profilePage.tabs.personal')}</TabsTrigger>
          <TabsTrigger value="professional">{t('profilePage.tabs.professional')}</TabsTrigger>
          <TabsTrigger value="account">{t('profilePage.tabs.account')}</TabsTrigger>
          <TabsTrigger value="roles-rights">{t('profilePage.tabs.rolesRights')}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1 border-slate-300 shadow-md p-0 overflow-hidden">
              <CardHeader className="bg-linear-to-br from-blue-50 to-purple-50 rounded-t-lg py-4 px-6">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  {t('profilePage.personal.profilePicture.title')}
                </CardTitle>
                <CardDescription>
                  {t('profilePage.personal.profilePicture.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-lg ring-2 ring-blue-200">
                      <AvatarImage 
                        src={photoPreview || user.picture} 
                        alt={`${user.firstName} ${user.lastName}`} 
                      />
                      <AvatarFallback className="text-3xl bg-linear-to-br from-blue-500 to-purple-500 text-white">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="absolute bottom-0 right-0">
                        <Button 
                          type="button"
                          variant="secondary" 
                          size="sm" 
                          className="rounded-full w-10 h-10 p-0 shadow-md hover:scale-110 transition-transform"
                          onClick={handlePhotoClick}
                          disabled={isUploadingPhoto}
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  
                  {isEditing && !selectedPhoto && (
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={handlePhotoClick}
                      disabled={isUploadingPhoto}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {t('profilePage.buttons.changePhoto')}
                    </Button>
                  )}
                  
                  {selectedPhoto && (
                    <div className="w-full space-y-2">
                      <p className="text-sm text-muted-foreground text-center">
                        {selectedPhoto.name}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCancelPhotoUpload}
                          disabled={isUploadingPhoto}
                          className="flex-1"
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handlePhotoUpload}
                          disabled={isUploadingPhoto}
                          className="flex-1"
                        >
                          {isUploadingPhoto ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              {t('common.uploading')}
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              {t('common.upload')}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {t('profilePage.personal.accountStatus')}
                  </h4>
                  {hasValue(user.isActive) && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">{t('profilePage.personal.status')}</span>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? t('profilePage.status.active') : t('profilePage.status.inactive')}
                      </Badge>
                    </div>
                  )}
                  {hasValue(user.registrationCompleted) && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">{t('profilePage.personal.registration')}</span>
                      <Badge variant={user.registrationCompleted ? "default" : "secondary"}>
                        {user.registrationCompleted ? t('profilePage.status.completed') : t('profilePage.status.pending')}
                      </Badge>
                    </div>
                  )}
                  {hasValue(role) && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">{t('profilePage.personal.role')}</span>
                      <Badge variant="default">
                        {typeof role === 'object' && role !== null ? role.name : role}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Form */}
            <Card className="lg:col-span-2 border-slate-300 shadow-md overflow-hidden p-0">
              <CardHeader className="bg-linear-to-r from-blue-50 to-purple-50 rounded-t-lg py-4 px-6">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  {t('profilePage.personal.form.title')}
                </CardTitle>
                <CardDescription>
                  {t('profilePage.personal.form.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 px-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profilePage.fields.firstName.label')}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.fields.firstName.placeholder')}
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
                            <FormLabel>{t('profilePage.fields.lastName.label')}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.fields.lastName.placeholder')}
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
                        <FormLabel>{t('profilePage.fields.email.label')}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              disabled={!isEditing || isLoading}
                              placeholder={t('profilePage.fields.email.placeholder')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('profilePage.fields.phone.label')}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={!isEditing || isLoading}
                              placeholder={t('profilePage.fields.phone.placeholder')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {hasValue(user.birthday) && (
                        <FormField
                          control={form.control}
                          name="birthday"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profilePage.fields.birthday.label')}</FormLabel>
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
                              <FormLabel>{t('profilePage.fields.gender.label')}</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                disabled={!isEditing || isLoading}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('profilePage.fields.gender.placeholder')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MALE">{t('profilePage.fields.gender.options.male')}</SelectItem>
                                  <SelectItem value="FEMALE">{t('profilePage.fields.gender.options.female')}</SelectItem>
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
                              <FormLabel>{t('profilePage.fields.country.label')}</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled={!isEditing || isLoading}
                                  placeholder={t('profilePage.fields.country.placeholder')}
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
                              <FormLabel>{t('profilePage.fields.city.label')}</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled={!isEditing || isLoading}
                                  placeholder={t('profilePage.fields.city.placeholder')}
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
                          {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          <Save className="w-4 h-4 mr-2" />
                          {isLoading ? t('common.updating') : t('common.save')}
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
          <Card className="border-slate-300 shadow-md overflow-hidden p-0">
            <CardHeader className="bg-linear-to-r from-green-50 to-blue-50 rounded-t-lg py-4 px-6">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-green-600" />
                {t('profilePage.professional.title')}
              </CardTitle>
              <CardDescription>
                {t('profilePage.professional.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6 px-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hasValue(user.company?.name) && (
                      <FormField
                        control={form.control}
                        name="company.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profilePage.professional.fields.companyName.label')}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.professional.fields.companyName.placeholder')}
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
                            <FormLabel>{t('profilePage.professional.fields.jobTitle.label')}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.professional.fields.jobTitle.placeholder')}
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
                            <FormLabel>{t('profilePage.professional.fields.industry.label')}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.professional.fields.industry.placeholder')}
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
                            <FormLabel>{t('profilePage.professional.fields.companySize.label')}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.professional.fields.companySize.placeholder')}
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
                    {t('profilePage.professional.socialNetworks')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {hasValue(user.socialNetworks?.linkedin) && (
                        <FormField
                          control={form.control}
                          name="socialNetworks.linkedin"
                          render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t('profilePage.professional.fields.linkedin.label')}</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="url"
                                  disabled={!isEditing || isLoading}
                                  placeholder={t('profilePage.professional.fields.linkedin.placeholder')}
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
                            <FormLabel>{t('profilePage.professional.fields.website.label')}</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="url"
                                  disabled={!isEditing || isLoading}
                                  placeholder={t('profilePage.professional.fields.website.placeholder')}
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
                        {t('common.cancel')}
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? t('common.updating') : t('common.save')}
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
           <Card className="border-slate-300 shadow-md overflow-hidden pt-0">
            <CardHeader className="bg-linear-to-r from-orange-50 to-red-50 rounded-t-lg py-4 px-6">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-orange-600" />
                {t('profilePage.account.title')}
              </CardTitle>
              <CardDescription>
                {t('profilePage.account.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 px-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hasValue(user.user) && (
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-300 bg-linear-to-br from-blue-50/50 to-purple-50/50 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('profilePage.account.userType')}</p>
                        <p className="text-sm font-semibold text-gray-900">{user.user}</p>
                      </div>
                    </div>
                  )}

                  {hasValue(user.verificationCode?.code) && (
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-300 bg-linear-to-br from-green-50/50 to-blue-50/50 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('profilePage.account.verificationCode')}</p>
                        <p className="text-sm font-semibold text-gray-900 font-mono">{user.verificationCode?.code}</p>
                      </div>
                    </div>
                  )}

                  {hasValue(user.createdAt) && (
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-300 bg-linear-to-br from-purple-50/50 to-pink-50/50 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('profilePage.account.memberSince')}</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDateForDisplay(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {hasValue(user.updatedAt) && (
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-300 bg-linear-to-br from-orange-50/50 to-yellow-50/50 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('profilePage.account.lastUpdated')}</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDateForDisplay(user.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                    {t('profilePage.security.title')}
                  </h4>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-300 bg-linear-to-r from-red-50/50 to-orange-50/50 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('profilePage.security.password')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('profilePage.security.lastUpdated', { date: formatDateForDisplay(user.updatedAt) })}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      disabled={isLoading}
                      className="border-red-200 hover:bg-red-50"
                    >
                      {showPasswordChange ? t('common.cancel') : t('profilePage.security.changePassword')}
                    </Button>
                  </div>

                  {showPasswordChange && (
                    <Card className="bg-muted/50 border-dashed mt-4">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">{t('profilePage.security.newPassword')}</label>
                            <Input
                              type="password"
                              placeholder={t('profilePage.security.newPasswordPlaceholder')}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              disabled={isLoading}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium">{t('profilePage.security.confirmPassword')}</label>
                            <Input
                              type="password"
                              placeholder={t('profilePage.security.confirmPasswordPlaceholder')}
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
                              {t('common.cancel')}
                            </Button>
                            <Button
                              size="sm"
                              onClick={handlePasswordChange}
                              disabled={isLoading}
                            >
                              {isLoading ? t('common.updating') : t('profilePage.security.updatePassword')}
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

        <TabsContent value="roles-rights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Role Information */}
            <Card className="border-slate-300 shadow-md overflow-hidden p-0">
              <CardHeader className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-t-lg py-4 px-6">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  {t('profilePage.roles.roleInfo.title')}
                </CardTitle>
                <CardDescription>
                  {t('profilePage.roles.roleInfo.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 px-6">
                {rightsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ) : role ? (
                  <div className="space-y-4 ">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-300 bg-linear-to-br from-indigo-50/50 to-purple-50/50">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('profilePage.roles.roleInfo.roleName')}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {typeof role === 'object' && role !== null ? role.name : role}
                        </p>
                      </div>
                      <Badge variant={role.systemRole ? "default" : "secondary"}>
                        {role.systemRole ? t('profilePage.roles.roleInfo.systemRole') : t('profilePage.roles.roleInfo.customRole')}
                      </Badge>
                    </div>
                    
                    {role.rights && Array.isArray(role.rights) && (
                      <div className="p-4 rounded-lg border border-slate-300 bg-linear-to-br from-blue-50/50 to-cyan-50/50">
                        <p className="text-sm font-medium text-muted-foreground mb-2">{t('profilePage.roles.roleInfo.totalRights')}</p>
                        <p className="text-2xl font-bold text-gray-900">{role.rights.length}</p>
                      </div>
                    )}

                    {role.createdAt && (
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-300 bg-linear-to-br from-purple-50/50 to-pink-50/50">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{t('profilePage.roles.roleInfo.created')}</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDateForDisplay(role.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">{t('profilePage.roles.roleInfo.noRole')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rights List */}
            <Card className="border-slate-300 shadow-md overflow-hidden p-0">
              <CardHeader className="bg-linear-to-r from-green-50 to-emerald-50 rounded-t-lg py-4 px-6 flex items-center justify-between">
               <div>
               <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  {t('profilePage.roles.rights.title')}
                </CardTitle>
                <CardDescription>
                  {t('profilePage.roles.rights.description')}
                </CardDescription>
               </div> 
               {
                getRole() === 'admin' ? 
                  <Button onClick={handleRoleChange}>change role</Button> 
                  : ''
                }
              </CardHeader>
              <CardContent className="pt-6 px-6">
                {rightsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} className="h-12 w-full" />
                    ))}
                  </div>
                ) : role && role.rights && Array.isArray(role.rights) ? (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto px-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#6b7280 #e5e7eb', borderRadius: '10px' }}>
                    {(() => {
                      // Filter rights by role's rights array
                      const assignedRights = rights.filter((right) => 
                        role.rights.includes(right._id)
                      );
                      
                      // Group rights by group
                      const groupedRights = assignedRights.reduce((acc, right) => {
                        if (!acc[right.group]) {
                          acc[right.group] = [];
                        }
                        acc[right.group].push(right);
                        return acc;
                      }, {} as Record<string, typeof assignedRights>);

                      if (assignedRights.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground">{t('profilePage.roles.rights.noRights')}</p>
                          </div>
                        );
                      }

                      return Object.entries(groupedRights).map(([group, groupRights]) => (
                        <div key={group} className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            {group}
                          </h4>
                          {groupRights.map((right) => (
                            <div
                              key={right._id}
                              className="flex items-center justify-between p-3 rounded-lg border border-slate-300 bg-linear-to-r from-white to-gray-50/50 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {right.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{right.group}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {right.name}
                              </Badge>
                            </div>
                          ))}
                          <Separator className="my-3" />
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">{t('profilePage.roles.rights.noInfo')}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="mb-4">
                
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;