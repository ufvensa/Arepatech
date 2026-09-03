import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import bannerBg from "../images/VENSA Website Banner Background.png";
const vensaLogo = "/vensa-logo.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import instagramIcon from "../images/VENSA Website Instagram.png";
import facebookIcon from "../images/VENSA Website Facebook.png";
import pinIcon from "../images/VENSA Website Pin.png";
import linkedinIcon from "../images/VENSA Website LinkedIn.png";
import { fetchCalendarEvents, parseCalendarEvent } from "../lib/calendar";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const VENSA_CALENDAR_ID = "f3d770ab054ee200e74807a9efa1660f1b96c34aaae38e10474a9edaeedc57e9@group.calendar.google.com";
const GOOGLE_CALENDAR_SUBSCRIBE_URL = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(VENSA_CALENDAR_ID)}`;

const CATEGORY_RULES = [
  { name: "GBM", color: "#5df51b", textColor: "#102a05", labelColor: "#287500", keywords: ["gbm", "general body meeting"] },
  { name: "Athletics", color: "#47ad5a", textColor: "#ffffff", labelColor: "#28783a", keywords: ["athletics", "intramural", "sports"] },
  { name: "Events", color: "#fff725", textColor: "#172554", labelColor: "#8a6900", keywords: ["vensa x vida social", "welcome event", "lake day", "piscinada", "halloween party", "secret santa", "bbq", "social", "event"] },
  { name: "Community Service", color: "#9828e8", textColor: "#ffffff", labelColor: "#7b1dbc", keywords: ["jornada medica", "community service", "volunteer", "volunteering", "food bank", "blood drive"] },
  { name: "Marketing", color: "#d02a9c", textColor: "#ffffff", labelColor: "#a71877", keywords: ["hlsa tabling", "tabling", "marketing", "promotion"] },
  { name: "Professional Development", color: "#3c79bd", textColor: "#ffffff", labelColor: "#285f9d", keywords: ["cafecito", "career showcase", "prof. dev", "professional", "resume", "workshop", "network"] },
  { name: "Important Dates", color: "#c75c62", textColor: "#ffffff", labelColor: "#a23e44", keywords: ["classes begin", "classes end", "graduation"] },
  { name: "Mentorship", color: "#a3bae8", textColor: "#172554", labelColor: "#5876b2", keywords: ["mentor draft", "meet mentors", "mentorship", "mentor"] },
  { name: "Game Day", color: "#f49a24", textColor: "#172554", labelColor: "#a75a00", keywords: ["uf vs.", "game day"] },
  { name: "Outreach", color: "#ef2229", textColor: "#ffffff", labelColor: "#bd151b", keywords: ["movie night", "pickleball tournament", "outreach"] },
  { name: "No Classes", color: "#4a4a4a", textColor: "#ffffff", labelColor: "#4a4a4a", keywords: ["labor day", "homecoming", "veteran's day", "thanksgiving break", "reading day", "no classes"] },
];

const DEFAULT_CATEGORY = CATEGORY_RULES.find((category) => category.name === "Events");

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCategory(event = {}) {
  const descriptionCategory = event.description?.match(/CATEGORY:\s*([^\n<]+)/i)?.[1]?.trim();

  if (descriptionCategory) {
    const explicitCategory = CATEGORY_RULES.find(
      (rule) => rule.name.toLowerCase() === descriptionCategory.toLowerCase()
    );
    if (explicitCategory) return explicitCategory;
  }

  const normalizedText = `${event.title || ""} ${event.description || ""}`.toLowerCase();
  return CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalizedText.includes(keyword))
  ) || DEFAULT_CATEGORY;
}

function getCalendarDays(month) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstDay);
  const daysSinceMonday = (firstDay.getDay() + 6) % 7;
  gridStart.setDate(firstDay.getDate() - daysSinceMonday);

  return Array.from({ length: 35 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

function CalendarEvent({ event, compact = false }) {
  const category = getCategory(event);

  return (
    <button
      type="button"
      className={`calendar-event-chip${compact ? " compact" : ""}`}
      style={{ "--event-color": category.color, "--event-text-color": category.textColor }}
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
    <>
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
            <div className="calendar-month-controls" aria-label="Change month">
              <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button>
              <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">›</button>
            </div>
          </div>

          <div className="calendar-toolbar-actions">
            <a
              className="calendar-subscribe-button"
              href={GOOGLE_CALENDAR_SUBSCRIBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sync the VENSA calendar to your Google Calendar"
            >
              <span aria-hidden="true">+</span>
              Sync to Google Calendar
            </a>
            <label className="calendar-search">
              <span className="sr-only">Search events</span>
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search events"
              />
            </label>
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
                  const category = getCategory(event);
                  return (
                    <article
                      key={event.id}
                      className="calendar-agenda-card"
                      style={{ "--event-color": category.color, "--event-label-color": category.labelColor }}
                    >
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
              {CATEGORY_RULES.map((category) => (
                <span key={category.name}><i style={{ backgroundColor: category.color }} />{category.name}</span>
              ))}
            </div>
          </aside>
        </div>
      </section>

      </main>

      <footer className="footer">
        <div className="footer-main-container">
          <div className="footer-content">
            <Link to="/" className="footer-logo-group">
              <img src={ufLogo} alt="UF Logo" className="footer-logo-uf" />
              <div className="footer-divider"></div>
              <div className="footer-logo-text">
                <div className="footer-text-top">Venezuelan</div>
                <div className="footer-text-bottom">Student Association</div>
              </div>
              <img src={vensaLogo} alt="VENSA Logo" className="footer-logo-vensa" />
            </Link>

            <div className="footer-right">
              <div className="footer-social">
                <a
                  href="https://www.instagram.com/ufvensa/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-item"
                >
                  <img src={instagramIcon} alt="Instagram" className="social-icon" />
                  <span>@ufvensa</span>
                </a>
                <a
                  href="https://www.facebook.com/uf.vensa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-item"
                >
                  <img src={facebookIcon} alt="Facebook" className="social-icon" />
                  <span>@ufvensa</span>
                </a>
              </div>

              <div className="footer-contact">
                <a
                  href="https://www.google.com/maps/place/University+of+Florida/@29.6464959,-82.3557957,16.11z/data=!4m6!3m5!1s0x88e8a30cfbe49275:0x206fe0de143d9886!8m2!3d29.6465428!4d-82.3533266!16s%2Fm%2F0j_sncb?entry=ttu&g_ep=EgoyMDI1MTExNy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item"
                >
                  <img src={pinIcon} alt="Location" className="contact-icon" />
                  <span>University of Florida • Gainesville, FL</span>
                </a>
                <a
                  href="https://www.linkedin.com/company/ufvensa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item"
                >
                  <img src={linkedinIcon} alt="LinkedIn" className="contact-icon" />
                  <span>Venezuelan Student Association at<br />the University of Florida</span>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-copyright">
            © Copyright 2026. All Rights Reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
