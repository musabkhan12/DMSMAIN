import React, { useEffect, useState } from "react";
import { getSP } from "../loc/pnpjsConfig";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import "@pnp/sp/sites";
import "@pnp/sp/presets/all";
import "@pnp/sp/site-users/web";

interface CreateFolderProps {
  Currentbuttonclick: { [key: string]: string };
  onReturnToMain: () => void;
}

interface FolderItem {
  ID: number;
  SiteTitle: string;
  SiteID: string;
  FolderName?: string;
  DocumentLibraryName?: string;
  IsPrivate: boolean | null;
  IsLibrary: boolean;
  IsFolder: boolean;
  IsRename?: string;
  External?: boolean;
  FolderPath: string;
  Created: string;
}

const Testfile: React.FC<CreateFolderProps> = ({ Currentbuttonclick, onReturnToMain }) => {
  const sp: SPFI = getSP();
  const [folderItems, setFolderItems] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await sp.web.currentUser();
        const userGroups = await sp.web.siteUsers.getById(currentUser.Id).groups();
        const isSuperAdmin = userGroups.some((group: any) => group.Title === `DMSSuper_Admin`);

        const pageSize = 5000;
        let allPagedItems: any[] = [];

        let paged = await sp.web.lists
          .getByTitle("DMSFolderMaster")
          .items
          .select(
            "CurrentUser", "IsFolder", "FolderPath", "DocumentLibraryName",
            "SiteTitle", "ID", "IsPrivate", "IsLibrary", "FolderName", 
            "IsRename", "External", "IsActive", "Created"
          )
          .top(pageSize)
          .getPaged();

        allPagedItems.push(...paged.results);
        while (paged.hasNext) {
          paged = await paged.getNext();
          allPagedItems.push(...paged.results);
        }

        let filteredItems = isSuperAdmin
          ? allPagedItems.filter(item => item.IsActive === true)
          : allPagedItems.filter(item => item.IsActive === true && item.CurrentUser?.toLowerCase() === currentUser.Email.toLowerCase());

        filteredItems.sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime());

        const siteIdMap = new Map<string, string>();
        const siteIdData = await sp.web.lists.getByTitle("MasterSiteURL").items.select("Title", "SiteID").filter(`Active eq 'Yes'`)();
        siteIdData.forEach((site: any) => siteIdMap.set(site.Title, site.SiteID));

        const enrichedItems: FolderItem[] = filteredItems.map(item => ({
          ...item,
          SiteID: siteIdMap.get(item.SiteTitle) || null
        }));

        setFolderItems(enrichedItems);
      } catch (error) {
        console.error("Error loading folder items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleDropdown = (id: number) => {
    setOpenDropdown(prev => (prev === id ? null : id));
  };

  return (
    <div className="p-4 relative">
      <button onClick={onReturnToMain} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">Back</button>
      <h1 className="text-2xl font-semibold mb-4">My Created Folders</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Folder Name</th>
                <th className="border border-gray-300 px-4 py-2">Site Title</th>
                <th className="border border-gray-300 px-4 py-2">Folder Type</th>
                <th className="border border-gray-300 px-4 py-2">Privacy</th>
                <th className="border border-gray-300 px-4 py-2">Created Date</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {folderItems.map((item, idx) => {
                const folderName = item.IsRename || item.FolderName || item.DocumentLibraryName || "-";
                const folderType = item.IsLibrary ? "Root Folder" : item.IsFolder ? "Sub Folder" : "Unknown";
                let privacy = "-";
                if (item.IsPrivate === true) privacy = "Private";
                else if (item.IsPrivate === false) privacy = "Public";

                return (
                  <tr key={item.ID} className="hover:bg-gray-50 relative">
                    <td className="border border-gray-300 px-4 py-2">{folderName}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.SiteTitle}</td>
                    <td className="border border-gray-300 px-4 py-2">{folderType}</td>
                    <td className="border border-gray-300 px-4 py-2">{privacy}</td>
                    <td className="border border-gray-300 px-4 py-2">{new Date(item.Created).toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <div className="relative inline-block">
                        <button
                          onClick={() => toggleDropdown(item.ID)}
                          className="text-xl font-bold px-2 hover:bg-gray-200 rounded-full"
                        >
                          ⋯
                        </button>
                        {openDropdown === item.ID && (
                          <div className="absolute z-10 right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg">
                            <ul className="py-1 text-sm text-gray-700">
                              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Edit</li>
                              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Delete</li>
                              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">View Details</li>
                              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Permissions</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Testfile;
