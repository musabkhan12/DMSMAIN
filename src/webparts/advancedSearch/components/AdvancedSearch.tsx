import * as React from 'react';
import { useState, useEffect, useRef, useContext } from 'react';
import styles from './AdvancedSearch.module.scss';
import type { IAdvancedSearchProps } from './IAdvancedSearchProps';
import { escape } from '@microsoft/sp-lodash-subset';
import "bootstrap/dist/css/bootstrap.min.css";
import { GraphSearchHelper } from '../../../Shared/SearchHelper1';
import { BaseWebPartContext } from '@microsoft/sp-webpart-base';
import { IDocumentDisplayFields } from '../../dmsMusaib/components/DMSSearch/Interfaces';
import { ISearchHitResource } from '../../../Shared/SearchHelperInterfaces';
import HorizontalNavbar from "../../horizontalNavBar/components/HorizontalNavBar";
import { getSP } from "../loc/pnpjsConfig";
import { SPFI } from "@pnp/sp";
import VerticalSideBar from '../../verticalSideBar/components/VerticalSideBar';
import UserContext from "../../../GlobalContext/context";
import '../../../CustomCss/mainCustom.scss';
import { SearchAggregation } from '@microsoft/microsoft-graph-types';
// import { DateRangeFilter } from './DateRangeFilter';
import { DMSEntitySearchTreeView, enumfieldtype } from './DMSEntitySearchFilter';
import Provider from '../../../GlobalContext/provider';
// import { CheckedDropdownWithSearch } from './CheckedDropDown';
// import { DMSEntitySearchDropDowns } from './DMSEntitySearchDropDownFilter';
import TagsComponent from './SearchResultsTags';
import  './AdvancedSearch.scss';
import { FilterCheckBox } from './FilterCheckBoxes';
import TreeView from './EnitySearchtree';
import { DMSSearchFilterCheckedDropDown } from './DMSSearchFilterCheckedDropDown';
import { fieldnamesmapping, removeDuplicates } from './Common';
import {SearchResultsWithPagination,SearchResult} from './SearchResultsWithPagination';

