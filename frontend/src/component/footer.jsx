import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();
  const navigateToUserManuel = () => navigate("/usermanual");
  return (
    <div className="Ws-footer">
      <ul className="Ws-UlFooter">
        <li className="Ws-LiFooter">Crédit</li>
        <li className="Ws-LiFooter">Support</li>
        <li className="Ws-LiFooter" onClick={navigateToUserManuel}>
          User Manuel
        </li>
        <li className="Ws-LiFooter">Se connecter</li>
      </ul>
    </div>
  );
}
export default Footer;
