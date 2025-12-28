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
      alert("getdoclib called");
     const list = sp.web.lists.getByTitle("DMSFolderMaster");

let allItems: any[] = [];
let batchSize = 1000;

let paged = await list.items
  .select("ID", "FolderPath") // Add other fields if needed
  .top(batchSize)
  .filter(`SiteTitle eq 'Group Information Technology Department' and DocumentLibraryName eq 'NT PG 5'`)
  .getPaged();

allItems.push(...paged.results);

while (paged.hasNext) {
  paged = await paged.getNext();
  allItems.push(...paged.results);
}

console.log("libraryNestedData", allItems);
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