export const getUrlParameter = (name: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

export interface IField {
    fieldname: string;
    fieldtype: enumfieldtype;
}

export enum enumPathType
{library, site}

const fieldsinit:IField[]=[{
    fieldname:'lastModifiedDateTime',
    fieldtype:enumfieldtype.DateTime,    
},{
    fieldname:'FileType',
    fieldtype:enumfieldtype.SingleLineofText
}];
const AdvancedSearch: React.FC<IAdvancedSearchProps> = (props) => {
    const sp: SPFI = getSP(props.context);
    const [searchText, setSearchText] = useState<string>('');
    // const [searchFilter, setSearchFilter] = useState<string>('');
    const [searchFilter, setSearchFilter] = useState<Map<string,string>>(new Map<string,string>());
    // const [searchPath, setSearchPath] = useState<string>(props.context.pageContext.site.absoluteUrl);
    const [searchPath, setSearchPath] = useState<string>("Path:"+props.context.pageContext.site.absoluteUrl);
    const [tsearchpaths, settSearchPath] = useState<Map<string,string[]>>();
    const [searchResult, setSearchResult] = useState<IDocumentDisplayFields[]>([]);
    const [searchQueryRefiners, setSearchQueryRefiners] = useState<string[]>([]);
    const [searchfields, setsearchfields] = useState<IField[]>(fieldsinit);
    const [searchRefiners, setSearchRefiners] = useState<SearchAggregation[]>([]);
    // const [searchRefinerFilters, setSearchRefinerFilters] = useState<string[]>([]);
    const [searchRefinerFilters, setSearchRefinerFilters] = useState<Map<string,string[]>>(new Map<string,string[]>());
    //const [startDate, setStartDate] = useState<string>('');
    const [startDate, setStartDate] = useState<Map<string,string>>(new Map<string,string>());
    //const [endDate, setEndDate] = useState<string>('');
    const [endDate, setEndDate] = useState<Map<string,string>>(new Map<string,string>());
    const elementRef = useRef<HTMLDivElement>(null);
    const useHide = useContext(UserContext);

    //let _searchpaths:string[]=[]; 
    //let _searchpaths:Map<string,string[]>=new Map<string,string[]>(); 
    let rootpath=window.location.origin;


    useEffect(() => {
        const searchQueryFromUrl = getUrlParameter("searchquery");
        const searchPathFromUrl = getUrlParameter("searchpath");
        const _searchQuery = searchQueryFromUrl ? decodeURIComponent(searchQueryFromUrl) : getSearchFilter();
        const _searchPath = searchPathFromUrl ? decodeURIComponent(searchPathFromUrl) : searchPath;
        settSearchPath(new Map<string,string[]>()); 
        // runSearch("permission",_searchQuery, _searchPath, searchQueryRefiners, getSearchRefineFiltersArray());
    }, []);

    const runSearch = async (searchText: string, searchFilters: string, searchPath: string, refiners: string[] = [], refinerfilters: string[] = []) => {
        let qyerytext = `${searchText} IsDocument:True ${searchFilters} ${searchPath}`;
        let graphcl = await (props.context as BaseWebPartContext).msGraphClientFactory.getClient("3");
        let mssearch = new GraphSearchHelper(graphcl);
        let hitcont = await mssearch.searchAll(qyerytext, 500, refiners, refinerfilters);
        const searchres = (hitcont.hits) ? hitcont.hits : []
        const results: Partial<ISearchHitResource>[] = (hitcont.hits) ? hitcont.hits.map((hit) => {
            const resource: Partial<ISearchHitResource> = hit.resource as ISearchHitResource;
            return resource;
        }) : [];
        let resultsdoc: IDocumentDisplayFields[] = searchres.map(filehit => {
            let file: Partial<ISearchHitResource> = filehit.resource;
            let tRes: IDocumentDisplayFields = { Title: file.name, Size: file.size, Extension: file.name.split('.').pop(), Path: file.webUrl, Summary: filehit.summary,Properties:file.listItem.fields }
            return tRes;
        });
        setSearchResult(removeDuplicates(resultsdoc,'Path'));
        setSearchRefiners(hitcont.aggregations);
    }

    const getSearchFilter=(searchFiltertemp?:Map<string,string>):string=>{
   
        if(!searchFiltertemp) searchFiltertemp=new Map([...searchFilter]);

        let refinefilter= (Array.from(searchFiltertemp.values()).length>0)?Array.from(searchFiltertemp.values()).join(" "):"";
        return refinefilter;  
    }

    const getSearchRefineFiltersArray=(searchRefinerFilterstemp?:Map<string,string[]>):string[]=>{
   
        if(!searchRefinerFilterstemp) searchRefinerFilterstemp=new Map([...searchRefinerFilters]);
        let refinefilterarray=
        Array.from(searchRefinerFilterstemp.entries()).map(([key, value]) => {
            return (value.length>1)?`${key}:or(${value.join(',')})`:`${key}:${value}`;
          });
        return refinefilterarray;  
    }

    const searchClickHandler: React.MouseEventHandler = (ev) => {
        ev.preventDefault();
        runSearch(searchText, getSearchFilter(), searchPath, searchQueryRefiners, getSearchRefineFiltersArray());
    }

    const searchTextChangeHandler: React.ChangeEventHandler = (ev) => {
        setSearchText((ev.target as HTMLInputElement).value);
    }

    const handleDateTimeFilter = (filter: string) => {

        // setSearchFilter(searchFilter+" "+filter);
        // runSearch(searchText, filter, searchPath, searchQueryRefiners, getSearchRefineFiltersArray());
    }

    const GetFieldType = (fieldname: string) => {
        try{
            console.log('fieldname',fieldname);
            console.log('searchfields',searchfields);
            return searchfields.filter(f => f.fieldname.toLowerCase() == fieldname.toLowerCase())[0].fieldtype;
        }
        catch(ex)
        {
            
            console.log("error",ex);
        }
    }
    

    const handleCheckboxChange = (refinerName: string, value: string, checked: boolean) => {
        console.log(refinerName);
    
        setSearchRefinerFilters((prevFilters) => {
            // Create a new Map to preserve immutability
            const updatedFilters = new Map([...prevFilters]);
    
            if (checked) {
                // If the checkbox is checked, add the value
                if (updatedFilters.has(refinerName)) {
                    const existingValues = [...(updatedFilters.get(refinerName) || [])];
                    updatedFilters.set(refinerName, [...existingValues, value]);
                } else {
                    updatedFilters.set(refinerName, [value]);
                }
            } else {
                // If the checkbox is unchecked, remove the value
                const existingValues = [...(updatedFilters.get(refinerName) || [])];
                const filteredValues = existingValues.filter((v) => v !== value);
    
                if (filteredValues.length > 0) {
                    updatedFilters.set(refinerName, filteredValues);
                } else {
                    updatedFilters.delete(refinerName);
                }
            }
    
            return updatedFilters;
        });
    };
    

    // Generate filter query based on input
    const generateFilter = (datefield: string,startdt?:string,enddt?:string): string => {
        let stdate=(startdt)?startdt:startDate.get(datefield);
        let enddate=(enddt)?enddt:endDate.get(datefield);
        if (stdate && enddate) {
            // return `LastModifiedTime:Range(${startDate}..${endDate})`;
            return `${datefield}>=${stdate} AND ${datefield}<=${enddate}`;
        } else if (stdate) {
            return `${datefield}>=${stdate}`;
        } else if (enddate) {
            return `${datefield}<=${enddate}`;
        }
        return '';
    };

    const handleDateFilterChange = (datefield: string) => {
        // let filter = '';
        // if (startDate && endDate) {
        //     filter = `LastModifiedTime:Range(${startDate}..${endDate})`;
        // } else if (startDate) {
        //     filter = `LastModifiedTime>=${startDate}`;
        // } else if (endDate) {
        //     filter = `LastModifiedTime<=${endDate}`;
        // }

        // onFilterChange(filter); // Pass filter to parent
        // const filter = generateFilter(datefield);
        // setSearchFilter(filter);
        // runSearch(searchText, filter, searchPath, searchQueryRefiners, getSearchRefineFiltersArray());
    };

    const handleApply = (datefield: string) => {
        // const filter = generateFilter(datefield);
        // let newfilter = searchFilter +" "+filter;
        // setSearchFilter(newfilter);
        //runSearch(searchText, filter, searchPath, searchQueryRefiners, searchRefinerFilters);
    };

    const handleApplyFilters = () => {
        // const filter = generateFilter(datefield);
        // setSearchFilter(filter);
        // runSearch(searchText, filter, searchPath, searchQueryRefiners, searchRefinerFilters);

        runSearch(searchText, getSearchFilter(), searchPath, searchQueryRefiners, getSearchRefineFiltersArray());
    };

    const GetStat=()=>{
        return Array.from(searchRefinerFilters.keys()).length;
    }

    const ClearFilter=(filterfield:string)=>{

        const updatedFilters = new Map([...searchFilter]);
        updatedFilters.delete(filterfield);
        setSearchFilter(updatedFilters);
        runSearch(searchText, getSearchFilter(updatedFilters), searchPath, searchQueryRefiners, getSearchRefineFiltersArray());

    }

    const ClearRefinerFilter=(filterfield:string)=>{

        const updatedFilters = new Map([...searchRefinerFilters]);
        updatedFilters.delete(filterfield);
        setSearchRefinerFilters(updatedFilters);
        runSearch(searchText, getSearchFilter(), searchPath, searchQueryRefiners, getSearchRefineFiltersArray(updatedFilters));

    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            console.log("Enter key pressed. Current value:", event.currentTarget.value);
            runSearch(searchText, getSearchFilter(), searchPath, searchQueryRefiners, getSearchRefineFiltersArray());
            
        }
    };

    // const  UpdatedSearchPaths=(allpath:{selepath:string,typeofpath:enumPathType}[])=>
    // {
    //     allpath.forEach(a=>{        
    //         let patht;
    //         if(a.typeofpath==enumPathType.library) patht=rootpath+a.selepath;
    //         else patht=a.selepath
    //         _searchpaths.push(path);            
    //     });
    //     _searchpaths=getDeepestPaths(_searchpaths);
    //     let updatedpath=_searchpaths.map(d=>"path:"+d).join(' ');
    //     setSearchPath(updatedpath);
    //     return updatedpath;
    // }

    const getUpdatedSearchPath=(_srchpaths?:Map<string,string[]>)=>{

        let allpaths:string[]=[];
        let _searchpaths:Map<string,string[]>;
        if(_srchpaths) _searchpaths=_srchpaths;
        else _searchpaths=new Map([...tsearchpaths]);
       
        Array.from(_searchpaths.keys()).forEach(s=>{
            if(_searchpaths.get(s).length==0)
            {
                allpaths.push(s);
            }
            else
            {
                allpaths=allpaths.concat(_searchpaths.get(s));
            }
        })

        let updatedpath=(allpaths.length>0)?allpaths.map(d=>"path:"+d).join(' '):("path:"+props.context.pageContext.site.absoluteUrl);
        setSearchPath(updatedpath);
        return updatedpath;

    }

    const getDeepestPaths=(paths: string[]): string[]=> {
        const getDepth = (path: string): number => {
            // Remove the protocol and domain, if present, and count the segments
            const cleanedPath = path.replace(/^https?:\/\/[^/]+/, "");
            return cleanedPath.split("/").filter(Boolean).length;
        };
    
        const groupedByRoot: Record<string, string[]> = {};
    
        // Group paths by their root (protocol + domain)
        paths.forEach((path) => {
            const root = path.match(/^https?:\/\/[^/]+/)?.[0] || ""; // Extract root
            if (!groupedByRoot[root]) {
                groupedByRoot[root] = [];
            }
            groupedByRoot[root].push(path);
        });
    
        const deepestPaths: string[] = [];
    
        // Find the deepest path in each group
        Object.values(groupedByRoot).forEach((group) => {
            let maxDepth = 0;
            let deepestGroup: string[] = [];
    
            group.forEach((path) => {
                const depth = getDepth(path);
                if (depth > maxDepth) {
                    maxDepth = depth;
                    deepestGroup = [path];
                } else if (depth === maxDepth) {
                    deepestGroup.push(path);
                }
            });
    
            deepestPaths.push(...deepestGroup);
        });
    
        return deepestPaths;
    }

    return (
        <div id="wrapper" ref={elementRef}>
            <div className="app-menu" id="myHeader">
                <VerticalSideBar _context={sp} />
            </div>

            <div className="content-page">
                <HorizontalNavbar _context={sp} siteUrl={props.siteUrl} />
                <div className="content" style={{ marginLeft: `${!useHide ? '80px' : '230px'}`, marginTop: '1.5rem' }}>
                    <section className='container-fluid'>
                        <div className='row'>
                            <header className="p-3 pb-0 col-12">
                                {/* <h1 style={{fontSize:'20px', fontWeight:'600'}} className='text-dark'>Search</h1> */}
                                <form>
                                    <div className="input-group">
                                        <input style={{ padding: '.75rem .75rem' }} type="text" className="form-control" placeholder="Search Files.." onChange={searchTextChangeHandler} onKeyDown={handleKeyPress} />
                                        <button style={{ fontSize: '1rem' }} className="btn btn-primary" type="button" onClick={searchClickHandler}>Advance Search</button>
                                    </div>
                                </form>
                            </header>

                            <main className="mt-3 p-3 pb-0 col-12">
                                <div className='row mt-3'>
                                    <section className='col-3'>
                                        
                                        <DMSSearchFilterCheckedDropDown context={props.context} 
                                        
                                        onMultiFieldSelect={selfields => {
                                            let selfld = [...searchQueryRefiners];
                                            // console.log('fieldtype', fldtype);
                                            // selfld.push(selfields.map(s=>s.field));
                                            selfld=selfld.concat(selfields.map(s=>s.field));

                                            setSearchQueryRefiners(selfld);
                                            let flds = [...searchfields];
                                            // flds.push({ fieldname: fld, fieldtype: fldtype });
                                            flds=flds.concat(selfields.map(s=>({fieldname:s.field,fieldtype:s.fieldtype})));
                                            setsearchfields(flds);
                                            runSearch(searchText, getSearchFilter(), searchPath, selfld, getSearchRefineFiltersArray());
                                        }} 
                                        
                                        // onMultiFieldSelect={selfields => {
                                        //     let selfld = [...searchQueryRefiners];
                                        //     let flds = [...searchfields];
                                        
                                        //     // Extract fields and field objects from selfields
                                        //     const selectedFields = selfields.map(s => s.field);
                                        //     const selectedFieldObjects = selfields.map(s => ({ fieldname: s.field, fieldtype: s.fieldtype }));
                                        
                                        //     // Add new fields to searchQueryRefiners
                                        //     selfld = selfld.filter(field => selectedFields.includes(field));
                                        //     selfld = selfld.concat(selectedFields.filter(field => !selfld.includes(field)));
                                        
                                        //     // Add new field objects to searchfields
                                        //     flds = flds.filter(fld => selectedFields.includes(fld.fieldname));
                                        //     flds = flds.concat(selectedFieldObjects.filter(fld => !flds.some(existingFld => existingFld.fieldname === fld.fieldname)));
                                        
                                        //     setSearchQueryRefiners(selfld);
                                        //     setsearchfields(flds);
                                        //     runSearch(searchText, getSearchFilter(), searchPath, selfld, getSearchRefineFiltersArray());
                                        // }}

                                        onSiteSelect={(sites)=>{
                                          console.log("Selected istes",sites)
                                          let _searchpaths=new Map([...tsearchpaths]);
                                          
                                          sites.forEach(s=>{
                                             if(!_searchpaths.has(s.SiteURL))//if(!allkeys.some(s1=>s.SiteURL.toLowerCase()==s1.toLowerCase()))
                                             {
                                                _searchpaths.set(s.SiteURL,[]);
                                             }
                                          })
                                          let allkeys=Array.from(_searchpaths.keys());
                                          let siteurls=Array.from(sites.map(s=>s.SiteURL));
                                          allkeys.forEach(s=>{
                                            if(!siteurls.some(p=>p==s))//if(!allkeys.some(s1=>s.SiteURL.toLowerCase()==s1.toLowerCase()))
                                            {
                                               _searchpaths.delete(s);
                                            }
                                          })

                                          settSearchPath(_searchpaths);

                                          let newserachpath=getUpdatedSearchPath(_searchpaths);//UpdatedSearchPaths(s.map(s1=>({selepath:s1.SiteURL,typeofpath:enumPathType.site })))
                                          runSearch(searchText, getSearchFilter(), newserachpath, searchfields.map(sf=>sf.fieldname), getSearchRefineFiltersArray());

                                        }} 
                                        
                                        onLibrarySelect={(libs)=>{
                                            let _searchpaths=new Map([...tsearchpaths]);
                                            let allkeys=Array.from(_searchpaths.keys());
                                            
                                            libs.forEach(l=>{
                                                let liburl=rootpath+l.FolderPath;
                                                let libsite= allkeys.find(a=>liburl.toLowerCase().startsWith(a.toLowerCase()))
                                                if(libsite)
                                                    {
                                                        let oldlibs= _searchpaths.get(libsite);
                                                        if(!oldlibs.some(s=>s==liburl)) oldlibs.push(liburl);
                                                        _searchpaths.set(libsite,oldlibs);
                                                    }
                                            })

                                           let alllibpaths= libs.map(l=>rootpath+l.FolderPath);
                                            allkeys.forEach(k=>{
                                               let tlibs= _searchpaths.get(k);   
                                               let newtlib=tlibs;                                         
                                               tlibs.forEach(tlib=>{
                                                 if(!alllibpaths.some(al=>al==tlib))
                                                 {
                                                    newtlib.splice(newtlib.indexOf(tlib));
                                                 }

                                               })
                                               _searchpaths.set(k,newtlib);
                                            })
                                            
                                            settSearchPath(_searchpaths);
                                            let newserachpath=getUpdatedSearchPath(_searchpaths);//UpdatedSearchPaths(s.map(s1=>({selepath:s1.FolderPath,typeofpath:enumPathType.library })))
                                            runSearch(searchText, getSearchFilter(), newserachpath, searchfields.map(sf=>sf.fieldname), getSearchRefineFiltersArray());

                                        }}/>
                                        <div>
                                            <h5 className='font-16 text-dark p-3 pt-0 mb-3'>Refiners</h5>
                                            <div className='row'>
                                                {searchRefiners?.map(refiner => (
                                                    <div key={refiner.field} className="card col-12 mb-3 pt-2">
                                                        <h6>{(fieldnamesmapping[refiner.field])?fieldnamesmapping[refiner.field]:refiner.field}</h6>

                                                        <div className="form-check">
                                                            {
                                                                (GetFieldType(refiner.field) == enumfieldtype.DateTime) ?
                                                                    (<div className='col-10'>
                                                                        <div className='col'><label htmlFor="startDate" className="form-label mb-0 mt-2">Start Date</label></div>
                                                                        <div className="col">
                                                                        <input
                                                                            type="date"
                                                                            id="startDate"
                                                                            className="form-control"
                                                                            value={startDate.get(refiner.field) || ""}
                                                                            onChange={(e) => {
                                                                                // Create a new Map to ensure immutability
                                                                                const updatedStartDate = new Map([...startDate]);
                                                                                updatedStartDate.set(refiner.field, e.target.value);
                                                                                setStartDate(updatedStartDate);
                                                                                let dtfilter=generateFilter(refiner.field,e.target.value);

                                                                                const updatedSearchFilter = new Map([...searchFilter]);
                                                                                updatedSearchFilter.set(refiner.field, dtfilter);
                                                                                setSearchFilter(updatedSearchFilter);
                                                                                // handleFilterChange();
                                                                            }}
                                                                        />
                                                                            
                                                                        </div>
                                                                        <div className="col">  <label htmlFor="endDate" className="form-label mb-0 mt-2">End Date</label> </div>
                                                                        <div className="col">

                                                                        <input
                                                                            type="date"
                                                                            id="endDate"
                                                                            className="form-control"
                                                                            value={endDate.get(refiner.field) || ""}
                                                                            onChange={(e) => {
                                                                                // Create a new Map to ensure immutability
                                                                                const updatedEndDate = new Map([...endDate]);
                                                                                updatedEndDate.set(refiner.field, e.target.value);
                                                                                setEndDate(updatedEndDate);
                                                                                let dtfilter=generateFilter(refiner.field,null,e.target.value);

                                                                                const updatedSearchFilter = new Map([...searchFilter]);
                                                                                updatedSearchFilter.set(refiner.field, dtfilter);
                                                                                setSearchFilter(updatedSearchFilter);
                                                                            }}
                                                                        />
                                                                        </div>
                                                                        <div className="col mt-1">
                                                                            <button type='button' className="btn btn-primary float-end" onClick={() => ClearFilter(refiner.field)}>
                                                                                Clear
                                                                            </button>
                                                                        </div>
                                                                    </div>)
                                                                    :
                                                                    <>
                                                                    <FilterCheckBox refiner={refiner} handleCheckboxChange={handleCheckboxChange} searchRefinerFilters={searchRefinerFilters} />
                                                                    <div className="col mt-1">
                                                                        <button type='button' className="btn btn-primary float-end" onClick={() => ClearRefinerFilter(refiner.field)}>
                                                                            Clear
                                                                        </button>
                                                                    </div>
                                                                    </>
                                                                    
                                                                            
                                                            }
                                                        </div>
                                                    </div>
                                                ))}
                                                {(searchRefiners.length>0)?<div className="col">
                                                    <button type='button' className="btn btn-primary" onClick={() => handleApplyFilters()}>
                                                        Apply Filters
                                                    </button>
                                                </div>:<></>}
                                            </div>
                                        </div>
                                    </section>
                                    <section style={{ background: "#fff", border: '1px solid #1fb0e5', borderRadius: '20px' }} className="col-9">
                                        {/* {searchResult.map(res => (
                                            <div className="col mt-1 mb-1 search-result">
                                                <div className="card h-100">
                                                    <div className="card-body">
                                                        <h5 className="card-title">{res.Title}</h5>
                                                        <p className="card-text">{res.Summary}</p>
                                                    </div>
                                                    <TagsComponent tags={Object.entries(res.Properties).map(([key, value]) =>`${fieldnamesmapping[key]?fieldnamesmapping[key]:key}: ${value}` )}/>
                                                </div>
                                            </div>
                                            // <div>{res.Title}</div>
                                        ))} */}
                                        {

                                        (searchResult && searchResult.length>0)?<SearchResultsWithPagination searchResult={searchResult.map(s=>({Title:s.Title,Summary:s.Summary,Properties:s.Properties} as SearchResult))} fieldnamesmapping={fieldnamesmapping} />:<div>No Results</div>
                                        
                                        }
                                    </section>
                                </div>
                            </main>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

const DMSMain: React.FC<IAdvancedSearchProps> = (props) => {
    return (
        <Provider>
            <AdvancedSearch {...props} />
        </Provider>
    );
}

export default DMSMain;
