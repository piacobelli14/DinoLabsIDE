import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "../../styles/mainStyles/AccountStyles/DinoLabsIDEAccount.css";
import "../../styles/helperStyles/ConsoleToggleSwitch.css";
import "../../styles/mainStyles/DinoLabsIDEPlots.css";
import "../../styles/helperStyles/LoadingSpinner.css";
import useIsTouchDevice from "../../TouchDevice"; 
import LinePlot from "../../helpers/PlottingHelpers/LineHelper.jsx";
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
  faUserTie,
  faGear,
  faGears,
  faArrowLeft,
  faArrowRight,
  faUpRightFromSquare,
  faUserGear,
  faAddressCard,
  faUsers,
  faLock,
  faUsersGear,
  faKeyboard,
  faPallet,
  faPalette,
  faSquareXmark,
  faRectangleXmark
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
    const [personalUsageByDay, setPersonalUsageByDay] = useState([]);
    

    const [selectedState, setSelectedState] = useState("none");

    const [displayEmail, setDisplayEmail] = useState(true); 
    const [displayPhone, setDisplayPhone] = useState(true);
    
    const [displayTeamID, setDisplayTeamID] = useState(true); 
    const [displayTeamEmail, setDisplayTeamEmail] = useState(true); 
    const [displayTeamPhone, setDisplayTeamPhone] = useState(true);
    const [displayTeamAdminStatus, setDisplayTeamAdminStatus] = useState(true); 
    const [displayTeamRole, setDisplayTeamRole] = useState(true); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    fetchUserInfo(userID), 
                    fetchPersonalUsageData(userID)
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

    const fetchPersonalUsageData = async (userID) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token not found in localStorage");
            }
    
            const response = await fetch("https://www.dinolaboratories.com/dinolabs/dinolabs-web-api/usage-info", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ userID }),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }
    
            const data = await response.json();
            if (!data.personalUsageInfo || !Array.isArray(data.personalUsageInfo)) {
                throw new Error("Unexpected data structure from the backend");
            }

            setPersonalUsageByDay(
                data.personalUsageInfo.map((item) => ({
                    day: new Date(item.day), 
                    count: parseInt(item.usage_count, 0),
                }))
            );
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
                                    {displayEmail ? email : '•'.repeat(email.length)}
                                </label>

                                <label className="dinolabsIDEAccountSubName"> 
                                    <FontAwesomeIcon icon={faMobileScreen}/>
                                    {displayPhone ? phone : '•'.repeat(phone.length)}
                                </label>

                                <label className="dinolabsIDEAccountSubName"> 
                                    <FontAwesomeIcon icon={faCity}/>
                                    <strong>{organizationName}</strong> <span>(ID: {displayTeamID ? organizationID : '•'.repeat(organizationID.length)})</span>
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
                                            <span>{displayTeamID ? organizationID : '•'.repeat(organizationID.length)}</span>
                                        </label>


                                        <label className="dinolabsIDEAccountOrganizationSubName"> 
                                            <FontAwesomeIcon icon={faEnvelope}/>
                                            <span>{displayTeamEmail ? organizationEmail : '•'.repeat(organizationEmail.length)}</span>
                                        </label>

                                        <label className="dinolabsIDEAccountOrganizationSubName"> 
                                            <FontAwesomeIcon icon={faMobileScreen}/>
                                            <span>{displayTeamPhone ? organizationPhone : '•'.repeat(organizationPhone.length)}</span>
                                        </label>

                                    </div>
                                </div>

                                <label className="dinolasIDEAccountOrganizationSupplement"> 
                                    <FontAwesomeIcon icon={faUserTie}/>
                                    <span>
                                        Admin at {organizationName}: <strong>{displayTeamAdminStatus ? (isAdmin === "admin" ? "True" : "False") : "N/A"}</strong>
                                    </span>
                                </label> 

                                <label className="dinolasIDEAccountOrganizationSupplement"> 
                                    <FontAwesomeIcon icon={faPersonDigging}/>
                                    <span>
                                        Role at {organizationName}: <strong>{displayTeamRole ? role : '•'.repeat(role.length)}</strong>
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
                            <div className="dinolabsIDEAccountFunctionalityList">
                                <button className="dinolabsIDEAccountFunctionalityButton" 
                                    onClick={()=>{
                                        {selectedState === "personalInfo" ? (
                                            setSelectedState("none")
                                        ) : (
                                            setSelectedState("personalInfo")
                                        )}
                                    }}
                                    style={{"background-color": selectedState === "personalInfo" ? "rgba(255,255,255,0.1)" : ""}}
                                > 
                                    <span>
                                        <FontAwesomeIcon icon={faUserGear}/>
                                        Update My Personal Information 
                                    </span>

                                    <FontAwesomeIcon icon={selectedState === "personalInfo" ? faSquareXmark : faUpRightFromSquare}/>
                                </button> 

                                <button className="dinolabsIDEAccountFunctionalityButton" 
                                    onClick={()=>{
                                        {selectedState === "teamInfo" ? (
                                            setSelectedState("none")
                                        ) : (
                                            setSelectedState("teamInfo")
                                        )}
                                    }}
                                    style={{"background-color": selectedState === "teamInfo" ? "rgba(255,255,255,0.1)" : ""}}
                                > 
                                    <span>
                                        <FontAwesomeIcon icon={faUsersGear}/>
                                        Update My Team Infomration 
                                    </span>

                                    <FontAwesomeIcon icon={selectedState === "teamInfo" ? faSquareXmark : faUpRightFromSquare}/>
                                </button> 

                                <button className="dinolabsIDEAccountFunctionalityButton" 
                                    onClick={()=>{
                                        {selectedState === "settingsManagement" ? (
                                            setSelectedState("none")
                                        ) : (
                                            setSelectedState("settingsManagement")
                                        )}
                                    }}
                                    style={{"background-color": selectedState === "settingsManagement" ? "rgba(255,255,255,0.1)" : ""}}
                                > 
                                    <span>
                                        <FontAwesomeIcon icon={faCode}/>
                                        Edit My Dino Labs IDE Settings
                                    </span>

                                    <FontAwesomeIcon icon={selectedState === "settingsManagement" ? faSquareXmark : faUpRightFromSquare}/>
                                </button> 

                                <button className="dinolabsIDEAccountFunctionalityButton" 
                                    onClick={()=>{
                                        {selectedState === "shortcutManagement" ? (
                                            setSelectedState("none")
                                        ) : (
                                            setSelectedState("shortcutManagement")
                                        )}
                                    }}
                                    style={{"background-color": selectedState === "shortcutManagement" ? "rgba(255,255,255,0.1)" : ""}}
                                > 
                                    <span>
                                        <FontAwesomeIcon icon={faKeyboard}/>
                                        Configure My Keyboard Shortcuts
                                    </span>

                                    <FontAwesomeIcon icon={selectedState === "shortcutManagement" ? faSquareXmark : faUpRightFromSquare}/>
                                </button> 

                                <button className="dinolabsIDEAccountFunctionalityButton" 
                                    onClick={()=>{
                                        {selectedState === "themeManagement" ? (
                                            setSelectedState("none")
                                        ) : (
                                            setSelectedState("themeManagement")
                                        )}
                                    }}
                                    style={{"background-color": selectedState === "themeManagement" ? "rgba(255,255,255,0.1)" : ""}}
                                > 
                                    <span>
                                        <FontAwesomeIcon icon={faPalette}/>
                                        Change My Editor Theme
                                    </span>

                                    <FontAwesomeIcon icon={selectedState === "themeManagement" ? faSquareXmark : faUpRightFromSquare}/>
                                </button>
                            </div>
                            
                            <div className="dinolabsIDESettingsFootnoteWrapper"> 
                                Changes to settings should save automatically, if you don't see your change reflected immediately, 
                                try refeshing the browser or signing in again.
                            </div> 
                        </div> 
                        
                    
                        <div className="dinolabsIDEAccountFunctionalityCellTrailing"> 
                            {selectedState === "none" ? (
                                <LinePlot
                                    plotType="adminAdministratorSigninsPlot"
                                    data={personalUsageByDay}
                                />
                            ) : (
                                <div className="dinolabsIDESettingsOperationsWrapper">
                                    {selectedState === "personalInfo" && (
                                        <>
                                            <div className="dinolabsIDESettingsButtonWrapper">
                                                <button className="dinolabsIDESettingsButtonLine"> 
                                                    <span>
                                                        Display my email address. 
                                                    </span>

                                                    <span>
                                                        <Tippy content="Toggle Email Display" theme="tooltip-light">
                                                            <label className="consoleSwitch">
                                                                <input type="checkbox" checked={displayEmail} onChange={() => { 
                                                                    setDisplayEmail(!displayEmail); 
                                                                }} />
                                                                <span className="consoleSlider round"></span>
                                                            </label>
                                                        </Tippy>

                                                        <label className="dinolabsIDESettingsToggleLabel"> 
                                                            {displayEmail ? "Yes" : "No"}
                                                        </label>
                                                    </span>
                                                </button>

                                                <button className="dinolabsIDESettingsButtonLine"> 
                                                    <span> 
                                                        Display my phone number. 
                                                    </span>

                                                    <span>
                                                        <Tippy content="Toggle Phone Number Display" theme="tooltip-light">
                                                            <label className="consoleSwitch">
                                                                <input type="checkbox" checked={displayPhone} onChange={() => { 
                                                                    setDisplayPhone(!displayPhone); 
                                                                }} />
                                                                <span className="consoleSlider round"></span>
                                                            </label>
                                                        </Tippy>
                                                    
                                                        <label className="dinolabsIDESettingsToggleLabel"> 
                                                            {displayPhone ? "Yes" : "No"}
                                                        </label>
                                                    </span>
                                                </button>
                                            </div>

                                            <div className="dinolabsIDESettingsFootnoteWrapper"> 
                                                To edit your actual account information, picture or contact info, please login to the main Dino Labs web platform 
                                                and change it from the account management dashboard.                                                       
                                            </div>
                                        </>
                                    )}

                                    {selectedState === "teamInfo" && (
                                        <>
                                            <div className="dinolabsIDESettingsButtonWrapper">
                                                <button className="dinolabsIDESettingsButtonLine"> 
                                                    <span>
                                                        Display my team's ID number. 
                                                    </span>

                                                    <span>
                                                        <Tippy content="Toggle Team ID Display" theme="tooltip-light">
                                                            <label className="consoleSwitch">
                                                                <input type="checkbox" checked={displayTeamID} onChange={() => { 
                                                                    setDisplayTeamID(!displayTeamID); 
                                                                }} />
                                                                <span className="consoleSlider round"></span>
                                                            </label>
                                                        </Tippy>

                                                        <label className="dinolabsIDESettingsToggleLabel"> 
                                                            {displayTeamID ? "Yes" : "No"}
                                                        </label>
                                                    </span>
                                                </button>

                                                <button className="dinolabsIDESettingsButtonLine"> 
                                                    <span> 
                                                        Display my team's email. 
                                                    </span>

                                                    <span>
                                                        <Tippy content="Toggle Team Email Display" theme="tooltip-light">
                                                            <label className="consoleSwitch">
                                                                <input type="checkbox" checked={displayTeamEmail} onChange={() => { 
                                                                    setDisplayTeamEmail(!displayTeamEmail); 
                                                                }} />
                                                                <span className="consoleSlider round"></span>
                                                            </label>
                                                        </Tippy>
                                                    
                                                        <label className="dinolabsIDESettingsToggleLabel"> 
                                                            {displayTeamEmail ? "Yes" : "No"}
                                                        </label>
                                                    </span>
                                                </button>

                                                <button className="dinolabsIDESettingsButtonLine"> 
                                                    <span> 
                                                        Display my team's phone number. 
                                                    </span>

                                                    <span>
                                                        <Tippy content="Toggle Team Phone Number Display" theme="tooltip-light">
                                                            <label className="consoleSwitch">
                                                                <input type="checkbox" checked={displayTeamPhone} onChange={() => { 
                                                                    setDisplayTeamPhone(!displayTeamPhone); 
                                                                }} />
                                                                <span className="consoleSlider round"></span>
                                                            </label>
                                                        </Tippy>
                                                    
                                                        <label className="dinolabsIDESettingsToggleLabel"> 
                                                            {displayTeamPhone ? "Yes" : "No"}
                                                        </label>
                                                    </span>
                                                </button>

                                                <button className="dinolabsIDESettingsButtonLine"> 
                                                    <span> 
                                                        Display my admin status at {organizationName}. 
                                                    </span>

                                                    <span>
                                                        <Tippy content="Toggle Admin Info Display" theme="tooltip-light">
                                                            <label className="consoleSwitch">
                                                                <input type="checkbox" checked={displayTeamAdminStatus} onChange={() => { 
                                                                    setDisplayTeamAdminStatus(!displayTeamAdminStatus); 
                                                                }} />
                                                                <span className="consoleSlider round"></span>
                                                            </label>
                                                        </Tippy>
                                                    
                                                        <label className="dinolabsIDESettingsToggleLabel"> 
                                                            {displayTeamAdminStatus ? "Yes" : "No"}
                                                        </label>
                                                    </span>
                                                </button>

                                                <button className="dinolabsIDESettingsButtonLine"> 
                                                    <span> 
                                                        Display my role at {organizationName}. 
                                                    </span>

                                                    <span>
                                                        <Tippy content="Toggle Role Display" theme="tooltip-light">
                                                            <label className="consoleSwitch">
                                                                <input type="checkbox" checked={displayTeamRole} onChange={() => { 
                                                                    setDisplayTeamRole(!displayTeamRole); 
                                                                }} />
                                                                <span className="consoleSlider round"></span>
                                                            </label>
                                                        </Tippy>
                                                    
                                                        <label className="dinolabsIDESettingsToggleLabel"> 
                                                            {displayTeamRole ? "Yes" : "No"}
                                                        </label>
                                                    </span>
                                                </button>
                                            </div>

                                            <div className="dinolabsIDESettingsFootnoteWrapper"> 
                                                To edit your team affiliation information or affiliation status, please login to the main Dino Labs web platform 
                                                and change it from the account management dashboard.                                                       
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
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
