import StatCard from "@/components/partials/dashboardComponents/StatCard";
import { fetchEventsRequest } from "@/store/features/events/events.actions";
import { Calendar, CheckCircle, XCircle, Clock, Users, LayoutDashboard, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/app/store";
import type { RootState } from "@/store/app/rootReducer";
import type { Event } from "@/types/eventsTypes";
import { fetchUsersRequest } from "@/store/features/users/users.actions";
import CityDistributionBarChart from "@/components/charts/CityDistributionChart";
import GenderDistributionPieChart from "@/components/charts/GenderDistributionPieChart";
import EventsByDayBarChart from "@/components/charts/EventsByDayBarChart ";
import { fetchAnalyticsByCity, fetchAnalyticsByDates, fetchAnalyticsByGender } from "@/api/analyticsApi";
import { useLoading } from "@/contexts/LoadingContext";
import PageHead from "@/components/shared/page-head";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type TimePeriod = 'all' | 'week' | 'month' | '3months' | '6months' | 'year';

const Overviewpage = () => {
  const { events, count } = useSelector((state: RootState) => state.events);
  const { usersCount } = useSelector((state: RootState) => state.users);
  const dispatch = useDispatch<AppDispatch>();
  const { setLoading } = useLoading();
  const { t } = useTranslation();
  
  const [cityData, setCityData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [datesData, setDatesData] = useState<any[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');

  // Helper function to get date range based on time period
  const getDateRange = (period: TimePeriod): { start: Date | null; end: Date | null } => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    switch (period) {
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);
        return { start: weekStart, end };
      case 'month':
        const monthStart = new Date(now);
        monthStart.setMonth(now.getMonth() - 1);
        monthStart.setHours(0, 0, 0, 0);
        return { start: monthStart, end };
      case '3months':
        const threeMonthsStart = new Date(now);
        threeMonthsStart.setMonth(now.getMonth() - 3);
        threeMonthsStart.setHours(0, 0, 0, 0);
        return { start: threeMonthsStart, end };
      case '6months':
        const sixMonthsStart = new Date(now);
        sixMonthsStart.setMonth(now.getMonth() - 6);
        sixMonthsStart.setHours(0, 0, 0, 0);
        return { start: sixMonthsStart, end };
      case 'year':
        const yearStart = new Date(now);
        yearStart.setFullYear(now.getFullYear() - 1);
        yearStart.setHours(0, 0, 0, 0);
        return { start: yearStart, end };
      case 'all':
      default:
        return { start: null, end: null };
    }
  };

  // Filter events based on selected time period
  const filteredEvents = useMemo(() => {
    if (timePeriod === 'all') {
      return events;
    }

    const { start, end } = getDateRange(timePeriod);
    if (!start || !end) {
      return events;
    }

    return events.filter((event: Event) => {
      if (!event.startDate?.date) return false;
      
      try {
        const eventDate = new Date(event.startDate.date);
        return eventDate >= start && eventDate <= end;
      } catch (error) {
        console.error('Error parsing event date:', error);
        return false;
      }
    });
  }, [events, timePeriod]);

  // Calculate real statistics from filtered events data
  const stats = useMemo(() => {
    const acceptedEvents = filteredEvents.filter(
      (event: Event) => event.status === "ACCEPTED"
    ).length;
    const refusedEvents = filteredEvents.filter(
      (event: Event) => event.status === "CLOSED"
    ).length;
    const pendingEvents = filteredEvents.filter(
      (event: Event) => event.status === "PENDING"
    ).length;

    return {
      totalEvents: filteredEvents.length,
      acceptedEvents,
      refusedEvents,
      pendingEvents,
      totalUsers: usersCount,
    };
  }, [filteredEvents, usersCount]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Show global loading screen
        setLoading(true, t('dashboard.loadingStats'));
        
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
    <div className="space-y-6 ">
      {/* Page Header */}
      <div className="mb-8">
        <PageHead title={t('dashboard.title')} icon={LayoutDashboard} description={t('dashboard.description')}/>
      </div>

      {/* Time Period Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{t('dashboard.timePeriod')}:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={timePeriod === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('all')}
              className="text-xs sm:text-sm"
            >
              {t('dashboard.timePeriods.all')}
            </Button>
            <Button
              variant={timePeriod === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('week')}
              className="text-xs sm:text-sm"
            >
              {t('dashboard.timePeriods.week')}
            </Button>
            <Button
              variant={timePeriod === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('month')}
              className="text-xs sm:text-sm"
            >
              {t('dashboard.timePeriods.month')}
            </Button>
            <Button
              variant={timePeriod === '3months' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('3months')}
              className="text-xs sm:text-sm"
            >
              {t('dashboard.timePeriods.3months')}
            </Button>
            <Button
              variant={timePeriod === '6months' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('6months')}
              className="text-xs sm:text-sm"
            >
              {t('dashboard.timePeriods.6months')}
            </Button>
            <Button
              variant={timePeriod === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('year')}
              className="text-xs sm:text-sm"
            >
              {t('dashboard.timePeriods.year')}
            </Button>
          </div>
        </div>
        {timePeriod !== 'all' && (
          <div className="mt-3 text-xs text-gray-500">
            {t('dashboard.showingEventsFor')} {t(`dashboard.timePeriods.${timePeriod}`)}
          </div>
        )}
      </Card>

      {/* Statistics Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Total Events Card */}
        <StatCard
          title={t('dashboard.totalEvents')}
          value={stats.totalEvents}
          icon={Calendar}
          description={t('dashboard.allEvents')}
          variant="default"
        />

        {/* Accepted Events Card */}
        <StatCard
          title={t('dashboard.acceptedEvents')}
          value={stats.acceptedEvents}
          icon={CheckCircle}
          description={
            stats.totalEvents > 0
              ? `${((stats.acceptedEvents / stats.totalEvents) * 100).toFixed(
                  1
                )}% ${t('dashboard.ofTotal')}`
              : t('dashboard.noEvents')
          }
          variant="success"
        />

        {/* Refused Events Card */}
        <StatCard
          title={t('dashboard.refusedEvents')}
          value={stats.refusedEvents}
          icon={XCircle}
          description={
            stats.totalEvents > 0
              ? `${((stats.refusedEvents / stats.totalEvents) * 100).toFixed(
                  1
                )}% ${t('dashboard.ofTotal')}`
              : t('dashboard.noEvents')
          }
          variant="danger"
        />

        {/* Pending Events Card */}
        <StatCard
          title={t('dashboard.pendingEvents')}
          value={stats.pendingEvents}
          icon={Clock}
          description={
            stats.totalEvents > 0
              ? `${((stats.pendingEvents / stats.totalEvents) * 100).toFixed(
                  1
                )}% ${t('dashboard.ofTotal')}`
              : t('dashboard.noEvents')
          }
          variant="warning"
        />

        {/* Total Users Card */}
        <StatCard
          title={t('dashboard.users')}
          value={stats.totalUsers}
          icon={Users}
          description={
            stats.totalUsers > 0
              ? `${stats.totalUsers} ${
                  stats.totalUsers > 1 ? t('dashboard.eventCreatorsPlural') : t('dashboard.eventCreators')
                }`
              : t('dashboard.noUsers')
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
