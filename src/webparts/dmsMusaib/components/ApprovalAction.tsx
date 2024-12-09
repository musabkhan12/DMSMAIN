declare global {
  interface Window {
    // managePermission:(message:string) => void;
    // manageWorkflow:(documentLibrayName: string, SiteTitle: string) => void;
    view:(message:string) => void;
    // PreviewFile: (path: string, siteID: string, docLibName:any) => void;
    // deleteFile:(fileId: string , siteID:string, listToUpdate:any ) => void;
  }
}
interface UploadFileProps {
  currentfolderpath: {
    CurrentEntity: string;
    currentEntityURL: string;
    currentsiteID: string;
    // ... other properties
  };
}

// @ts-ignore
import * as React from "react";
import { getSP } from "../loc/pnpjsConfig";
import { SPFI } from "@pnp/sp";
import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap//dist/"
import "../../../CustomCss/mainCustom.scss";
// import "../../verticalSideBar/components/VerticalSimport "idebar.scss";
import VerticalSideBar from "../../verticalSideBar/components/VerticalSideBar";
import UserContext from "../../../GlobalContext/context";
// import { useState , useEffect } from "react";
import Provider from "../../../GlobalContext/provider";
import { useMediaQuery } from "react-responsive";
import "@pnp/sp/webs";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import "@pnp/sp/sites"
import "@pnp/sp/presets/all"
import { PermissionKind } from "@pnp/sp/security";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../CustomCss/mainCustom.scss";
// import "../../verticalSideBar/components/VerticalSidebar.scss";
import "./dmscss";
import "./DMSAdmincss"
import { useState , useRef , useEffect} from "react";
import {IDmsMusaibProps} from './IDmsMusaibProps'
import HorizontalNavbar from "../../horizontalNavBar/components/HorizontalNavBar";
 import EntityMapping from "./EntityMapping";

import './ApprovalActioncss'

import  { faEye } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
let approvedLevel:any ='' 
let filepreviewurl = ''
let remark :any = ''
let Level:any =''
let setFinalStatus:any =''
      let FileUID:any = ''
const DMSMyApprovalAction = ({ props }: any) => {
  console.log(props , "here is my props")
  const sp: SPFI = getSP();

  const { useHide }: any = React.useContext(UserContext);
  const elementRef = React.useRef<HTMLDivElement>(null);

  

  React.useEffect(() => {
    // console.log("This function is called only once", useHide);

    const showNavbar = (
      toggleId: string,
      navId: string,
      bodyId: string,
      headerId: string
    ) => {
      const toggle = document.getElementById(toggleId);
      const nav = document.getElementById(navId);
      const bodypd = document.getElementById(bodyId);
      const headerpd = document.getElementById(headerId);

      if (toggle && nav && bodypd && headerpd) {
        toggle.addEventListener("click", () => {
          nav.classList.toggle("show");
          toggle.classList.toggle("bx-x");
          bodypd.classList.toggle("body-pd");
          headerpd.classList.toggle("body-pd");
        });
      }
    };

    showNavbar("header-toggle", "nav-bar", "body-pd", "header");

    const linkColor = document.querySelectorAll(".nav_link");

    function colorLink(this: HTMLElement) {
      if (linkColor) {
        linkColor.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
      }
    }

    linkColor.forEach((l) => l.addEventListener("click", colorLink));
  }, [useHide]);
  // Media query to check if the screen width is less than 768px
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  React.useEffect(() => {
    // console.log("This function is called only once", useHide);

    const showNavbar = (
      toggleId: string,
      navId: string,
      bodyId: string,
      headerId: string
    ) => {
      const toggle = document.getElementById(toggleId);
      const nav = document.getElementById(navId);
      const bodypd = document.getElementById(bodyId);
      const headerpd = document.getElementById(headerId);

      if (toggle && nav && bodypd && headerpd) {
        toggle.addEventListener("click", () => {
          nav.classList.toggle("show");
          toggle.classList.toggle("bx-x");
          bodypd.classList.toggle("body-pd");
          headerpd.classList.toggle("body-pd");
        });
      }
    };

    showNavbar("header-toggle", "nav-bar", "body-pd", "header");

    const linkColor = document.querySelectorAll(".nav_link");

    function colorLink(this: HTMLElement) {
      if (linkColor) {
        linkColor.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
      }
    }

    linkColor.forEach((l) => l.addEventListener("click", colorLink));
  }, [useHide]);
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);
////////////////////////////////////  DMS Code Start From Here //////////////////////////////////////////////////////////////////
  const [Mylistdata, setMylistdata] = useState([]);
