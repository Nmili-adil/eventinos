import StatCard from "@/components/partials/dashboardComponents/StatCard";
import { fetchEventsRequest } from "@/store/features/events/events.actions";
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock, Users, LayoutDashboard, Filter, X, Calendar1Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/app/store";
import type { RootState } from "@/store/app/rootReducer";
import type { Event } from "@/types/eventsTypes";
import { fetchUsersRequest } from "@/store/features/users/users.actions";
import CityDistributionBarChart from "@/components/charts/CityDistributionChart";
import GenderDistributionPieChart from "@/components/charts/GenderDistributionPieChart";
import EventsByDayBarChart from "@/components/charts/EventsByDayBarChart";
import { fetchAnalyticsByCity, fetchAnalyticsByDates, fetchAnalyticsByGender, fetchCountApi } from "@/api/analyticsApi";
import PageHead from "@/components/shared/page-head";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type TimePeriod = 'all' | 'week' | 'month' | '3months' | '6months' | 'year';

const Overviewpage = () => {
  const { events, count } = useSelector((state: RootState) => state.events);
  const { usersCount } = useSelector((state: RootState) => state.users);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  
  const [cityData, setCityData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [datesData, setDatesData] = useState<any[]>([]);
  const [countsData, setCountsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);

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

  const startOfDay = (date: Date) => {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
  }

  const endOfDay = (date: Date) => {
    const result = new Date(date)
    result.setHours(23, 59, 59, 999)
    return result
  }

  const serializeDateParam = (date?: Date, type: "start" | "end" = "start") => {
    if (!date) return undefined
    const adjustedDate = type === "start" ? startOfDay(date) : endOfDay(date)
    // Format as YYYY-MM-DD for backend
    const year = adjustedDate.getFullYear()
    const month = String(adjustedDate.getMonth() + 1).padStart(2, '0')
    const day = String(adjustedDate.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const parseEventDate = (eventItem: Event): Date | null => {
    try {
      return eventItem.startDate?.date ? new Date(eventItem.startDate.date) : null
    } catch {
      return null
    }
  }

  // Filter events based on selected time period
  const filteredEvents = useMemo(() => {
    let dataset = events

    if (timePeriod !== 'all') {
      const { start, end } = getDateRange(timePeriod);
      if (start && end) {
        dataset = dataset.filter((event: Event) => {
          const eventDate = parseEventDate(event);
          if (!eventDate) return false;
          return eventDate >= start && eventDate <= end;
        });
      }
    }

    if (customStartDate || customEndDate) {
      dataset = dataset.filter((event: Event) => {
        const eventDate = parseEventDate(event);
        if (!eventDate) return false;
        if (customStartDate && eventDate < startOfDay(customStartDate)) return false;
        if (customEndDate && eventDate > endOfDay(customEndDate)) return false;
        return true;
      });
    }

    return dataset;
  }, [events, timePeriod, customStartDate, customEndDate]);

  // Calculate real statistics from filtered events data
  const stats = useMemo(() => {
    if (countsData) {
      return {
        totalEvents: countsData.events || 0,
        acceptedEvents: countsData.accepted || 0,
        refusedEvents: countsData.canceled || 0,
        pendingEvents: countsData.pending || 0,
        totalUsers: countsData.members || usersCount,
      };
    }

    // Fallback to client-side calculation if no backend data
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
  }, [filteredEvents, usersCount, countsData]);

  const dateRangeLabel = useMemo(() => {
    if (customStartDate || customEndDate) {
      const startLabel = customStartDate ? format(customStartDate, "MMM dd, yyyy") : t('dashboard.filters.startAny', 'Start not set')
      const endLabel = customEndDate ? format(customEndDate, "MMM dd, yyyy") : t('dashboard.filters.endAny', 'Present')
      return `${startLabel} → ${endLabel}`
    }
    if (timePeriod !== 'all') {
      return t(`dashboard.timePeriods.${timePeriod}`)
    }
    return t('dashboard.timePeriods.all')
  }, [customStartDate, customEndDate, timePeriod, t])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingStats(true);
        await dispatch(fetchEventsRequest());
        await dispatch(fetchUsersRequest());
        
        // Fetch analytics data directly with individual error handling
        setIsLoadingAnalytics(true);
        
        // Fetch each endpoint separately to avoid Promise.all failing all requests
        // Get date range based on time period or custom dates
        let startDateToUse = customStartDate;
        let endDateToUse = customEndDate;
        
        if (timePeriod !== 'all' && !customStartDate && !customEndDate) {
          const { start, end } = getDateRange(timePeriod);
          startDateToUse = start || undefined;
          endDateToUse = end || undefined;
        }
        
        const analyticsParams = {
          startDate: serializeDateParam(startDateToUse, "start"),
          endDate: serializeDateParam(endDateToUse, "end"),
        }

        const cityPromise = fetchAnalyticsByCity(analyticsParams).catch(err => {
          console.error('City API failed:', err);
          return null;
        });
        
        const genderPromise = fetchAnalyticsByGender(analyticsParams).catch(err => {
          console.error('Gender API failed:', err);
          return null;
        });
        
        const datesPromise = fetchAnalyticsByDates(analyticsParams).catch(err => {
          console.error('Dates API failed (likely CORS issue):', err);
          console.warn('⚠️ The /analytics/events-per-dates endpoint has a CORS error. Please enable CORS on your backend for this endpoint.');
          return null;
        });
        
        const countsPromise = fetchCountApi(analyticsParams).catch(err => {
          console.error('Counts API failed:', err);
          return null;
        });
        
        const [cityResponse, genderResponse, datesResponse, countsResponse] = await Promise.all([
          cityPromise,
          genderPromise,
          datesPromise,
          countsPromise
        ]);

        
        if (cityResponse && cityResponse.status === 200) {
          setCityData(cityResponse.data.data || []);
        }
        if (genderResponse && genderResponse.status === 200) {
          setGenderData(genderResponse.data.data || []);
        }
        if (datesResponse && datesResponse.status === 200) {
          setDatesData(datesResponse.data.data || []);
        }
        if (countsResponse && countsResponse.status === 200) {
          setCountsData(countsResponse.data.data || null);
        }
        
        setIsLoadingAnalytics(false);
        setIsLoadingStats(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoadingAnalytics(false);
        setIsLoadingStats(false);
      }
    };

    fetchData();
  }, [dispatch, t, customStartDate, customEndDate, timePeriod]);


  const StatSkeleton = () => (
    <Card className="p-4 space-y-3 border-slate-200">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </Card>
  )

  const ChartSkeleton = () => (
    <Card className="p-4 border-slate-200 space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-64 w-full" />
    </Card>
  )

  return (
    <div className="space-y-6 ">
      {/* Page Header */}
      <div className="mb-8">
        <PageHead title={t('dashboard.title')} icon={LayoutDashboard} description={t('dashboard.description')} total={0}/>
      </div>

      {/* Time Period & Date Filters */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{t('dashboard.timePeriod')}:</span>
            </div>
          <div className="flex  justify-between gap-4">
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

            <div className="flex-1 grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal min-w-[200px]",
                      !customStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(customStartDate, "PPP") : t('dashboard.filters.startDatePlaceholder', 'Select start date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal min-w-[200px]",
                      !customEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(customEndDate, "PPP") : t('dashboard.filters.endDatePlaceholder', 'Select end date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    disabled={(date) => (customStartDate ? date < customStartDate : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {(customStartDate || customEndDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setCustomStartDate(undefined)
                    setCustomEndDate(undefined)
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                  {t('dashboard.filters.clearDates', 'Clear date range')}
                </Button>
              )}
          </div>
          </div>
   
            



          </div>

          
        </div>

        <div className="text-xs text-gray-500">
          {t('dashboard.filters.currentRangeLabel', { range: dateRangeLabel, defaultValue: `Showing data for ${dateRangeLabel}` })}
        </div>
      </Card>

      {/* Statistics Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {isLoadingStats ? (
          Array.from({ length: 5 }).map((_, index) => <StatSkeleton key={index} />)
        ) : (
          <>
            <StatCard
              title={t('dashboard.totalEvents')}
              value={stats.totalEvents}
              icon={Calendar1Icon}
              description={t('dashboard.allEvents')}
              variant="default"
            />
            <StatCard
              title={t('dashboard.acceptedEvents')}
              value={stats.acceptedEvents}
              icon={CheckCircle}
              description={
                stats.totalEvents > 0
                  ? `${((stats.acceptedEvents / stats.totalEvents) * 100).toFixed(1)}% ${t('dashboard.ofTotal')}`
                  : t('dashboard.noEvents')
              }
              variant="success"
            />
            <StatCard
              title={t('dashboard.refusedEvents')}
              value={stats.refusedEvents}
              icon={XCircle}
              description={
                stats.totalEvents > 0
                  ? `${((stats.refusedEvents / stats.totalEvents) * 100).toFixed(1)}% ${t('dashboard.ofTotal')}`
                  : t('dashboard.noEvents')
              }
              variant="danger"
            />
            <StatCard
              title={t('dashboard.pendingEvents')}
              value={stats.pendingEvents}
              icon={Clock}
              description={
                stats.totalEvents > 0
                  ? `${((stats.pendingEvents / stats.totalEvents) * 100).toFixed(1)}% ${t('dashboard.ofTotal')}`
                  : t('dashboard.noEvents')
              }
              variant="warning"
            />
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
          </>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoadingAnalytics ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <CityDistributionBarChart data={cityData} isLoading={isLoadingAnalytics} dateRangeLabel={dateRangeLabel} />
            <GenderDistributionPieChart data={genderData} isLoading={isLoadingAnalytics} dateRangeLabel={dateRangeLabel} />
          </>
        )}
      </div>
      <div>
        {isLoadingAnalytics ? <ChartSkeleton /> : <EventsByDayBarChart data={datesData} isLoading={isLoadingAnalytics} />}
      </div>
    </div>
  );
};

export default Overviewpage;
