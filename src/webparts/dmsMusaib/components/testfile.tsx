import React from "react";
import { MSGraphClientV3 } from '@microsoft/sp-http';

const Testfile = () => {
    const getSharedWithMeData = async (graphClient: MSGraphClientV3) => {
        try {
          const sharedItems = await graphClient.api('/me/drive/sharedWithMe').get();
          console.log("Shared With Me Data:", sharedItems);
      
          sharedItems.value.forEach((item: any) => {
            console.log(`Name: ${item.name}`);
            console.log(`Web URL: ${item.webUrl}`);
            console.log(`Owner: ${item.owner?.user?.displayName}`);
          });
        } catch (error) {
          console.error("Error fetching Shared With Me data:", error);
        }
      }
     
    
      // Assuming you have a way to get the MSGraphClientV3 instance, pass it to the function
      // Example: this.context.msGraphClientFactory.getClient('3').then((client: MSGraphClientV3) => getSharedWithMeData(client));
    return (
        <div>
            <h1>Testfile</h1>
        </div>
    );
};

export default Testfile;