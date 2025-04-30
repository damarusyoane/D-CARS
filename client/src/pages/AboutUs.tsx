
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function AboutUs() {
  const teamMembers = [
    {
      name: 'John Smith',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      bio: 'With over 15 years in the automotive industry, John founded D-CARS with a vision to transform how people buy and sell vehicles online.'
    },
    {
      name: 'Sarah Johnson',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      bio: 'Sarah leads our tech team, bringing expertise in blockchain technology and secure digital transactions to the automotive marketplace.'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      bio: 'Michael ensures that our platform runs smoothly, overseeing everything from customer service to vendor relationships.'
    }
  ];

  const values = [
    {
      title: 'Trust & Transparency',
      description: 'We believe in complete transparency in vehicle listings and transactions.',
      icon: ShieldCheckIcon
    },
    {
      title: 'Customer First',
      description: 'Our decisions are guided by what provides the best experience for our users.',
      icon: UserGroupIcon
    },
    {
      title: 'Quality Assurance',
      description: 'Every vehicle listing undergoes a verification process to ensure accuracy.',
      icon: StarIcon
    },
    {
      title: 'Innovation',
      description: 'We continuously improve our platform with the latest technology.',
      icon: GlobeAltIcon
    }
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">À Propos de D-CARS</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Nous révolutionnons la façon dont les gens achètent et vendent des véhicules en ligne grâce à une plateforme
            sécurisée, transparente et conviviale.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact-us"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Contactez-Nous
            </Link>
            <Link
              to="/cars"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Browse Vehicles
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-gray-800 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Notre Histoire</h2>
              <p className="text-gray-300 mb-4">
                Founded in 2022, D-CARS emerged from a simple idea: make buying and selling cars
                more transparent, secure, and enjoyable. We recognized the challenges faced by
                both buyers and sellers in the traditional and online automotive marketplaces.
              </p>
              <p className="text-gray-300 mb-4">
                Our platform combines cutting-edge technology with automotive expertise to create
                a trusted environment where users can confidently trade vehicles. We've grown
                rapidly, connecting thousands of buyers and sellers across the country.
              </p>
              <p className="text-gray-300">
                Today, we continue to innovate and expand our services, always guided by our
                mission to transform the automotive marketplace for the better.
              </p>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1560179707-f14e90ef3603?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="D-CARS office"
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-800 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Notre Équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-blue-400 mb-4">{member.role}</p>
                  <p className="text-gray-400">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <TruckIcon className="h-12 w-12 mx-auto text-blue-400 mb-4" />
              <p className="text-4xl font-bold mb-2">10,000+</p>
              <p className="text-gray-400">Véhicules Listés</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <UserGroupIcon className="h-12 w-12 mx-auto text-blue-400 mb-4" />
              <p className="text-4xl font-bold mb-2">5,000+</p>
              <p className="text-gray-400">Clients Satisfaits</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-blue-400 mb-4" />
              <p className="text-4xl font-bold mb-2">24/7</p>
              <p className="text-gray-400">Support Client</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à Commencer ?</h2>
          <p className="text-xl mb-8">
            Rejoignez des milliers d'utilisateurs satisfaits qui achètent et vendent des véhicules sur notre plateforme.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/auth/register"
              className="px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              Créer un Compte
            </Link>
            <Link
              to="/cars"
              className="px-6 py-3 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
            >
              Browse Vehicles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
