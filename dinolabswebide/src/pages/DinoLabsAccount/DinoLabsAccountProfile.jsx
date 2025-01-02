import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "../../styles/mainStyles/AccountStyles/DinoLabsIDEAccount.css";
import "../../styles/helperStyles/LoadingSpinner.css";
import useIsTouchDevice from "../../TouchDevice"; 
import useAuth from "../../UseAuth"; 
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import {
  faA,
  faArrowDown,
  faArrowUp,
  faCopy,
  faExclamationTriangle,
  faList,
  faMagnifyingGlass,
  faMagnifyingGlassPlus,
  faSquare,
  faTableColumns,
  faXmark,
  faCode, 
  faIdCard,
  faEnvelope,
  faMobileScreen,
  faPersonDigging,
  faBuilding,
  faScroll,
  faCity,
  faUserTie
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DinoLabsIDEAccount = ({ onClose }) => {
    const navigate = useNavigate();
    const isTouchDevice = useIsTouchDevice();
    const { token, userID, organizationID, loading } = useAuth();
    const [isLoaded, setIsLoaded] = useState(false);
    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const [resizeTrigger, setResizeTrigger] = useState(false);

    const [isAdmin, setIsAdmin] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [image, setImage] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");
    const [twoFAEnabled, setTwoFAEnabled] = useState(false); 
    const [multiFAEnabled, setMultiFAEnabled] = useState(false); 
    const [loginNotis, setLoginNotis] = useState(false);
    const [exportNotis, setExportNotis] = useState(false);
    const [dataSharing, setDataSharing] = useState(false);
    const [organizationName, setOrganizationName] = useState(""); 
    const [organizationEmail, setOrganizationEmail] = useState(""); 
    const [organizationPhone, setOrganizationPhone] = useState(""); 
    const [organizationImage, setOrganizationImage] = useState(""); 
    

    const [selectedState, setSelectedState] = useState("none");

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    fetchUserInfo(userID), 
                ]);
                setIsLoaded(true);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (!loading && token) {
            fetchData();
        }
    }, [userID, loading, token]);

    useEffect(() => {
        const handleResize = () => {
            setIsLoaded(false);
            setScreenSize(window.innerWidth);
            setResizeTrigger(prev => !prev);

            setTimeout(() => setIsLoaded(true), 300);
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!organizationID || organizationID === userID) {
            setSelectedState("permissions");
        } else {
            setSelectedState("none");
        }
    }, [organizationID, userID]);

    const fetchUserInfo = async (userID) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("https://www.dinolaboratories.com/dinolabs/dinolabs-web-api/user-info", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userID,
                }),
            });

            if (response.status !== 200) {
                throw new Error(`Internal Server Error`);
            }

            const data = await response.json();
            setEmail(data[0].email);
            setFirstName(data[0].firstname);
            setLastName(data[0].lastname);
            setImage(data[0].image);
            setPhone(data[0].phone);
            setRole(data[0].role);
            setIsAdmin(data[0].isadmin);
            setTwoFAEnabled(data[0].twofa);
            setMultiFAEnabled(data[0].multifa);
            setLoginNotis(data[0].loginnotis);
            setExportNotis(data[0].exportnotis);
            setDataSharing(data[0].datashare);
            setOrganizationName(data[0].organizationname);
            setOrganizationEmail(data[0].organizationemail);  
            setOrganizationPhone(data[0].organizationphone)
            setOrganizationImage(data[0].organizationimage); 

        } catch (error) {
            return; 
        }
    };

    return (
        <div className="dinolabsIDESettingsContainer">
            <button className="dinolabsIDESettingsCloseButton" onClick={onClose}>
                Close Profile
            </button>

            {isLoaded && (
                <div className="dinolabsIDEAccountWrapper">

                    <div className="dinolabsIDEAccountInformationContainer"> 
                        <div className="dinolabsIDEPersonalWrapper"> 
                            <img className="dinolabsIDEAccountImage" src={image}/>

                            <div className="dinolabsIDEAccountNameStack">
                                <label className="dinolabsIDEAccountName"> 
                                    {firstName} {lastName}
                                </label>

                                <label className="dinolabsIDEAccountSubName"> 
                                    <FontAwesomeIcon icon={faIdCard}/>
                                    @{userID}
                                </label>

                                <label className="dinolabsIDEAccountSubName"> 
                                    <FontAwesomeIcon icon={faEnvelope}/>
                                    {email}
                                </label>

                                <label className="dinolabsIDEAccountSubName"> 
                                    <FontAwesomeIcon icon={faMobileScreen}/>
                                    {phone}
                                </label>

                                <label className="dinolabsIDEAccountSubName"> 
                                    <FontAwesomeIcon icon={faCity}/>
                                    <strong>{organizationName}</strong> <span>(ID: {organizationID})</span>
                                </label>
                            </div>
                        </div>

                        {(organizationID !== "" && organizationID && organizationID !== userID) ? (
                            <div className="dinolabsIDEOrganizationWrapper"> 
                                <div className="dinolabsIDEOrganizationFlex"> 
                                    <img className="dinolabsAccountOrganizationImage" src={organizationImage}/>
                                    
                                    <div className="dinolabsAccountOrganizationHeader">
                                        <label className="dinolabsIDEAccountOrganizationSubName" style={{"padding-top": 0}}> 
                                            <FontAwesomeIcon icon={faCity}/>
                                            <strong>{organizationName.trim()}</strong>
                                        </label>

                                        <label className="dinolabsIDEAccountOrganizationSubName"> 
                                            <FontAwesomeIcon icon={faIdCard}/>
                                            <span>{organizationID}</span>
                                        </label>


                                        <label className="dinolabsIDEAccountOrganizationSubName"> 
                                            <FontAwesomeIcon icon={faEnvelope}/>
                                            <span>{organizationEmail}</span>
                                        </label>

                                        <label className="dinolabsIDEAccountOrganizationSubName"> 
                                            <FontAwesomeIcon icon={faMobileScreen}/>
                                            <span>{organizationPhone}</span>
                                        </label>

                                    </div>
                                </div>

                                <label className="dinolasIDEAccountOrganizationSupplement"> 
                                    <FontAwesomeIcon icon={faUserTie}/>
                                    <span>
                                        Admin at {organizationName}: <strong>{isAdmin === "admin" ? "True" : "False"}</strong>
                                    </span>
                                </label> 

                                <label className="dinolasIDEAccountOrganizationSupplement"> 
                                    <FontAwesomeIcon icon={faPersonDigging}/>
                                    <span>
                                        Role at {organizationName}: <strong>{role}</strong>
                                    </span>
                                </label> 
                            </div>
                        ) : (
                            <div className="dinolabsIDEOrganizationWrapper"> 
                            </div>
                        )} 
                    </div> 

                    <div className="dinolabsIDEAccountFunctionalityContainer"> 
                        <div className="dinolabsIDEAccountFunctionalityCellLeading"> 

                        </div> 

                        <div className="dinolabsIDEAccountFunctionalityCellTrailing"> 
                            
                        </div> 
                    </div>

                    

                </div>  
            )}

            {!isLoaded && (
                <div className="dinolabsIDEAccountWrapper">
                    <div className="loading-wrapper">
                        <div className="loading-circle"/>

                        <label className="loading-title"> 
                            Dino Labs Web IDE
                        </label> 
                    </div>
                </div> 
            )}

            
        </div>
    );
};

export default DinoLabsIDEAccount;
