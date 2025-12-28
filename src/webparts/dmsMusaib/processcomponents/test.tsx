import React, { useEffect } from "react";
import { MSGraphClientV3 } from '@microsoft/sp-http';
import { getSP } from "../loc/pnpjsConfig";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items/get-all";
import "@pnp/sp/items";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import "@pnp/sp/sites"
import "@pnp/sp/presets/all"
import "@pnp/sp/webs";
import "@pnp/sp/sites";
import "@pnp/sp/site-users/web";
const Testfile = () => {
    const sp: SPFI = getSP();
    useEffect(() => {
        // Call the function to get shared with me data
        getdoclib();
    }
    , []);
    const getdoclib = async () => {
const getdoclib = async () => {
  try {
    const pageSize = 500;
    let allItems: any[] = [];
    
    let paged = await sp.web.lists
      .getByTitle("DMSFolderMaster")
      .items
      .select("SiteTitle", "DocumentLibraryName")
      .top(pageSize)
      .getPaged();  // Note: This should be getPaged() - make sure the spelling is correct
    
    // Add first page before loop
    allItems.push(...paged.results);
    
    while (paged.hasNext) {
      paged = await paged.getNext();
      allItems.push(...paged.results);
    }
    
    console.log("All Items:", allItems);
    const activeItems = allItems.filter(item => 
      item.SiteTitle === 'Group Information Technology Department' && 
      item.DocumentLibraryName === 'NT PG 5'
    );
    console.log("Filtered Items:", activeItems);
    
    alert("getdoclib completed successfully");
  } catch (error) {
    console.error("Error in getdoclib:", error);
    alert("Error in getdoclib: " + error.message);
  }
};
    };
     
    
      // Assuming you have a way to get the MSGraphClientV3 instance, pass it to the function
      // Example: this.context.msGraphClientFactory.getClient('3').then((client: MSGraphClientV3) => getSharedWithMeData(client));
    return (
        <div>
            <h1>Testfile</h1>
        </div>
    );
};

export default Testfile;