export interface IEditState
 {  
 
  reqId:string, 
  title: string,
  processName: string,
  requestedBy:string,
  requestedDate: string,
  status: string,
  remarks: string,
  // itemId:number,
  items:any[],
  listItemId: number
}