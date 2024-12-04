declare global {
  interface Window {
    //managePermission:(message:string) => void;
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
import "../../verticalSideBar/components/VerticalSidebar.scss";
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
import "../../verticalSideBar/components/VerticalSidebar.scss";
import "./dmscss";
import "./DMSAdmincss"
import { useState , useRef , useEffect} from "react";
import {IDmsMusaibProps} from './IDmsMusaibProps'
import HorizontalNavbar from "../../horizontalNavBar/components/HorizontalNavBar";
 import EntityMapping from "./EntityMapping";
import Devision from "./Division";
import Department from "./Department";
import './MyApprovalscss'

import  { faEye } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DMSMyApprovalAction from "./ApprovalAction";
let currentItemID= ''
const DMSMyApprovalComponent = ({ props }: any) => {
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
         ,"LogHistory"	                 
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
      .filter(`CurrentUser eq '${currentUserEmailRef.current}'`)();;
      console.log(items, "DMSFileApprovalTaskList");
      setMylistdata(items);
      
    } catch (error) {
      console.error("Error fetching list items:", error);
    }
  };
  console.log(Mylistdata , "Mylistdata")
  const currentUserEmailRef = useRef('');
  const getCurrrentuser=async()=>{
    const userdata = await sp.web.currentUser();
    currentUserEmailRef.current = userdata.Email;
    getApprovalmasterTasklist();
  }
  useEffect(() => {
    getCurrrentuser()

  }, []);


  const truncateText =  (text: string, maxLength?: any) => {
    if(text){
      return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    }
    
  };


  const getTaskItemsbyID = async (e:any, itemid:any)=>{
    currentItemID = itemid
    setActiveComponent('Approval Action')
    console.log("itemid" , itemid)
    const items = await sp.web.lists.getByTitle('DMSFileApprovalTaskList').items.select("CurrentUser" , "FileUID/FileUID" , "Log").expand("FileUID").filter(`FileUID/FileUID eq '${itemid}'`)();
       console.log(items , "items")
  }
  return (
    <div id="wrapper" ref={elementRef}>
    <div
      className="app-menu"
      id="myHeader">
      <VerticalSideBar _context={sp} />
    </div>
    <div className="content-page">
      <HorizontalNavbar/>
      <div className="content" style={{marginLeft: `${!useHide ? '240px' : '80px'}`,marginTop:'1.5rem'}}>
       
      <div className="container-fluid  paddb">
      {activeComponent === "" ?
               (<div>
                    <div className="DMSMasterContainer">
                <h4 className="page-title fw-bold mb-1 font-20">My Approvals</h4>
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
        <th style={{ minWidth: '120px', maxWidth: '120px' }}>Process Name</th>
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
          Action
        </th>
      </tr>
    </thead>
    <tbody style={{ maxHeight: '8007px' }}>
       
      {Mylistdata.length > 0  ? Mylistdata.map((item, index) => {
      return(
        <tr>
<td style={{ minWidth: '40px', maxWidth: '40px' }}>{index}</td>
<td className="text-dark ng-binding" style={{ minWidth: '80px', maxWidth: '80px' }}>{(truncateText(item.FileUID.FileUID, 10))}</td>
<td style={{ minWidth: '120px', maxWidth: '120px' }}>Capex Form</td>
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
<div className="finish mb-0">Pending</div>
</td>
<td style={{ minWidth: '70px', maxWidth: '70px' }}>
<a onClick={(e )=>getTaskItemsbyID(e , item.FileUID.FileUID)}>
 <FontAwesomeIcon icon={faEye} />
</a>
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
               </div>) : (
                <div>
                  {activeComponent === 'Approval Action' && (
                    <div>
                   <button onClick={()=>handleReturnToMain('')}> Back </button>
                  <DMSMyApprovalAction props={currentItemID}/>
                    </div>
               
                  )} 
             
                </div>
               
            
               )
               }
              </div>
            </div>
          </div>
          </div>
   
        
  );
};



const DMSMyApproval: React.FC<IDmsMusaibProps> = (props) =>{
  return (
    <Provider>
      <DMSMyApprovalComponent  props={props}/>
    </Provider>
  );
};

export default DMSMyApproval;