////
const [storedUserInfo, setStoredUserInfo] = useState(null);
const [ApprovedStatus, setApprovedStatus] = useState('');  // State for ApprovalType 0
// const [approvedLevel, setApprovedLevel] = useState<number>();

const [activeComponent, setActiveComponent] = useState<string >('');
////
console.log(activeComponent , "activeComponent")
const handleReturnToMain = (Name:any) => {
  setActiveComponent(Name); // Reset to show the main component
  console.log(activeComponent , "activeComponent updated")
};
  const getApprovalmasterTasklist = async () => {
    try {
      const items = await sp.web.lists.getByTitle('DMSFileApprovalTaskList').items.select(
    "Log","CurrentUser","Remark"	 	
         ,"LogHistory","ID"	                 
         ,"FileUID/FileUID"	         
         ,"FileUID/SiteName"	            
         ,"FileUID/DocumentLibraryName" 
         ,"FileUID/FileName"	              
        //  ,"FileUID/FilePreviewUrl" 
         ,"FileUID/Status"	
         ,"FileUID/FolderPath"	 
         ,"FileUID/RequestedBy"	 
         ,"FileUID/Created"	 
         ,"FileUID/ApproveAction"
         ,"MasterApproval/ApprovalType" 
         ,"MasterApproval/Level"	 
         ,"MasterApproval/DocumentLibraryName"	 
      )
      .expand("FileUID", "MasterApproval")
      .filter(`FileUID/FileUID eq '${props}'`)
      .orderBy("Modified", false)();
      console.log(items, "DMSFileApprovalTaskList");
     
     

      // start
      items.forEach((item)=>{
          if(currentUserEmailRef.current === item.CurrentUser && item.Log === null){
              setToggleLog(true);
          }
          console.log("FileUID" , item.FileUID.FileUID)
            FileUID = item.FileUID.FileUID
          
      })
      // end

      setMylistdata(items);
      
      
    } catch (error) {
      console.error("Error fetching list items:", error);
    }
    try {
      console.log("here")
      const updatedData:any = await sp.web.lists.getByTitle("DMSFileApprovalList").items
      .select("FileUID", "ID", "ApproveAction", "ApprovedLevel", "SiteName", "DocumentLibraryName", "ApprovedLevel" , "FilePreviewUrl")
      .filter(`FileUID eq '${FileUID}'`)()
      .catch((error) => console.error("Error fetching data from DMSFileApprovalList:", error));
      console.log(updatedData , "updatedData")
        filepreviewurl = updatedData[0].FilePreviewUrl;
        console.log(filepreviewurl , "file url")
    } catch (error) {
      console.error("Error fetching list items:", error);
    }
  };

  console.log(Mylistdata , "Mylistdata")
  // start
  const [toggleLog,setToggleLog]=useState(false);
  // end

  const currentUserEmailRef = useRef('');
  const getCurrrentuser=async()=>{
    const userdata = await sp.web.currentUser();
    currentUserEmailRef.current = userdata.Email;
    getApprovalmasterTasklist();
  }
  useEffect(() => {
    getCurrrentuser()

  }, []);




  const getTaskItemsbyID = async (e:any, itemid:any)=>{
    console.log("itemid" , itemid)
    const items = await sp.web.lists.getByTitle('DMSFileApprovalTaskList').items.select("CurrentUser" , "FileUID/FileUID" , "Log").expand("FileUID").filter(`FileUID/FileUID eq '${itemid}'`)();
      //  console.log(items , "items")
  }

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // start
  // const [remark,setRemark]=useState('');
  // console.log("remark",remark);
  const handleRemark=(event:any)=>{
    event.preventDefault();
    event.stopPropagation();
    // console.log("value of remark",event.target.value)
    // setRemark(event.target.value);
    remark = event.target.value 
    console.log(remark, "remaksss")
  }

  const handleLogAndLogHistory=async(event:any)=>{
      event.preventDefault(); 
      const buttonText = event.target.innerText || event.target.textContent;
      // const date =new Date();
      // const isoDate = date.toISOString();
      // console.log(isoDate);
      const filterData=Mylistdata.find((item)=> item.CurrentUser === currentUserEmailRef.current)
      console.log("filtered data Level",filterData.MasterApproval.Level);
      console.log("filterData id",filterData.FileUID.FileUID);
      console.log("filterData Id",filterData.Id);

      const isoDate = new Date().toISOString().slice(0, 19) + 'Z';
      // console.log(isoDate);
      // console.log("remark value",remark);

        // check and Set FinalApproved



      let payload;
      if(buttonText === "Approve"){

  
        const updatedData = await sp.web.lists.getByTitle("DMSFileApprovalList").items
        .select("FileUID", "ID", "ApproveAction", "ApprovedLevel", "SiteName", "DocumentLibraryName", "ApprovedLevel" , "FilePreviewUrl")
        .filter(`FileUID eq '${filterData.FileUID.FileUID}'`)()
        .catch((error) => console.error("Error fetching data from DMSFileApprovalList:", error));
        console.log(updatedData , "updatedData")
        
        if (updatedData && updatedData.length > 0) {
          const mydat = updatedData[0]; // Assuming you want to compare using the first item's SiteName
          filepreviewurl =  mydat.FilePreviewUrl
          console.log(mydat.FilePreviewUrl , "items,,,,")
          approvedLevel = mydat.ApprovedLevel
          // Step 3: Fetch data from the second list where SiteName matches
          const updatedata2 = await sp.web.lists.getByTitle("DMSFolderPermissionMaster").items
          .filter(`SiteName eq '${mydat.SiteName}' and DocumentLibraryName eq '${mydat.DocumentLibraryName}' and Level eq ${mydat.ApprovedLevel}`)()
            .catch((error:any) => console.error("Error fetching data from DMSFolderPermissionMaster:", error));
          
            const getTaskdata = await sp.web.lists.getByTitle("DMSFileApprovalTaskList").items.filter(`FileUID/FileUID eq '${filterData.FileUID.FileUID}'`) 
            .select("FileUID/FileUID", "MasterApproval/ApprovalType", "CurrentUser", "Log") 
            .expand("FileUID", "MasterApproval")()
            console.log(getTaskdata ,"getTaskdata")
          console.log(updatedata2 , "here is my data");
         
          getTaskdata.forEach(item => {
            console.log(item.CurrentUser , "CurrentUser")
              // Step 1: Check if CurrentUser matches the stored user
              if (item.CurrentUser === currentUserEmailRef.current) {
                // Step 2: Check ApprovalType
                if (item.MasterApproval.ApprovalType === 0) {
                  console.log(approvedLevel, "approvedLevel first in 0")
                  // If ApprovalType is 0, set state to 'done'
                  setApprovedStatus('Approved');
                  console.log("entere here in 0 for approval level" ,filterData.FileUID.FileUID , mydat.ApprovedLevel )
                   console.log("entere here in 0" , ApprovedStatus)
                   approvedLevel =mydat.ApprovedLevel+1
                   setFinalStatus = "Approved"
                   console.log(approvedLevel, "approvedLevel second in 1")
                } else if (item.MasterApproval.ApprovalType === 1) {
                  // Step 3: If ApprovalType is 1, check the Log field
                  let nonNullLogCount = 0;
                  let totalItems = getTaskdata.length;
      
                  getTaskdata.forEach(logItem => {
                    if (logItem.Log !== null) {
                      nonNullLogCount++;
                    }
                  });
      
                  // If more than 5 out of 6 Logs are not null, set 'approvalInProgress'
                  if (nonNullLogCount >= totalItems - 1) {
                    console.log(approvedLevel, "approvedLevel first in 1")
                    approvedLevel =mydat.ApprovedLevel+1
                    setFinalStatus = "Approved"
                    setApprovedStatus('Approved');
                    console.log("entere here in 1 for approval level" ,filterData.FileUID.FileUID , mydat.ApprovedLevel+1 )
                    console.log("entere here in 1" , ApprovedStatus)
                    console.log(approvedLevel, "approvedLevel second in 1")
                  }
                }
              }
            });
          
        } else {
          console.log("No matching data found in DMSFileApprovalList."); 
        }
         //start
try {
  const updatedData1:any = await sp.web.lists.getByTitle("DMSFileApprovalList").items
  .select("FileUID", "ID", "ApproveAction", "ApprovedLevel", "SiteName", "DocumentLibraryName", "ApprovedLevel" , "FilePreviewUrl")
  .filter(`FileUID eq '${FileUID}'`)()
  .catch((error) => console.error("Error fetching data from DMSFileApprovalList:", error));
  console.log(updatedData1 , "updatedData")


    filepreviewurl = updatedData1[0].FilePreviewUrl;
    Level = updatedData1[0].ApprovedLevel;
    console.log(updatedData1[0] , "DocumentLibraryName")

    const getdatafromfoldermaster = await sp.web.lists.getByTitle("DMSFolderPermissionMaster").items
    .filter(`SiteName eq '${updatedData1[0].SiteName}' and DocumentLibraryName eq '${updatedData1[0].DocumentLibraryName}'`)()
    console.log(getdatafromfoldermaster , "getdatafromfoldermaster")
   
    let maxLevel=0;
    getdatafromfoldermaster.forEach((item)=>{
      if(item.Level >= maxLevel){
        maxLevel=item.Level;
      }
    })

    console.log("MaxLevel ",maxLevel);

    if(Level === maxLevel){

      const taskdata = await sp.web.lists.getByTitle("DMSFileApprovalTaskList").items.filter(`FileUID/FileUID eq '${filterData.FileUID.FileUID}'`)
      .select("FileUID/FileUID", "MasterApproval/ApprovalType", "CurrentUser", "Log")
      .expand("FileUID", "MasterApproval")()

      console.log("getData from DMSFileApprovalTaskList",taskdata);

      taskdata.forEach((item)=>{
        if(item.CurrentUser === currentUserEmailRef.current){

              if(item.MasterApproval.ApprovalType === 0){
                    setFinalStatus="FinalApproved";

              }else if(item.MasterApproval.ApprovalType === 1){

                  let approvedUser=0;
                  let numberOfUser=taskdata.length;

                  taskdata.forEach(logItem => {
                    if (logItem.Log !== null) {
                      approvedUser++;
                    }
                  });

                  if(approvedUser >= numberOfUser - 1){
                        setFinalStatus="FinalApproved";
                  }

              }
        }
       
      })

    }else{
      setFinalStatus="Approved";
      console.log("Level is not equal to max level",Level);
      console.log("FinalStatus",setFinalStatus);


    }

} catch (error) {
  console.error("Error fetching list items:", error);
}
// end
            
          payload={
              Log:setFinalStatus,
              LogHistory:isoDate,
              Remark:remark,
              // ApprovedLevel:approvedLevel
          }
      }
      else if(buttonText === "Reject"){
        setFinalStatus = 'Rejected'
          payload={
              Log:setFinalStatus,
              LogHistory:isoDate,
              Remark:remark,
              // ApprovedLevel:approvedLevel
          }
      }

      console.log("payload for DMSFileApprovalTaskList",payload);
      
      const updateddata=await sp.web.lists.getByTitle("DMSFileApprovalTaskList").items.getById(filterData.Id).update(payload);
      
      console.log("Updated data",updateddata)


      const data=await sp.web.lists.getByTitle('DMSFileApprovalList').items.select("ID","ApproveAction","ApprovedLevel").filter(` FileUID eq '${filterData.FileUID.FileUID}'`)();

      console.log("data ",data);
      const id=data[0].Id;

      const paylaodForDMSFileApprovalList={
        ApprovedLevel:approvedLevel,
        ApproveAction:payload.Log,
        //  Status:setFinalStatus,
         FilePreviewUrl: filepreviewurl 
      }

      console.log("paylaodForDMSFileApprovalList",paylaodForDMSFileApprovalList);

      const updateddata1=await sp.web.lists.getByTitle("DMSFileApprovalList").items.getById(id).update(paylaodForDMSFileApprovalList);

      console.log("updateddata1",updateddata1);
     
  }
  const iframe = document.getElementById("filePreview") as HTMLIFrameElement;
  // const spinner = document.getElementById("spinner") as HTMLElement;

  // Show the spinner and hide the iframe initially
  // spinner.style.display = "block";
  if(iframe){
    iframe.style.display = "none";
    iframe.src = filepreviewurl;
  }


  // Add an onload event listener to the iframe
  if(iframe){

    iframe.onload = () => {
      console.log("Iframe has loaded");
  
      const checkAndHideButton = () => {
        try {
          const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDocument) {
            const button = iframeDocument.getElementById("OneUpCommandBar") as HTMLElement;
            const excelToolbar = iframeDocument.getElementById("m_excelEmbedRenderer_m_ewaEmbedViewerBar") as HTMLElement;
            if(excelToolbar){
              excelToolbar.style.display= "none"
            }
            if (button) {
              console.log("Hiding the OneUpCommandBar element");
              button.style.display = "none";
  
              // Hide the spinner and show the iframe after the button is hidden
              // spinner.style.display = "none";
              iframe.style.display = "block"; 
  
             // Exit the loop once the button is found and hidden
            } else {
              console.log("OneUpCommandBar not found, rechecking...");
            }
            
            const helpbutton = iframeDocument.getElementById("m_excelEmbedRenderer_m_ewaEmbedViewerBar") as HTMLElement; 
            if(helpbutton){
              helpbutton.style.display = "none"
            }
          }
        } catch (error) {
          console.error("Error accessing iframe content:", error);
        }
  
        // Re-check after a short delay if the button wasn't found
        setTimeout(checkAndHideButton, 100);
      };
  
      // Start checking for the button
      checkAndHideButton();
    };
  }
 
  return (
   
          <div className="container-fluid  paddb">
            {activeComponent === "" ? (
              <div>
                <div>
                  <div className="content">
                

                    <div className="row">
                      <div className="col-12">
                       
                        <div>
                          <div className="DMSMasterContainer">
                              {/* <h4 className="page-title fw-bold mb-1 font-20">Settings</h4> */}
                              <div className="container" style={{ backgroundColor: 'white', padding: '12px'}}>
                                  <table className="Approval-table">
                                    <thead className="Approval-table-header">
                                      <tr>
                                        <th
                                          style={{
                                          minWidth: '40px',
                                          maxWidth: '40px',
                                          borderBottomLeftRadius: '10px',
                                          }}
                                        >
                                             S.No
                                        </th>
                                        <th style={{ minWidth: '80px', maxWidth: '80px' }}>Request ID</th>
                                        {/* <th style={{ minWidth: '120px', maxWidth: '120px' }}>Process Name</th> */}
                                        <th style={{ minWidth: '80px', maxWidth: '80px' }}>Log</th>
                                        <th style={{ minWidth: '80px', maxWidth: '80px' }}>Log History</th>
                                        <th style={{ minWidth: '100px', maxWidth: '100px' }}>Requested By</th>
                                        <th style={{ minWidth: '100px', maxWidth: '100px' }}>Requested Date</th>
                                        <th style={{ minWidth: '80px', maxWidth: '80px' }}>Status</th>
                                        <th
                                          style={{
                                          minWidth: '70px',
                                          maxWidth: '70px',
                                          borderBottomRightRadius: '10px',
                                          }}
                                          >
                                            Remark
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody style={{ maxHeight: '8007px' }}>
       
                                            {Mylistdata.length > 0  ? Mylistdata.map((item, index) => {
                                            return(
                                                  <tr>
                                                    <td style={{ minWidth: '40px', maxWidth: '40px' }}>{index}</td>
                                                    <td className="text-dark ng-binding" style={{ minWidth: '80px', maxWidth: '80px' }}>{(truncateText(item.FileUID.FileUID, 10))}
                                                    </td>
                                                    <td style={{ minWidth: '80px', maxWidth: '80px' }}>{
                                                      item.Log
                                                      }</td>
                                                      <td style={{ minWidth: '100px', maxWidth: '100px' }}>
                                                        
                                                     
                                                           {item.LogHistory}

                                                       </td>
                                                    <td style={{ minWidth: '100px', maxWidth: '100px' }}>{(truncateText(item.FileUID.RequestedBy, 10))}</td> 
                                                    <td style={{ minWidth: '100px', maxWidth: '100px' }}>
                                                        <div
                                                          style={{
                                                            padding: '5px 15px',
                                                            border: '1px solid #efefef',
                                                            background: '#fff',
                                                            borderRadius: '30px',
                                                            width: '186px'
                                                          }}
                                                          className="btn btn-light"
                                                        >
                                                          {item.FileUID.Created}
                                                        </div>
                                                    </td>
                                                    <td style={{ minWidth: '80px', maxWidth: '80px' }}>
                                                        {/* <div className="finish mb-0"></div> */}
                                                        {item.FileUID.Status}
                                                        </td>
                                                    {/* <td style={{ minWidth: '70px', maxWidth: '70px' }}>
                                                          <a onClick={(e )=>getTaskItemsbyID(e , item.FileUID.FileUID)}>
                                                              <FontAwesomeIcon icon={faEye} />
                                                          </a>
                                                    </td> */}
                                                    <td style={{ minWidth: '70px', maxWidth: '70px' }}>
                                                      {item.Remark}
                                                    </td>
                                                    </tr>
                                                      )
                                                            })
                                                          :""
                                                      }       
                                    </tbody>
                              </table>
                          </div>
                      </div>
                    </div> 

                        
                  {toggleLog && (
                    <div className="container" style={{ backgroundColor: 'white', padding: '12px'}}>
 <iframe id="filePreview" width="100%" height="400"></iframe>
                         <div className="card cardbottom">
                          <div className="card-body">
                          
                            <div className="row">
                         
                              <div className="col-lg-12">
                                <div className="mb-0">
                                  <label className="form-label text-dark font-14">
                                    Remarks:
                                  </label>
                                  <input
                                   type="text"
                                   onChange={handleRemark}
                                  //  value={remark}
                                    />
                                </div>
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-12 text-center">
                                <a >
                                  {" "}
                                  <button
                                    
                                    onClick={handleLogAndLogHistory}
                                    type="button"
                                    className="btn btn-success waves-effect waves-light m-1"
                                  >
                                    <i className="fe-check-circle me-1"></i>{" "}
                                    Approve
                                  </button>
                                </a>
                                {/* <a >  <button type="button" className="btn btn-warning waves-effect waves-light m-1"><i className="fe-corner-up-left me-1"></i> Rework</button></a>   */}
                                <a >
                                  {" "}
                                  <button
                                    onClick={handleLogAndLogHistory}
                                    type="button"
                                    className="btn btn-danger waves-effect waves-light m-1"
                                  >
                                    <i className="fe-x-circle me-1"></i>{" "}
                                    Reject
                                  </button>
                                </a>
                                <button
                                  type="button"
                                  className="btn btn-light waves-effect waves-light m-1"
                                >
                                  <i className="fe-x me-1"></i> Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
                      
                  )}
                        
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {activeComponent === "Create Entity" && (
                  <div>
                    <button onClick={() => handleReturnToMain("")}>
                      {" "}
                      My Approvals{" "}
                    </button>
                    <EntityMapping />
                  </div>
                )}
              </div>
            )}
          </div>
        
  );
};




export default DMSMyApprovalAction;
