import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import bannerBg from "../images/VENSA Website Banner Background.png";
const vensaLogo = "/vensa-logo.png";
import { fetchCalendarEvents, parseCalendarEvent } from "../lib/calendar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CATEGORY_RULES = [
  { name: "Community", color: "#f59e0b", keywords: ["social", "picnic", "beach", "bonfire", "fiesta", "bbq"] },
  { name: "Professional", color: "#3b82f6", keywords: ["career", "resume", "workshop", "network", "professional"] },
  { name: "Wellness", color: "#10b981", keywords: ["run", "pilates", "fitness", "wellness", "pickleball", "sports"] },
];

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCategory(title = "") {
  const normalizedTitle = title.toLowerCase();
  return CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalizedTitle.includes(keyword))
  ) || { name: "VENSA", color: "#1e3a8a" };
}

function getCalendarDays(month) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

function CalendarEvent({ event, compact = false }) {
  const category = getCategory(event.title);

  return (
    <button
      type="button"
      className={`calendar-event-chip${compact ? " compact" : ""}`}
      style={{ "--event-color": category.color }}
      title={`${event.title} · ${event.isAllDay ? "All day" : event.startTime}`}
    >
      <span className="calendar-event-dot" aria-hidden="true" />
      <span className="calendar-event-chip-title">{event.title}</span>
      {!compact && <span className="calendar-event-time">{event.isAllDay ? "All day" : event.startTime}</span>}
    </button>
  );
}

export default function Calendar() {
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;

    fetchCalendarEvents().then((calendarEvents) => {
      if (active) {
        setEvents(calendarEvents.map(parseCalendarEvent));
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return events;

    return events.filter((event) =>
      [event.title, event.location, event.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [events, query]);

  const eventsByDate = useMemo(() => {
    return filteredEvents.reduce((grouped, event) => {
      const key = dateKey(event.startDate);
      grouped[key] = [...(grouped[key] || []), event];
      return grouped;
    }, {});
  }, [filteredEvents]);

  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const selectedEvents = eventsByDate[dateKey(selectedDate)] || [];
  const monthLabel = visibleMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function changeMonth(offset) {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
    setVisibleMonth(nextMonth);
    setSelectedDate(nextMonth);
  }

  function goToToday() {
    const current = new Date();
    setVisibleMonth(new Date(current.getFullYear(), current.getMonth(), 1));
    setSelectedDate(current);
  }

  return (
    <main className="calendar-page">
      <header className="calendar-hero" style={{ backgroundImage: `url(${bannerBg})` }}>
        <div className="calendar-hero-overlay" />
        <div className="calendar-hero-content">
          <span className="calendar-eyebrow">Stay connected</span>
          <h1>VENSA Calendar</h1>
          <p>Meet us at the next gathering, workshop, or community event.</p>
        </div>
      </header>

      <section className="calendar-shell" aria-label="VENSA events calendar">
        <div className="calendar-toolbar">
          <div className="calendar-heading-group">
            <h2>{monthLabel}</h2>
            <button type="button" className="calendar-today-button" onClick={goToToday}>Today</button>
          </div>

          <div className="calendar-toolbar-actions">
            <label className="calendar-search">
              <span className="sr-only">Search events</span>
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search events"
              />
            </label>
            <div className="calendar-month-controls" aria-label="Change month">
              <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button>
              <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">›</button>
            </div>
          </div>
        </div>

        <div className="calendar-layout">
          <div className="calendar-board">
            <div className="calendar-weekdays" aria-hidden="true">
              {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
            </div>

            <div className={`calendar-grid${loading ? " is-loading" : ""}`}>
              {calendarDays.map((day) => {
                const key = dateKey(day);
                const dayEvents = eventsByDate[key] || [];
                const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                const isToday = key === dateKey(today);
                const isSelected = key === dateKey(selectedDate);

                return (
                  <div
                    key={key}
                    className={`calendar-day${isCurrentMonth ? "" : " outside"}${isSelected ? " selected" : ""}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <button
                      type="button"
                      className={`calendar-day-number${isToday ? " today" : ""}`}
                      onClick={() => setSelectedDate(day)}
                      aria-label={`Select ${day.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
                    >
                      {day.getDate()}
                    </button>
                    <div className="calendar-day-events">
                      {dayEvents.slice(0, 2).map((event) => (
                        <CalendarEvent key={event.id} event={event} compact />
                      ))}
                      {dayEvents.length > 2 && <span className="calendar-more-events">+{dayEvents.length - 2} more</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="calendar-agenda">
            <div className="calendar-agenda-date">
              <span>{selectedDate.toLocaleDateString("en-US", { weekday: "long" })}</span>
              <strong>{selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</strong>
            </div>

            {loading ? (
              <div className="calendar-agenda-empty">Loading the calendar…</div>
            ) : selectedEvents.length ? (
              <div className="calendar-agenda-list">
                {selectedEvents.map((event) => {
                  const category = getCategory(event.title);
                  return (
                    <article key={event.id} className="calendar-agenda-card" style={{ "--event-color": category.color }}>
                      <span className="calendar-agenda-category">{category.name}</span>
                      <h3>{event.title}</h3>
                      <p><span aria-hidden="true">◷</span> {event.isAllDay ? "All day" : event.startTime}</p>
                      <p><span aria-hidden="true">⌖</span> {event.location}</p>
                      {event.formUrl && (
                        <a href={event.formUrl} target="_blank" rel="noreferrer">RSVP for this event <span aria-hidden="true">↗</span></a>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="calendar-agenda-empty">
                <img src={vensaLogo} alt="" />
                <h3>No events this day</h3>
                <p>Pick another date or check back soon for new plans.</p>
              </div>
            )}

            <div className="calendar-legend">
              {[...CATEGORY_RULES, { name: "VENSA", color: "#1e3a8a" }].map((category) => (
                <span key={category.name}><i style={{ backgroundColor: category.color }} />{category.name}</span>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="calendar-cta">
        <div>
          <span className="calendar-eyebrow">Never miss a moment</span>
          <h2>See what else is happening at VENSA</h2>
        </div>
        <Link to="/events">Explore upcoming events <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}
