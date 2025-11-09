import StatCard from "@/components/partials/dashboardComponents/StatCard";
import { fetchEventsRequest } from "@/store/features/events/events.actions";
import { Calendar, CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/app/store";
import type { RootState } from "@/store/app/rootReducer";
import type { Event } from "@/types/stateCard";
import { fetchUsersRequest } from "@/store/features/users/users.actions";
import CityDistributionBarChart from "@/components/charts/CityDistributionChart";
import GenderDistributionPieChart from "@/components/charts/GenderDistributionPieChart";
import EventsByDayBarChart from "@/components/charts/EventsByDayBarChart ";
import { fetchAnalyticsByCity, fetchAnalyticsByDates, fetchAnalyticsByGender } from "@/api/analyticsApi";
import { useLoading } from "@/contexts/LoadingContext";

const Overviewpage = () => {
  const { events, count } = useSelector((state: RootState) => state.events);
  const { usersCount } = useSelector((state: RootState) => state.users);
  const dispatch = useDispatch<AppDispatch>();
  const { setLoading } = useLoading();
  
  const [cityData, setCityData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [datesData, setDatesData] = useState<any[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Calculate real statistics from events data
  const stats = useMemo(() => {
    const acceptedEvents = events.filter(
      (event: Event) => event.status === "ACCEPTED"
    ).length;
    const refusedEvents = events.filter(
      (event: Event) => event.status === "CLOSED"
    ).length;
    const pendingEvents = events.filter(
      (event: Event) => event.status === "PENDING"
    ).length;

    return {
      totalEvents: count,
      acceptedEvents,
      refusedEvents,
      pendingEvents,
      totalUsers: usersCount,
    };
  }, [events, count, usersCount]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Show global loading screen
        setLoading(true, 'Chargement des statistiques...');
        
        await dispatch(fetchEventsRequest());
        await dispatch(fetchUsersRequest());
        
        // Fetch analytics data directly with individual error handling
        setIsLoadingAnalytics(true);
        
        // Fetch each endpoint separately to avoid Promise.all failing all requests
        const cityPromise = fetchAnalyticsByCity().catch(err => {
          console.error('City API failed:', err);
          return null;
        });
        
        const genderPromise = fetchAnalyticsByGender().catch(err => {
          console.error('Gender API failed:', err);
          return null;
        });
        
        const datesPromise = fetchAnalyticsByDates().catch(err => {
          console.error('Dates API failed (likely CORS issue):', err);
          console.warn('⚠️ The /analytics/events-per-dates endpoint has a CORS error. Please enable CORS on your backend for this endpoint.');
          return null;
        });
        
        const [cityResponse, genderResponse, datesResponse] = await Promise.all([
          cityPromise,
          genderPromise,
          datesPromise
        ]);
        
        console.log('City Response:', cityResponse);
        console.log('Gender Response:', genderResponse);
        console.log('Dates Response:', datesResponse);
        
        if (cityResponse && cityResponse.status === 200) {
          console.log('Setting city data:', cityResponse.data.data);
          setCityData(cityResponse.data.data || []);
        }
        if (genderResponse && genderResponse.status === 200) {
          console.log('Setting gender data:', genderResponse.data.data);
          setGenderData(genderResponse.data.data || []);
        }
        if (datesResponse && datesResponse.status === 200) {
          console.log('Setting dates data:', datesResponse.data.data);
          setDatesData(datesResponse.data.data || []);
        }
        
        setIsLoadingAnalytics(false);
        // Hide global loading screen
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoadingAnalytics(false);
        // Hide global loading screen even on error
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, setLoading]);

  useEffect(() => {
    console.log('📊 City Data Updated:', cityData)
  }, [cityData])
  
  useEffect(() => {
    console.log('📊 Gender Data Updated:', genderData)
  }, [genderData])
  
  useEffect(() => {
    console.log('📊 Dates Data Updated:', datesData)
  }, [datesData])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-gray-600 mt-2">
          Vue d'ensemble de vos événements et utilisateurs
        </p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Total Events Card */}
        <StatCard
          title="Total Événements"
          value={stats.totalEvents}
          icon={Calendar}
          description="Tous les événements"
          variant="default"
        />

        {/* Accepted Events Card */}
        <StatCard
          title="Événements Acceptés"
          value={stats.acceptedEvents}
          icon={CheckCircle}
          description={
            stats.totalEvents > 0
              ? `${((stats.acceptedEvents / stats.totalEvents) * 100).toFixed(
                  1
                )}% du total`
              : "Aucun événement"
          }
          variant="success"
        />

        {/* Refused Events Card */}
        <StatCard
          title="Événements Refusés"
          value={stats.refusedEvents}
          icon={XCircle}
          description={
            stats.totalEvents > 0
              ? `${((stats.refusedEvents / stats.totalEvents) * 100).toFixed(
                  1
                )}% du total`
              : "Aucun événement"
          }
          variant="danger"
        />

        {/* Pending Events Card */}
        <StatCard
          title="Événements en Attente"
          value={stats.pendingEvents}
          icon={Clock}
          description={
            stats.totalEvents > 0
              ? `${((stats.pendingEvents / stats.totalEvents) * 100).toFixed(
                  1
                )}% du total`
              : "Aucun événement"
          }
          variant="warning"
        />

        {/* Total Users Card */}
        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers}
          icon={Users}
          description={
            stats.totalUsers > 0
              ? `${stats.totalUsers} créateur${
                  stats.totalUsers > 1 ? "s" : ""
                } d'événements`
              : "Aucun utilisateur"
          }
          variant="info"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CityDistributionBarChart data={cityData} isLoading={isLoadingAnalytics} />
        <GenderDistributionPieChart data={genderData} isLoading={isLoadingAnalytics} />
      </div>
      <div>
        <EventsByDayBarChart data={datesData} isLoading={isLoadingAnalytics} />
      </div>
    </div>
  );
};

export default Overviewpage;
