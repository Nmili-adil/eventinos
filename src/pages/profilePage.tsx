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
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { Progress } from '@/components/ui/progress';

// Icons
import { 
  User, Mail, Phone, Calendar, Camera, Save, Edit, AlertCircle, Briefcase, 
  Link as LinkIcon, Plus, ArrowLeft, Loader2, Shield, Key, Globe, Building, 
  Award, Users, Zap, CheckCircle, Clock, MapPin, PhoneCall, Globe2,
  Crown, Lock, Unlock, Eye, EyeOff, Star, TrendingUp, Target, PieChart
} from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);
  const [roleChangeTarget, setRoleChangeTarget] = useState<'Admin' | 'Organizer' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading: loadingData, error } = useSelector((state: RootState) => state.users);
  const { role } = useSelector((state: RootState) => state.roles);
  const { rights, loading: rightsLoading } = useSelector((state: RootState) => state.rights);
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate()
  const viewerRole = getRole();

  // Color themes
  const colorThemes = {
    primary: {
      light: 'from-violet-50 to-purple-50',
      dark: 'from-violet-900/20 to-purple-900/20',
      gradient: 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500',
      text: 'text-violet-600',
      border: 'border-violet-200',
      bg: 'bg-violet-50'
    },
    success: {
      gradient: 'bg-gradient-to-br from-emerald-400 to-teal-500',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50'
    },
    warning: {
      gradient: 'bg-gradient-to-br from-amber-400 to-orange-500',
      text: 'text-amber-600',
      border: 'border-amber-200',
      bg: 'bg-amber-50'
    },
    danger: {
      gradient: 'bg-gradient-to-br from-rose-400 to-pink-500',
      text: 'text-rose-600',
      border: 'border-rose-200',
      bg: 'bg-rose-50'
    },
    info: {
      gradient: 'bg-gradient-to-br from-cyan-400 to-blue-500',
      text: 'text-cyan-600',
      border: 'border-cyan-200',
      bg: 'bg-cyan-50'
    }
  };

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
        toast.success(t('profilePage.messages.profileUpdated'), {
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none'
          }
        });
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
        toast.success(t('profilePage.messages.passwordUpdated'), {
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none'
          }
        });
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
      const imagePath = await uploadFileApi(selectedPhoto);
      await updateUserApi(params.userId, { picture: imagePath.data?.data?.path });
      
      toast.success(t('profilePage.messages.photoUpdated'), {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none'
        }
      });
      
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

  const handleRoleUpdate = async (targetRole: 'Admin' | 'Organizer') => {
    if (!params.userId) return
    setRoleChangeLoading(true)
    setRoleChangeTarget(targetRole)
    try {
      await updateUserApi(params.userId, { user: targetRole })
      toast.success(
        t('profilePage.roles.roleActions.success', {
          role: targetRole === 'Admin' ? t('profilePage.roles.roleActions.adminLabel', 'Admin') : t('profilePage.roles.roleActions.organizerLabel', 'Organizer'),
        }),
        {
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none'
          }
        }
      )
      setRoleDialogOpen(false)
      dispatch(fetchUserByIdRequest(params.userId))
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('profilePage.roles.roleActions.error', 'Unable to update role.'))
    } finally {
      setRoleChangeLoading(false)
      setRoleChangeTarget(null)
    }
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

  const normalizedViewedRole = user.user?.toLowerCase()
  const canManageRole = viewerRole === 'admin' && (normalizedViewedRole === 'organizer' || normalizedViewedRole === 'admin')

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      user.firstName,
      user.lastName,
      user.email,
      user.picture,
      user.phoneNumber,
      user.birthday,
      user.country,
      user.city,
      user.company?.name,
      user.company?.jobTitle
    ];
    
    const filledFields = fields.filter(field => hasValue(field)).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-4 md:p-6">
      {/* Header with glass effect */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 rounded-2xl blur-3xl" />
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl shadow-violet-500/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <PageHead
                title={t('profilePage.title')}
                description={t('profilePage.description')}
                icon={User}
                total={0}
              />
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Profile Completion</span>
                  <span className="text-sm font-bold text-violet-600">{profileCompletion}%</span>
                </div>
                {/* <Progress value={profileCompletion} className="h-2 bg-gray-200">
                  <div className={`h-full rounded-full transition-all duration-500 ${colorThemes.primary.gradient}`} />
                </Progress> */}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={"outline"}
                size={'icon'}
                onClick={() => navigate(-1)}
                className="rounded-full border-violet-200 hover:border-violet-300 hover:bg-violet-50 transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className='w-4 h-4'/>
              </Button>
              {canManageRole && (
                <Button
                  variant="default"
                  onClick={() => setRoleDialogOpen(true)}
                  disabled={roleChangeLoading}
                  className={`rounded-full ${colorThemes.primary.gradient} text-white hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 hover:scale-105`}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {t('profilePage.roles.roleActions.changeRoleButton')}
                </Button>
              )}
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading}
                className={`rounded-full transition-all duration-300 hover:scale-105 ${isEditing ? 'border-violet-300 text-violet-600 hover:bg-violet-50' : `${colorThemes.primary.gradient} text-white hover:shadow-lg hover:shadow-violet-500/30`}`}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? t('profilePage.buttons.cancelEdit') : t('profilePage.buttons.editProfile')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-8">
        {/* Enhanced Tabs */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 rounded-2xl blur-xl" />
          <TabsList className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-1 shadow-lg shadow-violet-500/5">
            <TabsTrigger 
              value="personal" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
            >
              <User className="w-4 h-4 mr-2" />
              {t('profilePage.tabs.personal')}
            </TabsTrigger>
            <TabsTrigger 
              value="professional" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-300"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              {t('profilePage.tabs.professional')}
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
            >
              <Shield className="w-4 h-4 mr-2" />
              {t('profilePage.tabs.account')}
            </TabsTrigger>
            <TabsTrigger 
              value="roles-rights" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white transition-all duration-300"
            >
              <Award className="w-4 h-4 mr-2" />
              {t('profilePage.tabs.rolesRights')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Profile Card */}
            <Card className="lg:col-span-1 border-0 shadow-2xl shadow-violet-500/10 overflow-hidden">
              <div className={`absolute inset-0 ${colorThemes.primary.gradient} opacity-5`} />
              <CardHeader className="relative bg-gradient-to-br from-violet-50/50 via-purple-50/50 to-fuchsia-50/50 border-b border-white/20 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  <div className={`p-2 rounded-xl ${colorThemes.primary.gradient} shadow-lg`}>
                    <User className="h-6 w-6 text-white" />
                  </div>
                  {t('profilePage.personal.profilePicture.title')}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {t('profilePage.personal.profilePicture.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-8 pt-8">
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full blur-xl opacity-30 animate-pulse" />
                    <Avatar className="w-40 h-40 border-8 border-white shadow-2xl ring-4 ring-violet-500/20 relative">
                      <AvatarImage 
                        src={photoPreview || user.picture} 
                        alt={`${user.firstName} ${user.lastName}`}
                        className="object-cover"
                      />
                      <AvatarFallback className={`text-4xl ${colorThemes.primary.gradient} text-white font-bold`}>
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button 
                        type="button"
                        variant="secondary" 
                        size="sm" 
                        className={`absolute -bottom-2 -right-2 rounded-full w-12 h-12 p-0 shadow-2xl ${colorThemes.primary.gradient} text-white hover:shadow-violet-500/40 transition-all duration-300 hover:scale-110 z-10`}
                        onClick={handlePhotoClick}
                        disabled={isUploadingPhoto}
                      >
                        <Camera className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                  
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
                      className="rounded-full border-violet-300 text-violet-600 hover:bg-violet-50 hover:border-violet-400 transition-all duration-300"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {t('profilePage.buttons.changePhoto')}
                    </Button>
                  )}
                  
                  {selectedPhoto && (
                    <div className="w-full space-y-4 animate-in fade-in duration-300">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
                        <p className="text-sm font-medium text-violet-700 text-center truncate">
                          {selectedPhoto.name}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCancelPhotoUpload}
                          disabled={isUploadingPhoto}
                          className="flex-1 rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all duration-300"
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handlePhotoUpload}
                          disabled={isUploadingPhoto}
                          className={`flex-1 rounded-full ${colorThemes.primary.gradient} text-white hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300`}
                        >
                          {isUploadingPhoto ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                
                <Separator className="bg-gradient-to-r from-transparent via-violet-200/50 to-transparent h-0.5" />
                
                <div className="space-y-6">
                  <h4 className="font-semibold text-lg bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    {t('profilePage.personal.accountStatus')}
                  </h4>
                  <div className="space-y-4">
                    {hasValue(user.isActive) && (
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border border-emerald-100 backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${colorThemes.success.gradient} shadow-md`}>
                            {user.isActive ? (
                              <CheckCircle className="w-4 h-4 text-white" />
                            ) : (
                              <Clock className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{t('profilePage.personal.status')}</span>
                        </div>
                        <Badge className={`rounded-full ${user.isActive ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200'}`}>
                          {user.isActive ? t('profilePage.status.active') : t('profilePage.status.inactive')}
                        </Badge>
                      </div>
                    )}
                    {hasValue(user.registrationCompleted) && (
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border border-blue-100 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${colorThemes.info.gradient} shadow-md`}>
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{t('profilePage.personal.registration')}</span>
                        </div>
                        <Badge className={`rounded-full ${user.registrationCompleted ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' : 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200'}`}>
                          {user.registrationCompleted ? t('profilePage.status.completed') : t('profilePage.status.pending')}
                        </Badge>
                      </div>
                    )}
                    {hasValue(role) && (
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-50/50 to-fuchsia-50/50 border border-purple-100 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${colorThemes.primary.gradient} shadow-md`}>
                            <Award className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{t('profilePage.personal.role')}</span>
                        </div>
                        <Badge className="rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 border-violet-200 hover:from-violet-200 hover:to-purple-200">
                          {typeof role === 'object' && role !== null ? role.name : role}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Personal Information Form */}
            <Card className="lg:col-span-2 border-0 shadow-2xl shadow-violet-500/10 overflow-hidden">
              <div className={`absolute inset-0 ${colorThemes.primary.gradient} opacity-5`} />
              <CardHeader className="relative bg-gradient-to-r from-violet-50/50 via-purple-50/50 to-fuchsia-50/50 border-b border-white/20 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  <div className={`p-2 rounded-xl ${colorThemes.primary.gradient} shadow-lg`}>
                    <User className="h-6 w-6 text-white" />
                  </div>
                  {t('profilePage.personal.form.title')}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {t('profilePage.personal.form.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative py-8 px-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                              <User className="w-4 h-4 text-violet-500" />
                              {t('profilePage.fields.firstName.label')}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.fields.firstName.placeholder')}
                                className="rounded-xl border-violet-200 focus:border-violet-500 focus:ring-violet-500 transition-all duration-300 h-12"
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
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                              <User className="w-4 h-4 text-violet-500" />
                              {t('profilePage.fields.lastName.label')}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.fields.lastName.placeholder')}
                                className="rounded-xl border-violet-200 focus:border-violet-500 focus:ring-violet-500 transition-all duration-300 h-12"
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
                          <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4 text-violet-500" />
                            {t('profilePage.fields.email.label')}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              disabled={!isEditing || isLoading}
                              placeholder={t('profilePage.fields.email.placeholder')}
                              className="rounded-xl border-violet-200 focus:border-violet-500 focus:ring-violet-500 transition-all duration-300 h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {hasValue(user.birthday) && (
                        <FormField
                          control={form.control}
                          name="birthday"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-violet-500" />
                                {t('profilePage.fields.birthday.label')}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="date"
                                  disabled={!isEditing || isLoading}
                                  className="rounded-xl border-violet-200 focus:border-violet-500 focus:ring-violet-500 transition-all duration-300 h-12"
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
                              <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                                <Users className="w-4 h-4 text-violet-500" />
                                {t('profilePage.fields.gender.label')}
                              </FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                disabled={!isEditing || isLoading}
                              >
                                <FormControl>
                                  <SelectTrigger className="rounded-xl border-violet-200 focus:ring-violet-500 focus:border-violet-500 h-12">
                                    <SelectValue placeholder={t('profilePage.fields.gender.placeholder')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-violet-200">
                                  <SelectItem value="MALE" className="focus:bg-violet-50 focus:text-violet-700">{t('profilePage.fields.gender.options.male')}</SelectItem>
                                  <SelectItem value="FEMALE" className="focus:bg-violet-50 focus:text-violet-700">{t('profilePage.fields.gender.options.female')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {hasValue(user.country) && (
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                                <Globe className="w-4 h-4 text-violet-500" />
                                {t('profilePage.fields.country.label')}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled={!isEditing || isLoading}
                                  placeholder={t('profilePage.fields.country.placeholder')}
                                  className="rounded-xl border-violet-200 focus:border-violet-500 focus:ring-violet-500 transition-all duration-300 h-12"
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
                              <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-violet-500" />
                                {t('profilePage.fields.city.label')}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled={!isEditing || isLoading}
                                  placeholder={t('profilePage.fields.city.placeholder')}
                                  className="rounded-xl border-violet-200 focus:border-violet-500 focus:ring-violet-500 transition-all duration-300 h-12"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-4 pt-8">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          disabled={isLoading}
                          className="rounded-full border-violet-300 text-violet-600 hover:bg-violet-50 hover:border-violet-400 px-8 transition-all duration-300"
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className={`rounded-full ${colorThemes.primary.gradient} text-white hover:shadow-lg hover:shadow-violet-500/30 px-8 transition-all duration-300`}
                        >
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
          <Card className="border-0 shadow-2xl shadow-emerald-500/10 overflow-hidden">
            <div className={`absolute inset-0 ${colorThemes.success.gradient} opacity-5`} />
            <CardHeader className="relative bg-gradient-to-r from-emerald-50/50 via-teal-50/50 to-green-50/50 border-b border-white/20 backdrop-blur-sm">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                <div className={`p-2 rounded-xl ${colorThemes.success.gradient} shadow-lg`}>
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                {t('profilePage.professional.title')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t('profilePage.professional.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative py-8 px-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {hasValue(user.company?.name) && (
                      <FormField
                        control={form.control}
                        name="company.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                              <Building className="w-4 h-4 text-emerald-500" />
                              {t('profilePage.professional.fields.companyName.label')}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.professional.fields.companyName.placeholder')}
                                className="rounded-xl border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300 h-12"
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
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-emerald-500" />
                              {t('profilePage.professional.fields.jobTitle.label')}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.professional.fields.jobTitle.placeholder')}
                                className="rounded-xl border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300 h-12"
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
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-emerald-500" />
                              {t('profilePage.professional.fields.industry.label')}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.professional.fields.industry.placeholder')}
                                className="rounded-xl border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300 h-12"
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
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                              <Users className="w-4 h-4 text-emerald-500" />
                              {t('profilePage.professional.fields.companySize.label')}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.professional.fields.companySize.placeholder')}
                                className="rounded-xl border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300 h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <Separator className="bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent h-0.5" />

                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${colorThemes.success.gradient} shadow-lg`}>
                        <Globe2 className="w-5 h-5 text-white" />
                      </div>
                      {t('profilePage.professional.socialNetworks')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {hasValue(user.socialNetworks?.linkedin) && (
                        <FormField
                          control={form.control}
                          name="socialNetworks.linkedin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-emerald-500" />
                                {t('profilePage.professional.fields.linkedin.label')}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="url"
                                  disabled={!isEditing || isLoading}
                                  placeholder={t('profilePage.professional.fields.linkedin.placeholder')}
                                  className="rounded-xl border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300 h-12"
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
                              <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                                <Globe2 className="w-4 h-4 text-emerald-500" />
                                {t('profilePage.professional.fields.website.label')}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="url"
                                  disabled={!isEditing || isLoading}
                                  placeholder={t('profilePage.professional.fields.website.placeholder')}
                                  className="rounded-xl border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300 h-12"
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
                    <div className="flex justify-end space-x-4 pt-8">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                        className="rounded-full border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 px-8 transition-all duration-300"
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className={`rounded-full ${colorThemes.success.gradient} text-white hover:shadow-lg hover:shadow-emerald-500/30 px-8 transition-all duration-300`}
                      >
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
          <Card className="border-0 shadow-2xl shadow-cyan-500/10 overflow-hidden">
            <div className={`absolute inset-0 ${colorThemes.info.gradient} opacity-5`} />
            <CardHeader className="relative bg-gradient-to-r from-cyan-50/50 via-blue-50/50 to-sky-50/50 border-b border-white/20 backdrop-blur-sm">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                <div className={`p-2 rounded-xl ${colorThemes.info.gradient} shadow-lg`}>
                  <Shield className="h-6 w-6 text-white" />
                </div>
                {t('profilePage.account.title')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t('profilePage.account.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative pt-8 px-8">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hasValue(user.user) && (
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white via-white to-violet-50/30 border border-white/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${colorThemes.primary.gradient} shadow-lg`}>
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">{t('profilePage.account.userType')}</p>
                            <p className="text-lg font-bold text-gray-900">{user.user}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasValue(user.verificationCode?.code) && (
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white via-white to-emerald-50/30 border border-white/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${colorThemes.success.gradient} shadow-lg`}>
                            <Key className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">{t('profilePage.account.verificationCode')}</p>
                            <p className="text-lg font-bold text-gray-900 font-mono">{user.verificationCode?.code}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasValue(user.createdAt) && (
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white via-white to-purple-50/30 border border-white/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${colorThemes.primary.gradient} shadow-lg`}>
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">{t('profilePage.account.memberSince')}</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatDateForDisplay(user.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasValue(user.updatedAt) && (
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white via-white to-amber-50/30 border border-white/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${colorThemes.warning.gradient} shadow-lg`}>
                            <Clock className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">{t('profilePage.account.lastUpdated')}</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatDateForDisplay(user.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent h-0.5" />
                
                <div className="space-y-6">
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${colorThemes.info.gradient} shadow-lg`}>
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    {t('profilePage.security.title')}
                  </h4>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white via-white to-rose-50/30 border border-white/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${colorThemes.danger.gradient} shadow-lg`}>
                            <Key className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">{t('profilePage.security.password')}</p>
                            <p className="text-sm text-gray-500">
                              {t('profilePage.security.lastUpdated', { date: formatDateForDisplay(user.updatedAt) })}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowPasswordChange(!showPasswordChange)}
                          disabled={isLoading}
                          className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition-all duration-300"
                        >
                          {showPasswordChange ? t('common.cancel') : t('profilePage.security.changePassword')}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {showPasswordChange && (
                    <Card className="bg-gradient-to-br from-cyan-50/50 to-blue-50/50 border-cyan-100/50 mt-6 backdrop-blur-sm">
                      <CardContent className="pt-8">
                        <div className="space-y-6">
                          <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                              <Lock className="w-4 h-4 text-cyan-500" />
                              {t('profilePage.security.newPassword')}
                            </label>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder={t('profilePage.security.newPasswordPlaceholder')}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading}
                                className="rounded-xl border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500 pr-10 h-12"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <Eye className="w-4 h-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                              <Lock className="w-4 h-4 text-cyan-500" />
                              {t('profilePage.security.confirmPassword')}
                            </label>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder={t('profilePage.security.confirmPasswordPlaceholder')}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={isLoading}
                              className="rounded-xl border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500 h-12"
                            />
                          </div>

                          {passwordError && (
                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200">
                              <AlertCircle className="w-5 h-5 text-rose-600" />
                              <span className="text-sm text-rose-700">{passwordError}</span>
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
                              className="rounded-full border-cyan-300 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-400 px-6 transition-all duration-300"
                            >
                              {t('common.cancel')}
                            </Button>
                            <Button
                              size="sm"
                              onClick={handlePasswordChange}
                              disabled={isLoading}
                              className={`rounded-full ${colorThemes.info.gradient} text-white hover:shadow-lg hover:shadow-cyan-500/30 px-6 transition-all duration-300`}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  {t('common.updating')}
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  {t('profilePage.security.updatePassword')}
                                </>
                              )}
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

        <TabsContent value="roles-rights" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced Role Information */}
            <Card className="border-0 shadow-2xl shadow-amber-500/10 overflow-hidden">
              <div className={`absolute inset-0 ${colorThemes.warning.gradient} opacity-5`} />
              <CardHeader className="relative bg-gradient-to-r from-amber-50/50 via-orange-50/50 to-yellow-50/50 border-b border-white/20 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  <div className={`p-2 rounded-xl ${colorThemes.warning.gradient} shadow-lg`}>
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  {t('profilePage.roles.roleInfo.title')}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {t('profilePage.roles.roleInfo.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative py-8 px-8">
                {rightsLoading ? (
                  <div className="space-y-6 animate-pulse">
                    <div className="h-24 bg-gradient-to-r from-amber-100/50 to-orange-100/50 rounded-2xl" />
                    <div className="h-16 bg-gradient-to-r from-amber-100/50 to-orange-100/50 rounded-2xl" />
                    <div className="h-12 bg-gradient-to-r from-amber-100/50 to-orange-100/50 rounded-2xl" />
                  </div>
                ) : role ? (
                  <div className="space-y-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white via-white to-amber-50/30 border border-white/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">{t('profilePage.roles.roleInfo.roleName')}</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {typeof role === 'object' && role !== null ? role.name : role}
                            </p>
                          </div>
                          <Badge className={`rounded-full ${role.systemRole ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200' : 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 border-violet-200'}`}>
                            {role.systemRole ? t('profilePage.roles.roleInfo.systemRole') : t('profilePage.roles.roleInfo.customRole')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {role.rights && Array.isArray(role.rights) && (
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white via-white to-cyan-50/30 border border-white/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">{t('profilePage.roles.roleInfo.totalRights')}</p>
                              <p className="text-3xl font-bold text-gray-900">{role.rights.length}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${colorThemes.info.gradient} shadow-lg`}>
                              <Shield className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {role.createdAt && (
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white via-white to-purple-50/30 border border-white/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${colorThemes.primary.gradient} shadow-lg`}>
                              <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">{t('profilePage.roles.roleInfo.created')}</p>
                              <p className="text-lg font-bold text-gray-900">
                                {formatDateForDisplay(role.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                      <AlertCircle className="w-12 h-12 text-amber-400" />
                    </div>
                    <p className="mt-4 text-sm text-gray-500">{t('profilePage.roles.roleInfo.noRole')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Rights List */}
            <Card className="border-0 shadow-2xl shadow-violet-500/10 overflow-hidden">
              <div className={`absolute inset-0 ${colorThemes.primary.gradient} opacity-5`} />
              <CardHeader className="relative bg-gradient-to-r from-violet-50/50 via-purple-50/50 to-fuchsia-50/50 border-b border-white/20 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    <div className={`p-2 rounded-xl ${colorThemes.primary.gradient} shadow-lg`}>
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    {t('profilePage.roles.rights.title')}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {t('profilePage.roles.rights.description')}
                  </CardDescription>
                </div>
                {getRole() === 'admin' && (
                  <Button 
                    onClick={() => setRoleDialogOpen(true)}
                    className={`rounded-full ${colorThemes.primary.gradient} text-white hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300`}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {t('profilePage.roles.roleActions.changeRoleButton')}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="relative pt-8 px-8">
                {rightsLoading ? (
                  <div className="space-y-4 animate-pulse">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-16 bg-gradient-to-r from-violet-100/50 to-purple-100/50 rounded-2xl" />
                    ))}
                  </div>
                ) : role && role.rights && Array.isArray(role.rights) ? (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-6">
                      {(() => {
                        const assignedRights = rights.filter((right) => 
                          role.rights.includes(right._id)
                        );
                        
                        const groupedRights = assignedRights.reduce((acc, right) => {
                          if (!acc[right.group]) {
                            acc[right.group] = [];
                          }
                          acc[right.group].push(right);
                          return acc;
                        }, {} as Record<string, typeof assignedRights>);

                        if (assignedRights.length === 0) {
                          return (
                            <div className="text-center py-12">
                              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                                <AlertCircle className="w-12 h-12 text-violet-400" />
                              </div>
                              <p className="mt-4 text-sm text-gray-500">{t('profilePage.roles.rights.noRights')}</p>
                            </div>
                          );
                        }

                        return Object.entries(groupedRights).map(([group, groupRights]) => (
                          <div key={group} className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-1 h-6 rounded-full ${colorThemes.primary.gradient}`} />
                              <h4 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                {group}
                              </h4>
                              <Badge className="rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 border-violet-200">
                                {groupRights.length} rights
                              </Badge>
                            </div>
                            {groupRights.map((right) => (
                              <div
                                key={right._id}
                                className="relative group"
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-white via-white to-violet-50/30 border border-white/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-xl ${colorThemes.success.gradient} shadow-md`}>
                                        <CheckCircle className="w-4 h-4 text-white" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {right.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </p>
                                        <p className="text-xs text-gray-500">{right.group}</p>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="rounded-full border-violet-200 text-violet-700">
                                      {right.name}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <Separator className="bg-gradient-to-r from-transparent via-violet-200/30 to-transparent h-0.5" />
                          </div>
                        ));
                      })()}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                      <AlertCircle className="w-12 h-12 text-violet-400" />
                    </div>
                    <p className="mt-4 text-sm text-gray-500">{t('profilePage.roles.rights.noInfo')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Role Dialog */}
      <AlertDialog
        open={roleDialogOpen}
        onOpenChange={(open) => {
          if (roleChangeLoading) return
          setRoleDialogOpen(open)
          if (!open) {
            setRoleChangeTarget(null)
          }
        }}
      >
        <AlertDialogContent className="border-0 shadow-2xl shadow-violet-500/20">
          <div className={`absolute inset-0 ${colorThemes.primary.gradient} opacity-10 rounded-2xl`} />
          <AlertDialogHeader className="relative">
            <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {t('profilePage.roles.roleActions.changeRoleTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {t('profilePage.roles.roleActions.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="relative space-y-4">
            <Button
              variant="default"
              className="w-full justify-between p-6 rounded-2xl bg-gradient-to-br from-white via-white to-emerald-50/30 border border-emerald-100 backdrop-blur-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 group"
              disabled={roleChangeLoading || normalizedViewedRole === 'admin'}
              onClick={() => handleRoleUpdate('Admin')}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorThemes.success.gradient} shadow-lg group-hover:scale-110 transition-all duration-300`}>
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-gray-900">{t('profilePage.roles.roleActions.upgradeAdmin')}</span>
                  <p className="text-sm text-gray-500 mt-1">Full system access and control</p>
                </div>
              </div>
              {roleChangeLoading && roleChangeTarget === 'Admin' && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between p-6 rounded-2xl bg-gradient-to-br from-white via-white to-violet-50/30 border border-violet-100 backdrop-blur-sm hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 group"
              disabled={roleChangeLoading || normalizedViewedRole === 'organizer'}
              onClick={() => handleRoleUpdate('Organizer')}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorThemes.primary.gradient} shadow-lg group-hover:scale-110 transition-all duration-300`}>
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-gray-900">{t('profilePage.roles.roleActions.downgradeOrganizer')}</span>
                  <p className="text-sm text-gray-500 mt-1">Event management access only</p>
                </div>
              </div>
              {roleChangeLoading && roleChangeTarget === 'Organizer' && <Loader2 className="h-4 w-4 animate-spin text-violet-600" />}
            </Button>
          </div>
          <AlertDialogFooter className="relative">
            <AlertDialogCancel 
              disabled={roleChangeLoading}
              className="rounded-full border-violet-300 text-violet-600 hover:bg-violet-50 hover:border-violet-400 transition-all duration-300"
            >
              {t('common.cancel')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfilePage;