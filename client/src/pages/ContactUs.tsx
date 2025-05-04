import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import {
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';


export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Replace the import line with a direct URL
const ContactHeroBackground = 'assets/contact.jpg';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !subject || !message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Submit contact form to database
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name,
          email,
          subject,
          message,
          status: 'unread',
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast.success('Message envoyé avec succès ! Nous vous répondrons bientôt.');
      
      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Échec de l\'envoi du message. Veuillez réessayer plus tard.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-gray-900 text-white min-h-screen">
       {/* Hero Section with Background Image */}
       <section 
        className="relative py-24 px-4 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${ContactHeroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Contactez-Nous</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Vous avez des questions ou des commentaires ? Notre équipe est à votre écoute. Contactez-nous et nous vous répondrons dans les plus brefs délais.
          </p>
        </div>
      </section>
      
      {/* Contact Information & Form Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Contact Information */}
            <div className="lg:w-1/3">
              <div className="bg-gray-800 rounded-lg p-6 h-full">
                <h2 className="text-2xl font-bold mb-6">Entrer en Contact</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-blue-500/20 p-3 rounded-full mr-4">
                      <MapPinIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Notre Adresse</h3>
                      <p className="text-gray-400">123 Auto Plaza Drive</p>
                      <p className="text-gray-400">Douala, Cameroun</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-500/20 p-3 rounded-full mr-4">
                      <EnvelopeIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Contactez-nous par Email</h3>
                      <p className="text-gray-400">support@dcars.com</p>
                      <p className="text-gray-400">sales@dcars.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-500/20 p-3 rounded-full mr-4">
                      <PhoneIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Appelez-nous</h3>
                      <p className="text-gray-400">+237 674 411 479</p>
                      <p className="text-gray-400">+237 674 411 479</p>

                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-500/20 p-3 rounded-full mr-4">
                      <ClockIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Heures d'Ouverture</h3>
                      <p className="text-gray-400">Lundi-Vendredi: 9AM - 6PM</p>
                      <p className="text-gray-400">Samedi: 10AM - 4PM</p>
                      <p className="text-gray-400">Dimanche:  Fermé</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Suivez-nous</h3>
                  <div className="flex space-x-4">
                    <a 
                      href="https://facebook.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition-colors"
                      aria-label="Visitez notre page Facebook"
                      title="Visitez notre page Facebook"
                    >
                      <span className="sr-only">Facebook</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a 
                      href="https://twitter.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition-colors"
                      aria-label="Visitez notre page Twitter"
                      title="Visitez notre page Twitter"
                    >
                      <span className="sr-only">Twitter</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a 
                      href="https://instagram.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition-colors"
                      aria-label="Visitez notre page Instagram"
                      title="Visitez notre page Instagram"
                    >
                      <span className="sr-only">Instagram</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a 
                      href="https://linkedin.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition-colors"
                      aria-label="Visitez notre page LinkedIn"
                      title="Visitez notre page LinkedIn"
                    >
                      <span className="sr-only">LinkedIn</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:w-2/3">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Envoyez-nous un Message</h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Votre Nom</label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Votre Email</label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-2">Sujet</label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                    <textarea
                      id="message"
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your message here..."
                      required
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                        Envoyer le Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-12 px-4 bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Questions Fréquemment Posées</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Qu'est-ce que D-CARS ?</h3>
              <p className="text-gray-300">D-CARS est une plateforme en ligne qui connecte les acheteurs et les vendeurs de voitures, offrant un marché sécurisé et transparent pour les transactions de véhicules.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Comment puis-je mettre mon véhicule en vente ?</h3>
              <p className="text-gray-300">Créez simplement un compte, cliquez sur "Créer une annonce" dans votre tableau de bord et suivez le processus étape par étape pour ajouter les détails et les images de votre véhicule.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Y a-t-il des frais pour vendre un véhicule ?</h3>
              <p className="text-gray-300">Nous proposons différents plans d'abonnement pour les vendeurs. Les annonces de base sont gratuites, tandis que des fonctionnalités premium sont disponibles moyennant des frais minimes. Consultez notre page <Link to="/subscription" className="text-blue-400 hover:underline">Abonnement</Link> pour plus de détails.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Comment puis-je contacter un vendeur ?</h3>
              <p className="text-gray-300">Lors de la consultation d'une annonce de véhicule, cliquez sur le bouton "Contacter le vendeur" pour envoyer un message directement via notre plateforme. Toutes les communications sont gérées de manière sécurisée via notre système de messagerie.</p>
            </div>
          </div>
        </div>
      </section>

      
      {/* Map Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0956138677766!2d-122.38790708433136!3d37.77638997975903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ2JzM1LjMiTiAxMjLCsDIzJzA5LjUiVw!5e0!3m2!1sen!2sus!4v1620870138879!5m2!1sen!2sus" 
                  width="100%" 
                  height="450" 
                  allowFullScreen={false} 
                  title="Localisation D-CARS"
                  className="w-full h-full border-0"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
