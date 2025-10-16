import React from "react";

function UserManual() {
  return (
    <div style={{ padding: 30, maxWidth: 900, margin: "auto" }}>
      <h1>Guide d'utilisation - Work Sphere</h1>

      <p>
        Bienvenue sur Work Sphere, votre plateforme de recherche d'emploi. Ce
        guide vous accompagne dans l'utilisation du site pour trouver et
        postuler aux offres qui vous correspondent.
      </p>

      <h2>Navigation du site</h2>
      <p>Le site Work Sphere est organisé en deux sections principales :</p>
      <ul>
        <li>
          <strong>Accueil</strong> : Page d'accueil avec recherche rapide par
          poste et type de contrat. Affiche également le nombre d'annonces
          disponibles.
        </li>
        <li>
          <strong>Emplois</strong> : Liste complète des offres d'emploi avec
          détails pour chaque annonce. Cliquez sur une offre pour voir la
          description, l'entreprise et les informations de contact.
        </li>
      </ul>

      <h2>Rechercher une offre</h2>
      <p>Depuis la page d'accueil :</p>
      <ol>
        <li>Saisissez l'intitulé du poste recherché dans le champ Poste</li>
        <li>
          Sélectionnez le type de contrat souhaité (CDI, CDD, Stage,
          Alternance...)
        </li>
        <li>Cliquez sur Rechercher pour voir les résultats</li>
      </ol>
      <p>
        Vous serez redirigé vers la page Emplois avec les offres correspondant à
        vos critères.
      </p>

      <h2>Consulter une offre</h2>
      <p>Sur la page Emplois :</p>
      <ul>
        <li>Cliquez sur une annonce pour déplier ses détails complets</li>
        <li>
          Consultez la description du poste, les compétences requises et le
          salaire
        </li>
        <li>
          Retrouvez les informations de l'entreprise (logo, adresse, contact)
        </li>
      </ul>

      <h2>Postuler à une offre</h2>
      <p>
        Pour postuler à une offre qui vous intéresse, cliquez sur le bouton
        Postuler disponible dans les détails de l'annonce. Selon l'offre, deux
        options sont possibles :
      </p>
      <ul>
        <li>
          Postuler directement depuis Work Sphere en remplissant le formulaire
          de candidature
        </li>
        <li>
          Être redirigé vers le site de l'entreprise ou une plateforme externe
          pour finaliser votre candidature
        </li>
      </ul>
      <p>
        Assurez-vous d'avoir votre CV et vos informations de contact à jour
        avant de postuler.
      </p>

      <h2>Compte utilisateur</h2>
      <p>Dans le menu en haut à droite, vous trouverez les options :</p>
      <ul>
        <li>Se connecter : Accédez à votre compte existant</li>
        <li>
          S'inscrire : Créez un nouveau compte pour sauvegarder vos recherches
          et gérer vos candidatures
        </li>
      </ul>
      <p>
        Une fois connecté, vous pourrez également accéder au guide d'utilisation
        à tout moment depuis votre espace personnel.
      </p>

      <h2>Besoin d'aide ?</h2>
      <p>
        Si vous rencontrez un problème technique ou avez des questions sur une
        offre, contactez notre support à : grtacos@worksphere.com
      </p>
    </div>
  );
}

export default UserManual;
