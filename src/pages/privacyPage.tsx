import { Shield, Lock, Eye, User, Mail, Globe, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LOGIN_PAGE } from "@/constants/routerConstants";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  const handleAcceptClick = () => {
    setIsValid(true);
    setHasAccepted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-lg text-gray-600">
            Dernière mise à jour :{" "}
            {new Date().toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Introduction Card */}
        <Card className="mb-8 border-blue-100 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-blue-700">
              Votre confidentialité est notre priorité
            </CardTitle>
            <CardDescription>
              Chez Eventinas, nous nous engageons à protéger vos données
              personnelles. Cette politique explique comment nous collectons,
              utilisons et protégeons vos informations.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Information Collection */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-blue-600" />
              <CardTitle>1. Informations que nous collectons</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Informations fournies
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Nom et prénom</li>
                  <li>• Adresse email</li>
                  <li>• Numéro de téléphone</li>
                  <li>• Mot de passe (crypté)</li>
                  <li>• Photo de profil</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Informations automatiques
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Adresse IP</li>
                  <li>• Type de navigateur</li>
                  <li>• Pages visitées</li>
                  <li>• Horaires de connexion</li>
                  <li>• Données de localisation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage of Information */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-green-600" />
              <CardTitle>2. Utilisation de vos informations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Pour le service</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                    <span>Création et gestion de votre compte</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                    <span>Organisation d'événements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                    <span>Communication avec les participants</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">
                  Pour l'amélioration
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <span>Amélioration de nos services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <span>Analyse des tendances d'utilisation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <span>Développement de nouvelles fonctionnalités</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-5 h-5 text-red-600" />
              <CardTitle>3. Protection des données</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-3">
                Mesures de sécurité
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    256-bit
                  </div>
                  <p className="text-sm text-gray-600">Chiffrement SSL</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    24/7
                  </div>
                  <p className="text-sm text-gray-600">Surveillance</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    ISO 27001
                  </div>
                  <p className="text-sm text-gray-600">Certification</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Nous mettons en œuvre des mesures de sécurité techniques et
              organisationnelles appropriées pour protéger vos données contre
              tout accès non autorisé, altération, divulgation ou destruction.
            </p>
          </CardContent>
        </Card>

        {/* Cookie Policy */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <CardTitle>4. Politique des cookies</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Types de cookies utilisés
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Cookies essentiels
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Toujours actif
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Cookies analytiques
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Actif avec consentement
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Cookies de préférences
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Actif avec consentement
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Vous pouvez gérer vos préférences en matière de cookies à tout
                moment via les paramètres de votre navigateur.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              <CardTitle>5. Vos droits</CardTitle>
            </div>
            <CardDescription>
              Conformément au RGPD, vous disposez des droits suivants concernant
              vos données personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Droit d'accès", desc: "Consulter vos données" },
                {
                  title: "Droit de rectification",
                  desc: "Corriger vos informations",
                },
                {
                  title: "Droit à l'effacement",
                  desc: "Supprimer vos données",
                },
                {
                  title: "Droit à la portabilité",
                  desc: "Récupérer vos données",
                },
                {
                  title: "Droit d'opposition",
                  desc: "S'opposer au traitement",
                },
                { title: "Droit de limitation", desc: "Limiter l'utilisation" },
              ].map((right, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {right.title}
                  </h4>
                  <p className="text-sm text-gray-600">{right.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>6. Contact</CardTitle>
            <CardDescription>
              Pour toute question concernant cette politique de confidentialité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Contactez-nous
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Email :</span>{" "}
                   contact@eventinas.com
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Téléphone :</span> +33 1 23 45
                    67 89
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Délégué à la protection des données
                  </h4>
                  <p className="text-sm text-gray-600">
                    Notre DPO est disponible pour répondre à toutes vos
                    questions concernant la protection de vos données
                    personnelles.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Update Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-12">
          <h4 className="font-semibold text-yellow-800 mb-2">
            Mise à jour de la politique
          </h4>
          <p className="text-sm text-yellow-700">
            Nous pouvons mettre à jour cette politique de confidentialité de
            temps à autre. Nous vous informerons de tout changement significatif
            en publiant la nouvelle politique sur cette page et, le cas échéant,
            par notification par email.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <p className="text-xs text-yellow-600">
              Consultez régulièrement cette page pour rester informé des mises à
              jour.
            </p>
          </div>
        </div>

        {/* Accept Button */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Checkbox 
              checked={isValid} 
              onCheckedChange={(checked) => setIsValid(checked === true)} 
              className="w-5 h-5 text-blue-600" 
            />
            <span className="text-sm text-gray-700">J'ai lu et compris la politique de confidentialité</span>
          </div>
          
          {!hasAccepted ? (
            <Button
              ref={acceptButtonRef}
              onClick={handleAcceptClick}
              className="px-8 hover:bg-slate-900 hover:text-white transition-colors duration-300 cursor-pointer"
              variant="outline"
            >
              J'ai lu et j'accepte la politique de confidentialité
            </Button>
          ) : (
            <Button
              onClick={() => navigate(LOGIN_PAGE)}
              className="px-8 bg-green-600 hover:bg-green-700 text-white"
              variant="default"
            >
              Retour à la page de connexion
            </Button>
          )}
          
          <p className="text-sm text-gray-500 mt-4">
            En utilisant Eventinas, vous acceptez les termes de cette politique
            de confidentialité.
          </p>
        </div>
      </div>
    </div>
  );
}
