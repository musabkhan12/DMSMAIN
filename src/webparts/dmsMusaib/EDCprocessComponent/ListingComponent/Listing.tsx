import * as React from 'react';
import { IListingProps } from './IListingProps';
import { IListingState } from './IListingState';
import { Profiles } from "@pnp/sp/profiles";
// import { getSP } from "../PNPJsConfig";
import { getSP } from "../../loc/pnpjsConfig";
//import { Caching } from "@pnp/queryable";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { SPFI, spfi } from "@pnp/sp";
import { EditComponent } from '../EditComponent/EditComponent';
export class Listing extends React.Component<IListingProps,IListingState> {
      private _sp: SPFI;
    constructor (props : IListingProps, state:  IListingState){
        super(props);
         this._sp = getSP();
       this.state={
        items:[],
        showform:false
       }
       this.getAllItems=this.getAllItems.bind(this);
       this.editItem = this.editItem.bind(this);
      }
 
      async componentDidMount(){
        await this.getAllItems();
      }

      private editItem(item: any) {
        console.log("Editing item:", item);
        this.setState({ showform: true });
        alert(this.state.showform + "showform");
      }
    public render(): React.ReactElement<IListingProps> {   
        var showform = this.state.showform;
        alert(this.state.showform + "showform");
        var allItems = this.state.items.map((item: any,i:number) => {
            var path='#/approve/'+item.MainListId+'/'+item.Id;
            alert(item.RequestId + "item.RequestId");
            return(
              <tr>
                <td>
                {i+1}
                </td>
                <td>
                    {item.RequestId}                  
                </td>
                <td>
                    {item.Title}
                </td>
                <td>
                    {item.ProcessName}
                </td>
                <td>
                {item.ReqName}
                </td>
                <td>
                {item.ReqDt}                    
                </td>
                <td>
                {item.Status}
                </td>
                <td>
                <a href={path} onClick={() => this.editItem(item)}>Edit</a>
               
                </td>
              </tr> 
               )    
             
          });
       
    return (
    
        <div>
        {showform ? 
        <div>
        <EditComponent userid={this.props.userid} context={this.props.context} />
        </div>
        : 
        <section>
        <table id="tabAllItems">
            <thead>
                <tr>
                    <th>Sl No</th>
                    <th>Request Id</th>
                    <th>Title</th>
                    <th>Process Name</th>
                    <th>Requested By</th>
                    <th>Requested Date</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
            {allItems}
            </tbody>

        </table>
    </section>
        }


        </div>
    
    )};



 private async getAllItems(){
    var _self= this;
   // const spCache = spfi(this._sp).using(Caching({store:"session"}));
   console.log(this.props.userid , "this.props.userid ");

    // const user = await spfi(this._sp).web.ensureUser(this.props.userid);
    // console.log(user.data.Id, "user.data.Id");
    const listItems = await spfi(this._sp).web.lists.getByTitle("ProcessApprovalList").items.select('Id,RequesterNameId,RequestId,Title,ProcessName,ApprovalLevelListItemId,RequesterName/Title,Status,AssignedToId,RequestedDate,AssignedToId,ListItemId').expand('RequesterName').filter("AssignedToId eq '"+String(this.props.userid)+"' and Status eq 'Pending'")();
     console.log(listItems, "listItems in list");
  
    var allItems: any[]=[];
    listItems.forEach( function(itm){
    // var itemId = await spCache.web.lists.getByTitle("AllProcessApprovalLevelList").items.select('Id,MainListID').filter("Id eq '"+itm.ApprovalLevelListItemId+"'")();

    if(itm.RequesterNameId != "")
    {
        itm["ReqName"]= itm.RequesterName.Title;
    }
    else{
        itm["ReqName"]='';
    }
    if(itm.RequestedDate !=''){
        itm["ReqDt"] = new Date(itm.RequestedDate).getDate()+"/"+new Date(itm.RequestedDate).getMonth()+"/"+new Date(itm.RequestedDate).getFullYear();
 
    }
    else{
        itm["ReqDt"] ='';
    }
    itm["MainListId"]= itm.ListItemId;
   // var item= itemId[0].MainListID;
  //  itm["MainListId"]=item;
    allItems.push(itm);
    _self.setState({items: allItems});
   })
  

    }

} 