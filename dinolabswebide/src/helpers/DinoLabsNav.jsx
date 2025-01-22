import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faRightToBracket, faIdCard, faRightFromBracket, faPerson, faStopwatch, faDatabase, faListCheck, faGear, faFileZipper, faSignal, faComputer, faCaretDown, faCaretRight, faCode } from "@fortawesome/free-solid-svg-icons"; 
import "../styles/helperStyles/DinoLabsNav.css";
import useAuth from "../UseAuth.jsx";
import useIsTouchDevice from "../TouchDevice.jsx";

const DinoLabsNav = ({ activePage }) => {
    const navigate = useNavigate();
    const isTouchDevice = useIsTouchDevice();
    const { token, userID, organizationID, isAdmin, loading } = useAuth();
    const [isHamburger, setIsHamburger] = useState(false);
    const [isTokenExpired, setIsTokenExpired] = useState(false);

    useEffect(() => {
        const checkTokenExpiration = () => {
            if (token) {
                const decodedToken = decodeToken(token); 
                if (decodedToken.exp * 1000 < Date.now()) { 
                    setIsTokenExpired(true);
                } else {
                    setIsTokenExpired(false);
                }
            }
        };

        checkTokenExpiration();
    }, [token]); 

    useEffect(() => {
        if (isHamburger) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "";
        }

        return () => {
          document.body.style.overflow = "";
        };
    }, [isHamburger]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userid");
        localStorage.removeItem("orgid");
        navigate("/login");
    };

    const decodeToken = (token) => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(atob(base64).split("").map(function(c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(""));

            return JSON.parse(jsonPayload);
        } catch (error) {
            return {};
        }
    };

    return (
        <div> 
            <div className="homeHeaderContainer" style={{"background": "#000"}}>
                <div className="homeTopNavBarContainer"> 

                    <div className="homeSkipToContent"> 
                        <img className="homeLogo" src="./DinoLabsLogo-White.png" alt="Logo"/>
                        <label className="homeHeader" style={{"color": "#c0c0c0"}}>
                            Dino Labs Web IDE
                        </label> 
                    </div>


                    <div className="homeNavSupplement">
                        
                    </div>

                    {!isTouchDevice && (
                        <button className="homeHamburgerCircle" onClick={()=> setIsHamburger(!isHamburger)}>
                            <FontAwesomeIcon icon={isHamburger ? faXmark : faBars} className="homeHamburgerIcon" style={{"color": "white"}}/>
                        </button>
                    )}
                </div>
            </div>

            {isHamburger && !isTouchDevice && (
                !isAdmin ? (
                    <div className="homeHamburgerPopout" style={{"background-color": "#000"}}> 
                        {!permissionsLoading && (
                            <div className="homeHamburgerContent">
                                

                                {token && !isTokenExpired && (
                                    <button className="navigationButtonWrapper" onClick={()=> navigate("/dinolabs-ide")}>
                                        <div className="navigationButton" style={{"color": "#ced6dd"}}>
                                            <FontAwesomeIcon icon={faCode} className="navigationButtonIcon"/>
                                            DinoLabs IDE
                                        </div>

                                        <div className="navigationButtonDivider" style={{"background-color": "#ced6dd"}}/>
                                    </button>
                                )}

                                {!token && (
                                    <button className="navigationButtonWrapper" onClick={()=> navigate("/register")}>
                                        <div className="navigationButton" style={{"color": "white"}}>
                                            <FontAwesomeIcon icon={faIdCard} className="navigationButtonIcon"/>
                                            Sign Up
                                        </div>

                                        <div className="navigationButtonDivider" style={{"background-color": "#ced6dd"}}/>
                                    </button>
                                )}

                                {!token ? (
                                    <button className="navigationButtonWrapper" onClick={()=> navigate("/login")}>
                                        <div className="navigationButton" style={{"color": "white"}}>
                                            <FontAwesomeIcon icon={faRightToBracket} className="navigationButtonIcon"/>
                                            Login
                                        </div>   

                                        <div className="navigationButtonDivider" style={{"background-color": "#ced6dd"}}/>
                                    </button>
                                ) : (
                                    <button className="navigationButtonWrapper" onClick={handleLogout}>
                                        <div className="navigationButton" style={{"color": "#ced6dd"}}>
                                            <FontAwesomeIcon icon={faRightFromBracket} className="navigationButtonIcon"/>
                                            Sign Out
                                        </div>   

                                        <div className="navigationButtonDivider" style={{"background-color": "#ced6dd"}}/>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="homeHamburgerPopout" style={{"background-color": "#000"}}> 
                        {!permissionsLoading && (
                            <div className="homeHamburgerContent">
                                

                                {isAdmin && (
                                    <>
                                        {token && !isTokenExpired && (
                                            <button className="navigationButtonWrapper" onClick={()=> navigate("/dinolabs-ide")}>
                                                <div className="navigationButton" style={{"color": "#ced6dd"}}>
                                                    <FontAwesomeIcon icon={faCode} className="navigationButtonIcon"/>
                                                    DinoLabs IDE
                                                </div>

                                                <div className="navigationButtonDivider" style={{"background-color": "#ced6dd"}}/>
                                            </button>
                                        )}
                                    </>
                                )}

                                <button className="navigationButtonWrapper" onClick={handleLogout}>
                                    <div className="navigationButton" style={{"color": "#ced6dd"}}>
                                        <FontAwesomeIcon icon={faRightFromBracket} className="navigationButtonIcon"/>
                                        Sign Out
                                    </div>   

                                    <div className="navigationButtonDivider" style={{"background-color": "#ced6dd"}}/>
                                </button>

                                

                                
                            </div>
                        )}
                    </div>
                )
            )}
        </div>
    );
}; 

export default DinoLabsNav;
