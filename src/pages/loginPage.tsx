import LoginForm from "@/components/partials/authComponents/loginForm";
import { DASHBOARD_OVERVIEW } from "@/constants/routerConstants";
import { getAuthToken } from "@/services/localStorage";
import type { RootState } from "@/store/app/rootReducer";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";

export default function LoginPage() {
  const { message, isAuthenticated, user, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );
  const navigate = useNavigate();
  const location = useLocation();
  const token = getAuthToken();
  const { t } = useTranslation();

  useEffect(() => {
    console.log("Auth state:", { isAuthenticated, user, message });

    if (isAuthenticated && user) {
      toast.success(message?.replace("_", " ") || t("auth.loginSuccess"));
      navigate(DASHBOARD_OVERVIEW);
    }

    if (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || t("auth.loginError")
      );
    }
  }, [isAuthenticated, user, message, error, navigate, t]);

  useEffect(() => {
    if (token) {
      navigate(DASHBOARD_OVERVIEW);
    }
  }, []);

  return (
    // <div className="h-screen flex">
    //   <main className="flex-1 flex lg:flex-row relative">
    //     {/* Background Image - full screen on mobile, right half on desktop */}
    //     <div className="absolute lg:relative inset-0 lg:flex-1 bg-[url(/login-cover.png)] shadow-xl bg-center bg-no-repeat bg-cover">
    //       <div className='absolute flex items-center justify-center top-0 left-0 w-full h-full bg-black/40'>
    //         <img src="/logo-bg.svg" className='w-1/2 h-1/2' alt="UrEvent Logo" />
    //       </div>
    //     </div>

    //     {/* Login Form - absolutely positioned on mobile, left half on desktop */}
    //     <div className='absolute lg:relative inset-0 lg:inset-auto mx-6 xl:mx-3 lg:w-4/12 flex flex-col items-center justify-center z-10'>
    //       <div className="text-center mb-8">
    //         <h1 className="page-heading text-3xl font-bold text-gray-900 dark:text-white mb-4">
    //           {t('auth.welcome')}
    //         </h1>
    //         <p className="text-gray-600 dark:text-gray-400">
    //           {t('auth.accessAccount')} <span className='font-semibold text-[#6e51e7] underline cursor-pointer'>{t('auth.account')}</span>
    //         </p>
    //       </div>
    //       <LoginForm />
    //     </div>
    //   </main>
    // </div>
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <img
              src="/event1.jpg"
              alt="Event 1"
              className="w-full h-40 object-cover rounded-lg shadow-lg"
            />
            <img
              src="/event2.jpg"
              alt="Event 2"
              className="w-full h-40 object-cover rounded-lg shadow-lg"
            />
            <img
              src="/event3.jpg"
              alt="Event 3"
              className="w-full h-40 object-cover rounded-lg shadow-lg"
            />
            <img
              src="/event4.jpg"
              alt="Event 4"
              className="w-full h-40 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        <div className="absolute bottom-8 left-12 text-white z-20">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Eventinas</h2>
          </div>
          <p className="text-sm text-slate-300">
            Manage your events professionally
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-0 sm:p-12">
        <div className="w-full max-w-lg">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-full md:w-24 md:h-24 rounded-xl bg-white mb-6">
              <img src="/Eventinas Logo.jpeg" alt="Eventinas Logo" className="w-24 h-24 object-cover" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-1 text-center md:text-start">
            {t('auth.welcome')}
            </h1>
            <p className="text-muted-foreground text-lg text-center md:text-start">
            {t('auth.accessAccount')} 
            </p>
          </div>

          <div className=" ">
          <LoginForm />
            {/* <p className="text-center text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link
                to="#"
                className="text-primary hover:text-primary/90 font-medium transition-colors"
              >
                Create one
              </Link>
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}
