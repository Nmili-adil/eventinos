import { deleteAccountApi } from '@/api/deleteAccountApi';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { handleAsyncError } from '@/hooks/useGlobalErrorHandler';

const DeleteAccount = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email : '',
    reason: '',
    additionalInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await deleteAccountApi(formData);

      if (response.statusText === 'OK') {
        setSubmitted(true);
        toast.success('Demande soumise avec succès. Vous recevrez un email de confirmation sous 24 à 48 heures.');
      } else {
        handleAsyncError({ response: { status: 400 } }, 'Échec de la soumission de la demande. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Failed to send request:', error);
      handleAsyncError(error, 'Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    document.title = 'Demande de suppression de compte - Eventinas';
    if(submitted) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [submitted, navigate]);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-gray-900">Demande soumise</h2>
            <p className="mt-2 text-gray-600">
              Votre demande de suppression de compte a été reçue. Nous la traiterons dans un délai de 24 à 48 heures et vous enverrons un email de confirmation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">Demande de suppression de compte</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Veuillez remplir ce formulaire pour demander la suppression de votre compte. Nous examinerons et traiterons votre demande manuellement.
          </p>
        </div>
      <div className="w-full max-w-6xl space-y-8 flex flex-col md:flex-row justify-center gap-4 md:gap-2">
        

       

        <div className="bg-white p-6 md:p-8 rounded-lg shadow flex-1">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">À propos de la suppression et de la confidentialité</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              <strong>Suppression de compte :</strong> La suppression de votre compte est une action irréversible. Toutes vos données personnelles,
              événements, contacts et autres informations associées seront définitivement supprimées de nos serveurs.
            </p>
            <p>
              <strong>Délai de traitement :</strong> Votre demande sera examinée manuellement dans un délai de 24 à 48 heures.
              Vous recevrez un email de confirmation une fois la suppression effectuée.
            </p>
            <p>
              <strong>Confidentialité :</strong> Nous nous engageons à protéger vos données personnelles conformément à notre politique de confidentialité.
              Toutes les informations fournies dans ce formulaire sont traitées de manière confidentielle et sécurisée.
            </p>
            <p>
              <strong>Conservation des données :</strong> Après la suppression, certaines données anonymisées peuvent être conservées
              pour des raisons légales ou statistiques, mais aucune information permettant de vous identifier ne sera retenue.
            </p>
            <p>
              <strong>Contact :</strong> Si vous avez des questions concernant la suppression de votre compte ou notre politique de confidentialité,
              n'hésitez pas à nous contacter via notre support.
            </p>
          </div>
        </div>
         <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-lg shadow flex-1">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Nom complet *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between'>
            <div className='flex-1 w-full sm:w-auto'>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Adresse e-mail *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            /></div>
            <div className='flex-1 w-full sm:w-auto'>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Téléphone *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Raison de la suppression *
            </label>
            <select
              id="reason"
              name="reason"
              required
              value={formData.reason}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Sélectionnez une raison</option>
              <option value="no-longer-needed">Plus nécessaire</option>
              <option value="privacy-concerns">Préoccupations de confidentialité</option>
              <option value="found-alternative">Trouvé une alternative</option>
              <option value="too-many-emails">Trop d'emails</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
              Informations supplémentaires
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              rows={4}
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="Tous les détails supplémentaires que vous souhaitez partager..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">
              <strong>Avertissement :</strong> La suppression du compte est permanente et ne peut pas être annulée. Toutes vos données seront supprimées.
            </p>
          </div>
          <div className='w-full flex gap-4'>
            <Button 
            onClick={() => navigate(-1)}
            variant={'outline'}
            className='flex-1'
            >Annule</Button>
          <Button
            type="submit"
            disabled={loading}
            className="disabled:opacity-50 disabled:cursor-not-allowed flex-1"
          >
            {loading ? 'Soumission...' : 'Soumettre la demande de suppression'}
          </Button>
          </div>
        </form>
      </div>
    </div>
  )
};
export default DeleteAccount;