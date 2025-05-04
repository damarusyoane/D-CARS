import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const heroBgImages = [
  'https://images.unsplash.com/photo-1517524008697-6a3e0dc53c63?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1503376780353-7db4a3f8a056?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1581091226825-f6c5e0068cb0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80'
];

export default function AboutUs() {
  const teamMembers = [
    {
      name: 'Damarus Ngankou',
      role: 'Fondateur & PDG',
      image: '/assets/DAMARUS.jpg',
      bio: 'Avec plus de 15 ans dans l\'industrie automobile, Damarus a fondé D-CARS avec la vision de transformer la façon dont les gens achètent et vendent des véhicules en ligne au Cameroun.'
    },
  ];

  const values = [
    {
      title: 'Confiance & Transparence',
      description: 'Nous croyons en une transparence totale dans les annonces et les transactions de véhicules.',
      icon: ShieldCheckIcon
    },
    {
      title: 'Client d\'Abord',
      description: 'Nos décisions sont guidées par ce qui offre la meilleure expérience à nos utilisateurs.',
      icon: UserGroupIcon
    },
    {
      title: 'Assurance Qualité',
      description: 'Chaque annonce de véhicule fait l\'objet d\'un processus de vérification pour garantir sa précision.',
      icon: StarIcon
    },
    {
      title: 'Innovation',
      description: 'Nous améliorons continuellement notre plateforme avec les technologies les plus récentes.',
      icon: GlobeAltIcon
    }
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <section  className="py-20 px-4 relative bg-cover bg-center"
  style={{ 
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroBgImages[Math.floor(Math.random() * heroBgImages.length)]})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
>
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">À Propos de D-CARS</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Nous révolutionnons la façon dont les gens achètent et vendent des véhicules en ligne grâce à une plateforme
            sécurisée, transparente et conviviale, spécialement conçue pour le marché camerounais.
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
              Parcourir les Véhicules
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
                Fondée en 2022, D-CARS est née d'une idée simple : rendre l'achat et la vente de voitures plus transparents, 
                sécurisés et agréables au Cameroun. Nous avons reconnu les défis auxquels sont confrontés les acheteurs 
                et les vendeurs sur les marchés automobiles traditionnels et en ligne.
              </p>
              <p className="text-gray-300 mb-4">
                Notre plateforme combine une technologie de pointe avec une expertise automobile pour créer un environnement 
                de confiance où les utilisateurs peuvent échanger des véhicules en toute confiance. Nous avons connu une 
                croissance rapide, connectant des milliers d'acheteurs et de vendeurs à travers le Cameroun.
              </p>
              <p className="text-gray-300">
                Aujourd'hui, nous continuons d'innover et d'étendre nos services, toujours guidés par notre mission de 
                transformer le marché automobile pour le rendre plus accessible et transparent.
              </p>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1560179707-f14e90ef3603?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Bureau D-CARS"
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
              Parcourir les Véhicules
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
