import LoginForm from "@/components/partials/authComponents/loginForm";
import { DASHBOARD_OVERVIEW } from "@/constants/routerConstants";
import { getAuthToken } from "@/services/localStorage";
import type { RootState } from "@/store/app/rootReducer";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { handleAsyncError } from "@/hooks/useGlobalErrorHandler";
import { Calendar } from "lucide-react";
import { getVersionDisplay } from "@/config/version";

// Check if we're in development mode
const isDevelopment = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE) === 'development'

export default function LoginPage() {
  const { message, isAuthenticated, user, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );
  const navigate = useNavigate();
  const token = getAuthToken();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (isDevelopment) {
        toast.success(message?.replace("_", " ") || "Connexion réussie");
      }
      navigate(DASHBOARD_OVERVIEW);
    }

    if (error) {
      handleAsyncError(error, "Erreur de connexion");
    }
  }, [isAuthenticated, user, message, error, navigate]);

  useEffect(() => {
    if (token && (user?.role.name === 'admin' || user?.role.name === 'organizer')) {
      navigate(DASHBOARD_OVERVIEW);
    }
  }, []);

  return (
    
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full h-full flex items-center justify-center p-16 ">
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <img
              src="/event1.jpg"
              alt="Event 1"
              className="w-20 h-20 xl:w-full xl:h-40 object-cover rounded-lg shadow-lg"
            />
            <img
              src="/event2.jpg"
              alt="Event 2"
              className="w-20 h-20 xl:w-full xl:h-40 object-cover rounded-lg shadow-lg"
            />
            <img
              src="/event3.jpg"
              alt="Event 3"
              className="w-20 h-20 xl:w-full xl:h-40 object-cover rounded-lg shadow-lg"
            />
            <img
              src="/event4.jpg"
              alt="Event 4"
              className="w-20 h-20 xl:w-full xl:h-40 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        <div className="absolute bottom-10 left-12 text-white z-20">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6" />
            <h2 className="text-xl 2xl:text-2xl font-bold">Eventinas</h2>
          </div>
          <p className="text-xs text-slate-300">
            Gérez vos événements professionnellement
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {getVersionDisplay()}
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-0 sm:p-12">
        <div className="w-full max-w-lg">
          <LoginForm />
        </div>
      </div>

    
    </div>
  );
}
