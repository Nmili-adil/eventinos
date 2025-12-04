import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
import { Progress } from '@/components/ui/progress';

// Icons
import {
  User, Mail, Calendar, Camera, Save, Edit, AlertCircle, Briefcase,
  Link as LinkIcon, ArrowLeft, Loader2, Shield, Key, Globe, Building,
  Award, Users, CheckCircle, Clock, MapPin, Globe2,
  Crown, Lock, Eye, EyeOff, TrendingUp
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
import { fetchRoleByIdRequest, fetchRolesRequest } from '@/store/features/roles/roles.actions';
import { fetchRightsRequest } from '@/store/features/rights/rights.actions';
import { updateUserApi, updateUserPasswordApi, updateOrganizerProfessionalInfoApi } from '@/api/usersApi';
import { uploadFileApi, getFileUrlApi } from '@/api/filesApi';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getRole } from '@/services/localStorage';

// Color palette
const COLORS = {
  primary: '#A3C9D9',      // Light blue
  secondary: '#6A9BA6',    // Medium blue
  dark: '#012326',         // Dark teal
  accent: '#103B40',       // Medium-dark teal
  highlight: '#346C73',    // Teal
  lightBg: '#f8fafc',      // Light background
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  country?: string;
  city?: string;
  gender?: 'MALE' | 'FEMALE';
  company?: {
    name?: string;
    jobTitle?: string;
    size?: string;
    industry?: string;
  };
  socialNetworks?: {
    linkedin?: string;
    website?: string;
  };
}

