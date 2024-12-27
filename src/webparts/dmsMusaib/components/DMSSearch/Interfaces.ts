export enum ResultsViewMode
{
   Grid,Table
}

export interface IDocumentDisplayFields
{
   Title?:string;
   Size?:number;
   FileStatus?:string;
   Extension?:string;
   Created?:Date;
   Modified?:Date;
   CreatedBy?:any;
   ModifiedBy?:any;
   Path?:string;
   Summary?:string;
   UniqueId?:string;

}
export interface IDMSResultsGridProps
{
   results?:IDocumentDisplayFields[];
   ViewMode?:ResultsViewMode; 
}