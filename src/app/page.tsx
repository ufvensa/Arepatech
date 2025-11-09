import Link from 'next/link';
import { Calendar, Briefcase, Users, ArrowRight } from 'lucide-react';
import { mockEvents } from '@/lib/mock-data/events';
import { mockOpportunities } from '@/lib/mock-data/opportunities';
import { formatDateTime } from '@/lib/utils';

export default function HomePage() {
  const upcomingEvents = mockEvents
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
    .slice(0, 3);

  const featuredOpportunities = mockOpportunities
    .filter(o => o.status === 'active')
    .slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to VENSA
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Venezuelan Student Association at the University of Florida
            </p>
            <p className="text-lg mb-10 text-blue-50">
              Creating a home away from home while fostering professional development and cultural connection.
            </p>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                Join Us
              </Link>
              <Link
                href="/events"
                className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors shadow-lg border border-blue-400"
              >
                View Events
              </Link>
              <Link
                href="/contact"
                className="bg-transparent text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors border-2 border-white"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              VENSA is dedicated to creating a supportive community where Venezuelan students can connect, grow, and thrive together. 
              We understand the challenges of being away from home, and we're here to provide a space where members feel supported, 
              culturally connected, and professionally empowered.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Community</h3>
                <p className="text-gray-600">
                  Building lasting connections among Venezuelan students
                </p>
              </div>
              
              <div className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Professional Development</h3>
                <p className="text-gray-600">
                  Creating pathways to career success through mentorship and opportunities
                </p>
              </div>
              
              <div className="p-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-yellow-600" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Cultural Preservation</h3>
                <p className="text-gray-600">
                  Celebrating Venezuelan heritage and traditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Opportunities Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Opportunities</h2>
            <Link 
              href="/opportunities"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
            >
              View All <ArrowRight size={20} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredOpportunities.map((opp) => (
              <div key={opp.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {opp.opportunity_type.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{opp.title}</h3>
                <p className="text-gray-600 font-semibold mb-2">{opp.company}</p>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{opp.description}</p>
                {opp.salary_range && (
                  <p className="text-green-600 font-semibold text-sm mb-3">{opp.salary_range}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{opp.location}</span>
                  <Link 
                    href={`/opportunities/${opp.id}`}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
            <Link 
              href="/events"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
            >
              View Calendar <ArrowRight size={20} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {event.image_url && (
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      event.event_type === 'professional' ? 'bg-purple-100 text-purple-700' :
                      event.event_type === 'social' ? 'bg-pink-100 text-pink-700' :
                      event.event_type === 'cultural' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {event.event_type.toUpperCase()}
                    </span>
                    {event.ticket_price > 0 && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                        ${event.ticket_price}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{event.title}</h3>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <Calendar size={16} className="mr-2" />
                    {formatDateTime(event.date_time)}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{event.location}</p>
                  <Link 
                    href={`/events/${event.id}`}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Join VENSA?</h2>
          <p className="text-xl mb-8">
            Connect with fellow Venezuelan students and unlock professional opportunities!
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Become a Member
          </Link>
        </div>
      </section>
    </div>
  );
}