// Validation Schema
const profileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  // birthday: z.string().optional().or(z.literal('')),
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
  const [activeTab, setActiveTab] = useState('personal');
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
  const { role, roles } = useSelector((state: RootState) => state.roles);
  const { rights, loading: rightsLoading } = useSelector((state: RootState) => state.rights);
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate()
  const viewerRole = getRole();

  // Safe date formatting function (unused but kept for future use)
  // const formatDate = (dateInput: any): string => {
  //   if (!dateInput) return '';

  //   try {
  //     if (typeof dateInput === 'string') {
  //       return new Date(dateInput).toISOString().split('T')[0];
  //     } else if (dateInput.$date && dateInput.$date.$numberLong) {
  //       return new Date(parseInt(dateInput.$date.$numberLong)).toISOString().split('T')[0];
  //     } else if (dateInput.$numberLong) {
  //       return new Date(parseInt(dateInput.$numberLong)).toISOString().split('T')[0];
  //     } else if (dateInput instanceof Date) {
  //       return dateInput.toISOString().split('T')[0];
  //     }
  //     return '';
  //   } catch (error) {
  //     console.error('Error formatting date:', error);
  //     return '';
  //   }
  // };

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

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      // birthday: '',
      country: '',
      city: '',
      gender: undefined,
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
        // birthday: user.birthday ? formatDate(user.birthday) : '',
        country: user.country || '',
        city: user.city || '',
        gender: user.gender || undefined,
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

      if (user.role && typeof user.role === 'object' && '$oid' in user.role) {
        dispatch(fetchRoleByIdRequest(user.role.$oid));
      } else if (typeof user.role === 'string') {
        dispatch(fetchRoleByIdRequest(user.role));
      }
      dispatch(fetchRightsRequest());
    }
  }, [user, form, dispatch]);

  // Fetch user data and roles when component mounts or userId changes
  useEffect(() => {
    if (params.userId) {
      dispatch(fetchUserByIdRequest(params.userId));
    }
    dispatch(fetchRolesRequest());
  }, [params.userId, dispatch]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      if (params.userId) {
        // Only send personal info fields
        const personalData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          country: data.country,
          city: data.city,
          gender: data.gender,
        };
        await updateUserApi(params.userId, personalData);
        toast.success(t('profilePage.messages.profileUpdated'), {
          style: {
            backgroundColor: COLORS.highlight,
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

  const onSubmitProfessional = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      if (params.userId && user) {
        // Only send professional info fields
        const professionalData = {
          company: data.company,
          socialNetworks: data.socialNetworks,
        };
        
        // Use user._id as the organizer ID, extracting string value if it's an object
        const organizerId = typeof user._id === 'object' && user._id !== null && '$oid' in user._id 
          ? user._id.$oid 
          : (user._id || params.userId);
        console.log('Updating organizer professional info for ID:', organizerId);
        
        await updateOrganizerProfessionalInfoApi(organizerId as string, professionalData);
        toast.success(t('profilePage.messages.professionalInfoUpdated', 'Professional information updated successfully'), {
          style: {
            backgroundColor: COLORS.highlight,
            color: 'white',
            border: 'none'
          }
        });
        setIsEditing(false);
        // Refresh user data
        dispatch(fetchUserByIdRequest(params.userId));
      }
    } catch (error: any) {
      console.error('Failed to update professional info:', error);
      console.error('Error details:', error?.response?.data);
      toast.error(error?.response?.data?.message || error?.message || t('profilePage.messages.professionalInfoUpdateFailed', 'Failed to update professional information'));
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
            backgroundColor: COLORS.highlight,
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
      // Upload file and get file ID
      const fileId = await uploadFileApi(selectedPhoto);
      
      // Get file URL from file ID
      const fileUrl = await getFileUrlApi(fileId);
      
      // Update user profile with the file URL
      await updateUserApi(params.userId, { picture: fileUrl });

      toast.success(t('profilePage.messages.photoUpdated'), {
        style: {
          backgroundColor: COLORS.highlight,
          color: 'white',
          border: 'none'
        }
      });

      setSelectedPhoto(null);
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    
    // Find the role ID by name (case-insensitive matching)
    const roleObject = roles.find((r: any) => 
      r.name?.toLowerCase() === targetRole.toLowerCase()
    )
    
    if (!roleObject || !roleObject._id) {
      console.error('Role not found. Available roles:', roles)
      console.error('Looking for role:', targetRole)
      toast.error(`Role "${targetRole}" not found in system roles`)
      return
    }
    
    setRoleChangeLoading(true)
    setRoleChangeTarget(targetRole)
    try {
      await updateUserApi(params.userId, { role: roleObject._id })
      toast.success(
        t('profilePage.roles.roleActions.success', {
          role: targetRole === 'Admin' ? t('profilePage.roles.roleActions.adminLabel', 'Admin') : t('profilePage.roles.roleActions.organizerLabel', 'Organizer'),
        }),
        {
          style: {
            backgroundColor: COLORS.highlight,
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
const isViewerAdminOrOrganizer = viewerRole === 'admin' || viewerRole === 'organizer'  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      user.firstName,
      user.lastName,
      user.email,
      user.picture,
      user.phoneNumber,
      // user.birthday,
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
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg" style={{ 
          background: 'linear-gradient(135deg, rgba(163, 201, 217, 0.1) 0%, rgba(255, 255, 255, 1) 100%)'
        }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <PageHead
                title={t('profilePage.title')}
                description={t('profilePage.description')}
                icon={User}
                total={0}
              />
              
            </div>
            <div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant={"outline"}
                size={'icon'}
                onClick={() => navigate(-1)}
                className="rounded-full border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                style={{ borderColor: COLORS.secondary }}
              >
                <ArrowLeft className='w-4 h-4' />
              </Button>
              {canManageRole && (
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setRoleDialogOpen(true)}
                  disabled={roleChangeLoading}
                  className="rounded-full text-white transition-all duration-300"
                  style={{ backgroundColor: COLORS.accent }}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {t('profilePage.roles.roleActions.changeRoleButton')}
                </Button>
              )}
              <Button
                type="button"
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading}
                className="rounded-full transition-all duration-300"
                style={isEditing ? {
                  borderColor: COLORS.secondary,
                  color: COLORS.highlight,
                  backgroundColor: 'transparent'
                } : {
                  backgroundColor: COLORS.primary,
                  color: 'white'
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? t('profilePage.buttons.cancelEdit') : t('profilePage.buttons.editProfile')}
              </Button>
            </div>
            <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{t('profilePage.completion')}</span>
                  <span className="text-sm font-bold" style={{ color: COLORS.highlight }}>{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} className="h-2 bg-gray-200">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ backgroundColor: COLORS.primary }}
                  />
                </Progress>
              </div>
                </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 py-1">
        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-3 shadow-xl">
          <TabsList className="bg-transparent w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 h-auto">
            <TabsTrigger
              value="personal"
              className="rounded-xl px-6 py-4 font-semibold transition-all duration-300 border-2 hover:scale-105 relative overflow-hidden group"
              style={{
                background: activeTab === 'personal'
                  ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`
                  : 'linear-gradient(135deg, rgba(163, 201, 217, 0.15), rgba(163, 201, 217, 0.05))',
                color: activeTab === 'personal' ? 'white' : '#4b5563',
                borderColor: activeTab === 'personal' ? COLORS.primary : 'transparent',
                boxShadow: activeTab === 'personal' ? '0 10px 25px rgba(163, 201, 217, 0.3)' : 'none'
              }}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div 
                  className="p-2 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: activeTab === 'personal' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(163, 201, 217, 0.2)'
                  }}
                >
                  <User className="w-5 h-5" />
                </div>
                <span className="text-base">{t('profilePage.tabs.personal')}</span>
              </div>
              {activeTab === 'personal' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              )}
            </TabsTrigger>

            <TabsTrigger
              value="professional"
              className="rounded-xl px-6 py-4 font-semibold transition-all duration-300 border-2 hover:scale-105 relative overflow-hidden group"
              style={{
                background: activeTab === 'professional'
                  ? `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.highlight})`
                  : 'linear-gradient(135deg, rgba(106, 155, 166, 0.15), rgba(106, 155, 166, 0.05))',
                color: activeTab === 'professional' ? 'white' : '#4b5563',
                borderColor: activeTab === 'professional' ? COLORS.secondary : 'transparent',
                boxShadow: activeTab === 'professional' ? '0 10px 25px rgba(106, 155, 166, 0.3)' : 'none'
              }}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div 
                  className="p-2 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: activeTab === 'professional' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(106, 155, 166, 0.2)'
                  }}
                >
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-base">{t('profilePage.tabs.professional')}</span>
              </div>
              {activeTab === 'professional' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              )}
            </TabsTrigger>

            {isViewerAdminOrOrganizer && (
              <TabsTrigger
                value="account"
                className="rounded-xl px-6 py-4 font-semibold transition-all duration-300 border-2 hover:scale-105 relative overflow-hidden group"
                style={{
                  background: activeTab === 'account'
                    ? `linear-gradient(135deg, ${COLORS.highlight}, ${COLORS.accent})`
                    : 'linear-gradient(135deg, rgba(52, 108, 115, 0.15), rgba(52, 108, 115, 0.05))',
                  color: activeTab === 'account' ? 'white' : '#4b5563',
                  borderColor: activeTab === 'account' ? COLORS.highlight : 'transparent',
                  boxShadow: activeTab === 'account' ? '0 10px 25px rgba(52, 108, 115, 0.3)' : 'none'
                }}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div 
                    className="p-2 rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor: activeTab === 'account' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(52, 108, 115, 0.2)'
                    }}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-base">{t('profilePage.tabs.account')}</span>
                </div>
                {activeTab === 'account' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                )}
              </TabsTrigger>
            )}

            <TabsTrigger
              value="roles-rights"
              className="rounded-xl px-6 py-4 font-semibold transition-all duration-300 border-2 hover:scale-105 relative overflow-hidden group"
              style={{
                background: activeTab === 'roles-rights'
                  ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.dark})`
                  : 'linear-gradient(135deg, rgba(16, 59, 64, 0.15), rgba(16, 59, 64, 0.05))',
                color: activeTab === 'roles-rights' ? 'white' : '#4b5563',
                borderColor: activeTab === 'roles-rights' ? COLORS.accent : 'transparent',
                boxShadow: activeTab === 'roles-rights' ? '0 10px 25px rgba(16, 59, 64, 0.3)' : 'none'
              }}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div 
                  className="p-2 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: activeTab === 'roles-rights' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(16, 59, 64, 0.2)'
                  }}
                >
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-base">{t('profilePage.tabs.rolesRights')}</span>
              </div>
              {activeTab === 'roles-rights' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <Card className="lg:col-span-1 border border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-100" style={{ backgroundColor: COLORS.lightBg }}>
                <CardTitle className="flex items-center gap-3 text-xl font-bold" style={{ color: COLORS.dark }}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primary }}>
                    <User className="h-5 w-5 text-white" />
                  </div>
                  {t('profilePage.personal.profilePicture.title')}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {t('profilePage.personal.profilePicture.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-8">
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" style={{ backgroundColor: COLORS.primary }} />
                    <Avatar className="w-40 h-40 border-4 shadow-2xl relative" style={{ borderColor: COLORS.primary }}>
                      <AvatarImage
                        src={photoPreview || user.picture}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="object-cover"
                      />
                      <AvatarFallback 
                        className="text-4xl font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                      >
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-12 h-12 p-0 shadow-xl text-white transition-all duration-300 hover:scale-110 z-10"
                        style={{ background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.highlight})` }}
                        onClick={handlePhotoClick}
                        disabled={isUploadingPhoto}
                      >
                        {isUploadingPhoto ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5" />
                        )}
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
                      className="rounded-full transition-all duration-300"
                      style={{ 
                        borderColor: COLORS.secondary,
                        color: COLORS.highlight,
                        backgroundColor: 'transparent'
                      }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {t('profilePage.buttons.changePhoto')}
                    </Button>
                  )}

                  {selectedPhoto && (
                    <div className="w-full space-y-4 animate-in fade-in duration-300">
                      <div className="p-4 rounded-lg border" style={{ 
                        backgroundColor: COLORS.lightBg,
                        borderColor: COLORS.secondary
                      }}>
                        <p className="text-sm font-medium text-center truncate" style={{ color: COLORS.highlight }}>
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
                          className="flex-1 rounded-full transition-all duration-300"
                          style={{ 
                            borderColor: COLORS.gray[300],
                            color: COLORS.gray[600]
                          }}
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handlePhotoUpload}
                          disabled={isUploadingPhoto}
                          className="flex-1 rounded-full text-white transition-all duration-300"
                          style={{ backgroundColor: COLORS.primary }}
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

                <Separator className="bg-gray-200" />

                <div className="space-y-6">
                  <h4 className="font-semibold text-lg" style={{ color: COLORS.dark }}>
                    {t('profilePage.personal.accountStatus')}
                  </h4>
                  <div className="space-y-4">
                    {hasValue(user.isActive) && (
                      <div className="flex items-center justify-between p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300" style={{ 
                        background: 'linear-gradient(135deg, rgba(163, 201, 217, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
                        borderColor: COLORS.gray[200]
                      }}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg shadow-sm" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}>
                            {user.isActive ? (
                              <CheckCircle className="w-4 h-4 text-white" />
                            ) : (
                              <Clock className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{t('profilePage.personal.status')}</span>
                        </div>
                        <Badge className="rounded-full border shadow-sm" style={{ 
                          backgroundColor: user.isActive ? '#d1fae5' : '#fef3c7',
                          color: user.isActive ? '#065f46' : '#92400e',
                          borderColor: user.isActive ? '#a7f3d0' : '#fde68a'
                        }}>
                          {user.isActive ? t('profilePage.status.active') : t('profilePage.status.inactive')}
                        </Badge>
                      </div>
                    )}
                    {hasValue(user.registrationCompleted) && (
                      <div className="flex items-center justify-between p-4 rounded-lg border" style={{ 
                        backgroundColor: COLORS.lightBg,
                        borderColor: COLORS.gray[200]
                      }}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.secondary }}>
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{t('profilePage.personal.registration')}</span>
                        </div>
                        <Badge className="rounded-full border" style={{ 
                          backgroundColor: user.registrationCompleted ? '#dbeafe' : '#fee2e2',
                          color: user.registrationCompleted ? '#1e40af' : '#991b1b',
                          borderColor: user.registrationCompleted ? '#bfdbfe' : '#fecaca'
                        }}>
                          {user.registrationCompleted ? t('profilePage.status.completed') : t('profilePage.status.pending')}
                        </Badge>
                      </div>
                    )}
                    {hasValue(role) && (
                      <div className="flex items-center justify-between p-4 rounded-lg border" style={{ 
                        backgroundColor: COLORS.lightBg,
                        borderColor: COLORS.gray[200]
                      }}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.highlight }}>
                            <Award className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{t('profilePage.personal.role')}</span>
                        </div>
                        <Badge className="rounded-full border" style={{ 
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          borderColor: '#bae6fd'
                        }}>
                          {typeof role === 'object' && role !== null ? role.name : role}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Form */}
            <Card className="lg:col-span-2 border border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-100" style={{ backgroundColor: COLORS.lightBg }}>
                <CardTitle className="flex items-center gap-3 text-xl font-bold" style={{ color: COLORS.dark }}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primary }}>
                    <User className="h-5 w-5 text-white" />
                  </div>
                  {t('profilePage.personal.form.title')}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {t('profilePage.personal.form.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-8 px-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                              <User className="w-4 h-4" style={{ color: COLORS.primary }} />
                              {t('profilePage.fields.firstName.label')}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.fields.firstName.placeholder')}
                                className="rounded-lg border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-all duration-300 h-12"
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
                              <User className="w-4 h-4" style={{ color: COLORS.primary }} />
                              {t('profilePage.fields.lastName.label')}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.fields.lastName.placeholder')}
                                className="rounded-lg border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-all duration-300 h-12"
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
                            <Mail className="w-4 h-4" style={{ color: COLORS.primary }} />
                            {t('profilePage.fields.email.label')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              disabled={!isEditing || isLoading}
                              placeholder={t('profilePage.fields.email.placeholder')}
                              className="rounded-lg border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-all duration-300 h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {hasValue(user.gender) && (
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                                <Users className="w-4 h-4" style={{ color: COLORS.primary }} />
                                {t('profilePage.fields.gender.label')}
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={!isEditing || isLoading}
                              >
                                <FormControl>
                                  <SelectTrigger className="rounded-lg border-gray-300 focus:ring-gray-400 focus:border-gray-400 h-12">
                                    <SelectValue placeholder={t('profilePage.fields.gender.placeholder')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-lg border-gray-300">
                                  <SelectItem value="MALE" className="focus:bg-gray-100 focus:text-gray-900">
                                    {t('profilePage.fields.gender.options.male')}
                                  </SelectItem>
                                  <SelectItem value="FEMALE" className="focus:bg-gray-100 focus:text-gray-900">
                                    {t('profilePage.fields.gender.options.female')}
                                  </SelectItem>
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
                                <Globe className="w-4 h-4" style={{ color: COLORS.primary }} />
                                {t('profilePage.fields.country.label')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing || isLoading}
                                  placeholder={t('profilePage.fields.country.placeholder')}
                                  className="rounded-lg border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-all duration-300 h-12"
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
                                <MapPin className="w-4 h-4" style={{ color: COLORS.primary }} />
                                {t('profilePage.fields.city.label')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing || isLoading}
                                  placeholder={t('profilePage.fields.city.placeholder')}
                                  className="rounded-lg border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-all duration-300 h-12"
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
                          className="rounded-full px-8 transition-all duration-300"
                          style={{ 
                            borderColor: COLORS.secondary,
                            color: COLORS.highlight,
                            backgroundColor: 'transparent'
                          }}
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="rounded-full text-white px-8 transition-all duration-300"
                          style={{ backgroundColor: COLORS.primary }}
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
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100" style={{ backgroundColor: COLORS.lightBg }}>
              <CardTitle className="flex items-center gap-3 text-xl font-bold" style={{ color: COLORS.dark }}>
                <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.secondary }}>
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                {t('profilePage.professional.title')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t('profilePage.professional.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-8 px-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitProfessional)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(isEditing || hasValue(user.company?.name)) && (
                      <FormField
                        control={form.control}
                        name="company.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                              <Building className="w-4 h-4" style={{ color: COLORS.secondary }} />
                              {t('profilePage.professional.fields.companyName.label')}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.professional.fields.companyName.placeholder')}
                                className="rounded-lg border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-all duration-300 h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {(isEditing || hasValue(user.company?.jobTitle)) && (
                      <FormField
                        control={form.control}
                        name="company.jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                              <Briefcase className="w-4 h-4" style={{ color: COLORS.secondary }} />
                              {t('profilePage.professional.fields.jobTitle.label')}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.professional.fields.jobTitle.placeholder')}
                                className="rounded-lg border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-all duration-300 h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {(isEditing || hasValue(user.company?.industry)) && (
                      <FormField
                        control={form.control}
                        name="company.industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" style={{ color: COLORS.secondary }} />
                              {t('profilePage.professional.fields.industry.label')}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.professional.fields.industry.placeholder')}
                                className="rounded-lg border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-all duration-300 h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {(isEditing || hasValue(user.company?.size)) && (
                      <FormField
                        control={form.control}
                        name="company.size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                              <Users className="w-4 h-4" style={{ color: COLORS.secondary }} />
                              {t('profilePage.professional.fields.companySize.label')}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing || isLoading}
                                placeholder={t('profilePage.professional.fields.companySize.placeholder')}
                                className="rounded-lg border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-all duration-300 h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <Separator className="bg-gray-200" />

                  <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3" style={{ color: COLORS.dark }}>
                      <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.secondary }}>
                        <Globe2 className="w-4 h-4 text-white" />
                      </div>
                      {t('profilePage.professional.socialNetworks')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {(isEditing || hasValue(user.socialNetworks?.linkedin)) && (
                        <FormField
                          control={form.control}
                          name="socialNetworks.linkedin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" style={{ color: COLORS.secondary }} />
                                {t('profilePage.professional.fields.linkedin.label')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="url"
                                  disabled={!isEditing || isLoading}
                                  placeholder={t('profilePage.professional.fields.linkedin.placeholder')}
                                  className="rounded-lg border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-all duration-300 h-12"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {(isEditing || hasValue(user.socialNetworks?.website)) && (
                        <FormField
                          control={form.control}
                          name="socialNetworks.website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                                <Globe2 className="w-4 h-4" style={{ color: COLORS.secondary }} />
                                {t('profilePage.professional.fields.website.label')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="url"
                                  disabled={!isEditing || isLoading}
                                  placeholder={t('profilePage.professional.fields.website.placeholder')}
                                  className="rounded-lg border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-all duration-300 h-12"
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
                        className="rounded-full px-8 transition-all duration-300"
                        style={{ 
                          borderColor: COLORS.secondary,
                          color: COLORS.highlight,
                          backgroundColor: 'transparent'
                        }}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-full text-white px-8 transition-all duration-300"
                        style={{ backgroundColor: COLORS.secondary }}
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
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100" style={{ backgroundColor: COLORS.lightBg }}>
              <CardTitle className="flex items-center gap-3 text-xl font-bold" style={{ color: COLORS.dark }}>
                <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.highlight }}>
                  <Shield className="h-5 w-5 text-white" />
                </div>
                {t('profilePage.account.title')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t('profilePage.account.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 px-8">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hasValue(user.user) && (
                    <div className="p-6 rounded-lg border" style={{ 
                      backgroundColor: COLORS.lightBg,
                      borderColor: COLORS.gray[200]
                    }}>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.primary }}>
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">{t('profilePage.account.userType')}</p>
                          <p className="text-lg font-bold text-gray-900">{user.user}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasValue(user.verificationCode?.code) && (
                    <div className="p-6 rounded-lg border" style={{ 
                      backgroundColor: COLORS.lightBg,
                      borderColor: COLORS.gray[200]
                    }}>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.secondary }}>
                          <Key className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">{t('profilePage.account.verificationCode')}</p>
                          <p className="text-lg font-bold text-gray-900 font-mono">{user.verificationCode?.code}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasValue(user.createdAt) && (
                    <div className="p-6 rounded-lg border" style={{ 
                      backgroundColor: COLORS.lightBg,
                      borderColor: COLORS.gray[200]
                    }}>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.highlight }}>
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">{t('profilePage.account.memberSince')}</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatDateForDisplay(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasValue(user.updatedAt) && (
                    <div className="p-6 rounded-lg border" style={{ 
                      backgroundColor: COLORS.lightBg,
                      borderColor: COLORS.gray[200]
                    }}>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.accent }}>
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">{t('profilePage.account.lastUpdated')}</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatDateForDisplay(user.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="bg-gray-200" />

                <div className="space-y-6">
                  <h4 className="text-xl font-bold flex items-center gap-3" style={{ color: COLORS.dark }}>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.highlight }}>
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                    {t('profilePage.security.title')}
                  </h4>
                  <div className="p-6 rounded-lg border" style={{ 
                    backgroundColor: COLORS.lightBg,
                    borderColor: COLORS.gray[200]
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.accent }}>
                          <Key className="w-5 h-5 text-white" />
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
                        className="rounded-full transition-all duration-300"
                        style={{ 
                          borderColor: COLORS.secondary,
                          color: COLORS.highlight,
                          backgroundColor: 'transparent'
                        }}
                      >
                        {showPasswordChange ? t('common.cancel') : t('profilePage.security.changePassword')}
                      </Button>
                    </div>
                  </div>

                  {showPasswordChange && (
                    <Card className="border border-gray-200 bg-white mt-6">
                      <CardContent className="pt-8">
                        <div className="space-y-6">
                          <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                              <Lock className="w-4 h-4" style={{ color: COLORS.highlight }} />
                              {t('profilePage.security.newPassword')}
                            </label>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder={t('profilePage.security.newPasswordPlaceholder')}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading}
                                className="rounded-lg border-gray-300 focus:border-gray-400 focus:ring-gray-400 pr-10 h-12"
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
                              <Lock className="w-4 h-4" style={{ color: COLORS.highlight }} />
                              {t('profilePage.security.confirmPassword')}
                            </label>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder={t('profilePage.security.confirmPasswordPlaceholder')}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={isLoading}
                              className="rounded-lg border-gray-300 focus:border-gray-400 focus:ring-gray-400 h-12"
                            />
                          </div>

                          {passwordError && (
                            <div className="flex items-center space-x-3 p-4 rounded-lg border" style={{ 
                              backgroundColor: '#fef2f2',
                              borderColor: '#fecaca'
                            }}>
                              <AlertCircle className="w-5 h-5" style={{ color: '#dc2626' }} />
                              <span className="text-sm" style={{ color: '#991b1b' }}>{passwordError}</span>
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
                              className="rounded-full px-6 transition-all duration-300"
                              style={{ 
                                borderColor: COLORS.secondary,
                                color: COLORS.highlight,
                                backgroundColor: 'transparent'
                              }}
                            >
                              {t('common.cancel')}
                            </Button>
                            <Button
                              size="sm"
                              onClick={handlePasswordChange}
                              disabled={isLoading}
                              className="rounded-full text-white px-6 transition-all duration-300"
                              style={{ backgroundColor: COLORS.highlight }}
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
            {/* Role Information */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-100" style={{ backgroundColor: COLORS.lightBg }}>
                <CardTitle className="flex items-center gap-3 text-xl font-bold" style={{ color: COLORS.dark }}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.accent }}>
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  {t('profilePage.roles.roleInfo.title')}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {t('profilePage.roles.roleInfo.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-8 px-8">
                {rightsLoading ? (
                  <div className="space-y-6 animate-pulse">
                    <div className="h-24 rounded-lg bg-gray-200" />
                    <div className="h-16 rounded-lg bg-gray-200" />
                    <div className="h-12 rounded-lg bg-gray-200" />
                  </div>
                ) : role ? (
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border" style={{ 
                      backgroundColor: COLORS.lightBg,
                      borderColor: COLORS.gray[200]
                    }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">{t('profilePage.roles.roleInfo.roleName')}</p>
                          <p className="text-xl font-bold text-gray-900">
                            {typeof role === 'object' && role !== null ? role.name : role}
                          </p>
                        </div>
                        <Badge className="rounded-full border" style={{ 
                          backgroundColor: role.systemRole ? '#d1fae5' : '#e0f2fe',
                          color: role.systemRole ? '#065f46' : '#0369a1',
                          borderColor: role.systemRole ? '#a7f3d0' : '#bae6fd'
                        }}>
                          {role.systemRole ? t('profilePage.roles.roleInfo.systemRole') : t('profilePage.roles.roleInfo.customRole')}
                        </Badge>
                      </div>
                    </div>

                    {role.rights && Array.isArray(role.rights) && (
                      <div className="p-6 rounded-lg border" style={{ 
                        backgroundColor: COLORS.lightBg,
                        borderColor: COLORS.gray[200]
                      }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">{t('profilePage.roles.roleInfo.totalRights')}</p>
                            <p className="text-2xl font-bold text-gray-900">{role.rights.length}</p>
                          </div>
                          <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.secondary }}>
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                    )}

                    {role.createdAt && (
                      <div className="p-6 rounded-lg border" style={{ 
                        backgroundColor: COLORS.lightBg,
                        borderColor: COLORS.gray[200]
                      }}>
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.primary }}>
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">{t('profilePage.roles.roleInfo.created')}</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatDateForDisplay(role.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-lg border" style={{ 
                      backgroundColor: '#fef3c7',
                      borderColor: '#fde68a'
                    }}>
                      <AlertCircle className="w-12 h-12" style={{ color: '#d97706' }} />
                    </div>
                    <p className="mt-4 text-sm text-gray-500">{t('profilePage.roles.roleInfo.noRole')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rights List */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: COLORS.lightBg }}>
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold" style={{ color: COLORS.dark }}>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primary }}>
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    {t('profilePage.roles.rights.title')}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {t('profilePage.roles.rights.description')}
                  </CardDescription>
                </div>
                {getRole() === 'admin' && (
                  <Button
                    type="button"
                    onClick={() => setRoleDialogOpen(true)}
                    className="rounded-full text-white transition-all duration-300"
                    style={{ backgroundColor: COLORS.accent }}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {t('profilePage.roles.roleActions.changeRoleButton')}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-8 px-8">
                {rightsLoading ? (
                  <div className="space-y-4 animate-pulse">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-16 rounded-lg bg-gray-200" />
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
                              <div className="inline-flex p-4 rounded-lg border" style={{ 
                                backgroundColor: '#e0f2fe',
                                borderColor: '#bae6fd'
                              }}>
                                <AlertCircle className="w-12 h-12" style={{ color: COLORS.primary }} />
                              </div>
                              <p className="mt-4 text-sm text-gray-500">{t('profilePage.roles.rights.noRights')}</p>
                            </div>
                          );
                        }

                        return Object.entries(groupedRights).map(([group, groupRights]) => (
                          <div key={group} className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                              <h4 className="text-lg font-bold" style={{ color: COLORS.dark }}>
                                {group}
                              </h4>
                              <Badge className="rounded-full border" style={{ 
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                borderColor: '#bae6fd'
                              }}>
                                {groupRights.length} rights
                              </Badge>
                            </div>
                            {groupRights.map((right) => (
                              <div
                                key={right._id}
                                className="p-4 rounded-lg border" style={{ 
                                  backgroundColor: COLORS.lightBg,
                                  borderColor: COLORS.gray[200]
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.secondary }}>
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {right.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </p>
                                      <p className="text-xs text-gray-500">{right.group}</p>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="rounded-full border" style={{ 
                                    borderColor: COLORS.secondary,
                                    color: COLORS.highlight
                                  }}>
                                    {right.name}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            <Separator className="bg-gray-200" />
                          </div>
                        ));
                      })()}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-lg border" style={{ 
                      backgroundColor: '#e0f2fe',
                      borderColor: '#bae6fd'
                    }}>
                      <AlertCircle className="w-12 h-12" style={{ color: COLORS.primary }} />
                    </div>
                    <p className="mt-4 text-sm text-gray-500">{t('profilePage.roles.rights.noInfo')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Role Dialog - Only show for admins managing other admin/organizer roles */}
      {canManageRole && (
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
        <AlertDialogContent className="border border-gray-200 bg-white shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold" style={{ color: COLORS.dark }}>
              {t('profilePage.roles.roleActions.changeRoleTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {t('profilePage.roles.roleActions.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Button
              type="button"
              variant="default"
              className="w-full justify-between p-6 rounded-lg border transition-all duration-300"
              style={{ 
                backgroundColor: normalizedViewedRole === 'admin' ? COLORS.gray[200] : COLORS.lightBg,
                borderColor: COLORS.gray[200],
                color: COLORS.dark
              }}
              disabled={roleChangeLoading || normalizedViewedRole === 'admin'}
              onClick={() => handleRoleUpdate('Admin')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.secondary }}>
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="font-bold">{t('profilePage.roles.roleActions.upgradeAdmin')}</span>
                  <p className="text-sm text-gray-500 mt-1">Full system access and control</p>
                </div>
              </div>
              {roleChangeLoading && roleChangeTarget === 'Admin' && <Loader2 className="h-4 w-4 animate-spin" style={{ color: COLORS.highlight }} />}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between p-6 rounded-lg border transition-all duration-300"
              style={{ 
                backgroundColor: normalizedViewedRole === 'organizer' ? COLORS.gray[200] : COLORS.lightBg,
                borderColor: COLORS.gray[200],
                color: COLORS.dark
              }}
              disabled={roleChangeLoading || normalizedViewedRole === 'organizer'}
              onClick={() => handleRoleUpdate('Organizer')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.primary }}>
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="font-bold">{t('profilePage.roles.roleActions.downgradeOrganizer')}</span>
                  <p className="text-sm text-gray-500 mt-1">Event management access only</p>
                </div>
              </div>
              {roleChangeLoading && roleChangeTarget === 'Organizer' && <Loader2 className="h-4 w-4 animate-spin" style={{ color: COLORS.primary }} />}
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={roleChangeLoading}
              className="rounded-full transition-all duration-300"
              style={{ 
                borderColor: COLORS.secondary,
                color: COLORS.highlight,
                backgroundColor: 'transparent'
              }}
            >
              {t('common.cancel')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      )}
    </div>
  );
};

export default ProfilePage;