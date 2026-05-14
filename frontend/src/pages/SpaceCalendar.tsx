import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Rocket, Newspaper, CloudLightning, Star, Globe, ExternalLink, Loader2, RefreshCw, Filter } from 'lucide-react';
import apiClient from '../api/client';

// ─── Types ────────────────────────────────────────────────────────────────────
type EventType = 'launch' | 'news' | 'weather' | 'milestone' | 'astronaut';

interface SpaceEvent {
  id: string;
  date: string; // ISO date string
  title: string;
  type: EventType;
  description?: string;
  agency?: string;
  status?: string;
  url?: string;
  countdown?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<EventType, { label: string; color: string; bg: string; border: string; dot: string; icon: React.ReactNode }> = {
  launch: {
    label: 'Launch',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
    icon: <Rocket className="w-3.5 h-3.5" />,
  },
  news: {
    label: 'News',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
    icon: <Newspaper className="w-3.5 h-3.5" />,
  },
  weather: {
    label: 'Space Weather',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/15',
    border: 'border-fuchsia-500/30',
    dot: 'bg-fuchsia-400',
    icon: <CloudLightning className="w-3.5 h-3.5" />,
  },
  milestone: {
    label: 'Milestone',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
    icon: <Star className="w-3.5 h-3.5" />,
  },
  astronaut: {
    label: 'Astronaut',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-400',
    icon: <Globe className="w-3.5 h-3.5" />,
  },
};

// ─── Static milestone / significant event seeds ───────────────────────────────
const MILESTONE_SEEDS: SpaceEvent[] = [
  { id: 'm1', date: '2026-05-01', title: 'ISS — 25+ Years Continuous Occupation', type: 'milestone', description: 'The International Space Station has maintained an uninterrupted human presence since November 2000, surpassing 25 years.', agency: 'NASA/Roscosmos/ESA' },
  { id: 'm2', date: '2026-05-10', title: 'Starlink Constellation Surpasses 10,000 Satellites', type: 'milestone', description: 'SpaceX Starlink is estimated to have over 10,000 active satellites in orbit — the largest satellite constellation in history.', agency: 'SpaceX' },
  { id: 'm3', date: '2026-05-20', title: 'Artemis Program — Lunar Gateway Assembly Milestone', type: 'milestone', description: 'NASA Artemis program reaches key milestone in the assembly of the Lunar Gateway, paving the way for sustained human lunar presence.', agency: 'NASA' },
  { id: 'm4', date: '2026-06-01', title: 'JWST — 4 Years of Deep Space Discovery', type: 'milestone', description: 'The James Webb Space Telescope celebrates four years of revolutionary scientific observations, reshaping our understanding of the early universe.', agency: 'NASA/ESA/CSA' },
  { id: 'm5', date: '2026-06-15', title: 'Artemis IV Crew Announcement Expected', type: 'milestone', description: 'NASA expected to formally announce the crew for Artemis IV, which will include international astronaut partners.', agency: 'NASA' },
  { id: 'm6', date: '2026-07-04', title: 'Voyager 1 — 49 Years in Space', type: 'milestone', description: 'Voyager 1, now in interstellar space, marks 49 years since its 1977 launch — the farthest human-made object from Earth.', agency: 'NASA/JPL' },
  { id: 'w1', date: '2026-05-14', title: 'Geomagnetic Activity — KP Index Monitoring', type: 'weather', description: 'NOAA Space Weather Prediction Center continues monitoring elevated solar wind conditions. Aurora may be visible at mid-latitudes.', agency: 'NOAA SWPC' },
  { id: 'w2', date: '2026-05-22', title: 'Solar Cycle 25 — Peak Activity Window', type: 'weather', description: 'Solar Cycle 25 is near its predicted maximum. Increased solar flare and CME activity expected through 2026.', agency: 'NOAA SWPC' },
  { id: 'a1', date: '2026-05-18', title: 'ISS Crew Rotation — Expedition 71/72', type: 'astronaut', description: 'Crew Dragon spacecraft scheduled to bring new crew members to the ISS, with current Expedition crew returning home.', agency: 'NASA/SpaceX' },
  { id: 'a2', date: '2026-06-10', title: 'ESA Astronaut Training Class Graduation', type: 'astronaut', description: 'The latest class of ESA astronaut candidates are expected to complete their basic astronaut training curriculum.', agency: 'ESA' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function isSameDay(a: string, b: Date) {
  const d = new Date(a);
  return d.getFullYear() === b.getFullYear() && d.getMonth() === b.getMonth() && d.getDate() === b.getDate();
}
function formatCountdown(netStr: string): string {
  const now = new Date();
  const net = new Date(netStr);
  const diff = net.getTime() - now.getTime();
  if (diff <= 0) return 'Past';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `T- ${days}d ${hours}h`;
  return `T- ${hours}h`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Main Component ───────────────────────────────────────────────────────────
const SpaceCalendar: React.FC = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<Date | null>(now);
  const [launches, setLaunches] = useState<SpaceEvent[]>([]);
  const [newsEvents, setNewsEvents] = useState<SpaceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTypes, setActiveTypes] = useState<Set<EventType>>(new Set(['launch', 'news', 'weather', 'milestone', 'astronaut']));
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [launchRes, newsRes] = await Promise.all([
        apiClient.get('/launches/?limit=100').catch(() => ({ data: [] })),
        apiClient.get('/news/?limit=50').catch(() => ({ data: [] })),
      ]);

      const launchEvents: SpaceEvent[] = (launchRes.data || [])
        .filter((l: any) => l.net)
        .map((l: any) => ({
          id: `launch-${l.id}`,
          date: l.net,
          title: l.name || 'Upcoming Launch',
          type: 'launch' as EventType,
          description: l.mission_description || `${l.vehicle || ''} launch from ${l.launch_site || 'unknown site'}.`,
          agency: l.agency,
          status: l.status_abbrev,
          url: l.webcast_url,
          countdown: formatCountdown(l.net),
        }));

      const newsEvs: SpaceEvent[] = (newsRes.data || [])
        .filter((n: any) => n.published_at)
        .slice(0, 30)
        .map((n: any) => ({
          id: `news-${n.id}`,
          date: n.published_at,
          title: n.title,
          type: 'news' as EventType,
          description: n.summary || n.title,
          agency: n.news_site,
          url: n.url,
        }));

      setLaunches(launchEvents);
      setNewsEvents(newsEvs);
    } catch (err) {
      console.error('Calendar data fetch failed', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const allEvents: SpaceEvent[] = useMemo(() => [
    ...launches,
    ...newsEvents,
    ...MILESTONE_SEEDS,
  ], [launches, newsEvents]);

  const filteredEvents = useMemo(() =>
    allEvents.filter(e => activeTypes.has(e.type)),
    [allEvents, activeTypes]
  );

  // Events for a given calendar date
  const eventsOnDay = (date: Date) =>
    filteredEvents.filter(e => isSameDay(e.date, date));

  // Events on selected day
  const selectedDayEvents = useMemo(() =>
    selectedDay ? filteredEvents.filter(e => isSameDay(e.date, selectedDay)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [],
    [selectedDay, filteredEvents]
  );

  // Upcoming events (next 30 days)
  const upcomingEvents = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 60);
    return filteredEvents
      .filter(e => new Date(e.date) >= now && new Date(e.date) <= cutoff)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 12);
  }, [filteredEvents]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const toggleType = (type: EventType) => {
    setActiveTypes(prev => {
      const n = new Set(prev);
      if (n.has(type)) { n.delete(type); } else { n.add(type); }
      return n;
    });
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const calendarDays: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="w-8 h-8 text-violet-400" />
            Space Events Calendar
          </h1>
          <p className="text-slate-400 mt-1">Rocket launches, space weather, news & milestones — all in one view.</p>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchData(); }}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Events
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 flex items-center gap-1 mr-1"><Filter className="w-3 h-3" /> Filter:</span>
        {(Object.keys(TYPE_CONFIG) as EventType[]).map(type => {
          const cfg = TYPE_CONFIG[type];
          const active = activeTypes.has(type);
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                active ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-600'
              }`}
            >
              {cfg.icon}
              {cfg.label}
            </button>
          );
        })}
        <span className="ml-2 text-xs text-slate-600 self-center">{filteredEvents.length} total events</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="xl:col-span-2 space-y-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">{MONTHS[month]} {year}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {filteredEvents.filter(e => {
                  const d = new Date(e.date);
                  return d.getFullYear() === year && d.getMonth() === month;
                }).length} events this month
              </p>
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} />;
                const events = eventsOnDay(date);
                const isToday = date.toDateString() === now.toDateString();
                const isSelected = selectedDay?.toDateString() === date.toDateString();
                const isPast = date < new Date(now.getFullYear(), now.getMonth(), now.getDate());

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDay(date)}
                    className={`relative min-h-[80px] p-2 rounded-xl border text-left transition-all flex flex-col ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500/60 shadow-lg shadow-violet-500/10'
                        : isToday
                        ? 'bg-emerald-500/10 border-emerald-500/40'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'
                    } ${isPast && !isToday ? 'opacity-60' : ''}`}
                  >
                    <span className={`text-sm font-bold mb-1 ${isToday ? 'text-emerald-400' : isSelected ? 'text-violet-300' : 'text-slate-300'}`}>
                      {date.getDate()}
                    </span>
                    <div className="flex flex-wrap gap-0.5 flex-1">
                      {events.slice(0, 4).map((ev, ei) => {
                        const cfg = TYPE_CONFIG[ev.type];
                        return (
                          <span key={ei} className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0`} title={ev.title} />
                        );
                      })}
                      {events.length > 4 && (
                        <span className="text-[9px] text-slate-500 leading-none">+{events.length - 4}</span>
                      )}
                    </div>
                    {events.length > 0 && (
                      <div className="mt-auto hidden sm:block">
                        {events.slice(0, 1).map(ev => {
                          const cfg = TYPE_CONFIG[ev.type];
                          return (
                            <span key={ev.id} className={`text-[9px] ${cfg.color} leading-tight block truncate`}>
                              {ev.title.substring(0, 20)}{ev.title.length > 20 ? '…' : ''}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected day events */}
          {selectedDay && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                <span className="ml-auto text-xs text-slate-500">{selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''}</span>
              </h3>
              {selectedDayEvents.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No events on this day.</p>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map(ev => {
                    const cfg = TYPE_CONFIG[ev.type];
                    return (
                      <div key={ev.id} className={`${cfg.bg} ${cfg.border} border rounded-xl p-4 flex gap-4`}>
                        <div className={`${cfg.color} mt-0.5 flex-shrink-0`}>{cfg.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <h4 className={`font-semibold text-sm ${cfg.color}`}>{ev.title}</h4>
                            {ev.status && (
                              <span className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-full">{ev.status}</span>
                            )}
                          </div>
                          {ev.agency && <p className="text-xs text-slate-500 mt-0.5">{ev.agency}</p>}
                          {ev.description && <p className="text-xs text-slate-400 mt-2 leading-relaxed">{ev.description}</p>}
                          {ev.countdown && ev.countdown !== 'Past' && (
                            <p className={`text-xs font-mono font-bold ${cfg.color} mt-2`}>{ev.countdown}</p>
                          )}
                          {ev.url && (
                            <a href={ev.url} target="_blank" rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 text-xs ${cfg.color} hover:underline mt-2`}>
                              View <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: Upcoming Events */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-4">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Upcoming Events
              <span className="ml-auto text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">Next 60 days</span>
            </h3>

            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-slate-500 animate-spin" /></div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No upcoming events found.</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {upcomingEvents.map(ev => {
                  const cfg = TYPE_CONFIG[ev.type];
                  const d = new Date(ev.date);
                  return (
                    <button
                      key={ev.id}
                      onClick={() => { setYear(d.getFullYear()); setMonth(d.getMonth()); setSelectedDay(d); }}
                      className={`w-full text-left ${cfg.bg} ${cfg.border} border rounded-xl p-3 hover:opacity-90 transition-all flex gap-3 items-start`}
                    >
                      <div className={`${cfg.dot} w-2 h-2 rounded-full mt-1.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${cfg.color} truncate`}>{ev.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {ev.countdown && ev.countdown !== 'Past' && ` · ${ev.countdown}`}
                        </p>
                        {ev.agency && <p className="text-[10px] text-slate-600 truncate">{ev.agency}</p>}
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.border} ${cfg.color} flex-shrink-0`}>
                        {cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-1.5">
              {(Object.keys(TYPE_CONFIG) as EventType[]).map(type => {
                const cfg = TYPE_CONFIG[type];
                return (
                  <div key={type} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceCalendar;
