import * as React from 'react';
import { IEditProps } from './IEditProps';
import { IEditState } from './IEditState';
import { getSP } from "../../loc/pnpjsConfig";
import { SPFI , spfi} from "@pnp/sp";
// import { getSP } from "../PNPJsConfig";
import { Caching } from "@pnp/queryable";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
// import { SPFI, spfi } from "@pnp/sp";
import { PrimaryButton ,TextField} from '@fluentui/react';
import { Field, Textarea } from "@fluentui/react-components";
import Swal from 'sweetalert2';
import styles from '../AuditApp.module.scss';
//import { useHistory } from 'react-router-dom';
export class EditComponent extends React.Component<IEditProps,IEditState> {
        _sp: SPFI;
    constructor (props : any, state:  IEditState){
        super(props);
         this._sp = getSP();
       this.state={
        reqId:'',
        title: '',
  processName: '',
  requestedBy:'',
  requestedDate: '',
  status: '',
  remarks:'',
        // itemId:props["match"]["params"]["postId"],
        items:[],
        listItemId:0
       }
       //var itemId=this.props["match"]["params"]["id"];
       this.getAllItems=this.getAllItems.bind(this);
       this.approveRequest= this.approveRequest.bind(this);
       this.rejectRequest = this.rejectRequest.bind(this);
       this.reworkRequest= this.reworkRequest.bind(this);
       this.cancelRequest=this.cancelRequest.bind(this);
       this.getVersionHistory = this.getVersionHistory.bind(this);
       this.onRemarksChange= this.onRemarksChange.bind(this);
      }
 
      async componentDidMount(){
        await this.getAllItems();
        await this.getVersionHistory();
      }
    public render(): React.ReactElement<IEditProps> {   
    //  const history = useHistory();
     //   history.push('/listing');
    
      var allItems = this.state.items.map((item: any,i:number) => {
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
            {item.ActionTakenBy.Title}
            </td>
            <td>
            { new Date(item.ActionTakenOn).getDate()+"/" +new Date(item.ActionTakenOn).getMonth()+"/"+ new Date(item.ActionTakenOn).getFullYear()}                    
            </td>
            <td>
            {item.Status}
            </td>
          </tr> 
           )    
         
      });

    return (
        <section>
              <TextField label="Request Id"   id="sub"  value={this.state.reqId} disabled={true} />
              <TextField label="Title"   id="title"  value={this.state.title}  disabled={true}/>
              <TextField label="Process Name"   id="process"  value={this.state.processName} disabled={true}/>
              <TextField label="Requested By"   id="reqBy"  value={this.state.requestedBy} disabled={true}/>
              <TextField label="Requested Date"   id="reqDate"  value={this.state.requestedDate}  disabled={true}/>
              <TextField label="Status"   id="Status"  value={this.state.status} disabled={true}/>
              <Field label="Remarks">
    <Textarea id="comm" value={this.state.remarks} onChange={this.onRemarksChange} />
  </Field>
             <PrimaryButton onClick={this.approveRequest}>Approve</PrimaryButton>
              <PrimaryButton onClick={this.rejectRequest}>Reject</PrimaryButton>
               <PrimaryButton onClick={this.reworkRequest}>Rework</PrimaryButton>
               <a href='#/listing'> <PrimaryButton onClick={this.cancelRequest}>Cancel</PrimaryButton></a>

                <section id='audit'>
                  <label>Audit Trial</label>
                  <table>
                    <thead>
                      <tr>
                      <th>Sl No</th>
                        <th>Request Id</th>
                        <th>Title</th>
                        <th>Process Name</th>
                        <th>Action Taken By</th>
                        <th>Action Taken On</th>this.cancelR
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
{allItems}
                    </tbody>
                  </table>
                </section>
        </section>
    )};
 private async getAllItems(){

   // alert(this.state.itemId);
  //  const spCache = spfi(this._sp).using(Caching({store:"session"}));
 //   const user = await spCache.web.ensureUser(this.props.userid);            select('Id,RequesterNameId,RequestId,Title,ProcessName,RequesterName/Title,Status,AssignedToId,RequestedDate').expand('RequesterName')
    const listItems = await spfi(this._sp).web.lists.getByTitle("ProcessApprovalList").items.select('Id,ListItemId,RequesterNameId,RequestId,Title,ProcessName,RequesterName/Title,Status,AssignedToId,RequestedDate').expand('RequesterName').filter("Id eq '"+277+"'")();
    //const user = await spCache.web.ensureUser(listItems.RequesterNameId);
    this.setState({reqId: listItems[0].RequestId});
   this.setState({title: listItems[0].Title});
   this.setState({processName: listItems[0].ProcessName}); 
   var req='';
   if(listItems[0].RequestedDate !=''){
req = new Date(listItems[0].RequestedDate).getDate()+"/"+new Date(listItems[0].RequestedDate).getMonth()+"/"+new Date(listItems[0].RequestedDate).getFullYear();
   }  
   this.setState({requestedDate: req});
   this.setState({status: listItems[0].Status});
   if(listItems[0].RequesterNameId != ''){
    this.setState({requestedBy: listItems[0].RequesterName.Title});
   }
 
   this.setState({listItemId: listItems[0].ListItemId})
    }

    private async getVersionHistory(){
      // const spCache = spfi(this._sp).using(Caching({store:"session"}));
 //   const user = await spCache.web.ensureUser(this.props.userid);
    const listItems = await spfi(this._sp).web.lists.getByTitle("ProcessApprovalList").items.select('Id,RequestId,Title,ProcessName,ActionTakenBy/Title,ActionTakenOn,Status,RequestedDate,ListItemId').expand('ActionTakenBy').filter("ListItemId eq '"+277+"' and Status ne 'Pending'")();
    //const user = await spCache.web.ensureUser(listItems.RequesterNameId);
    this.setState({items:listItems});
    if(listItems.length==0){
      document.getElementById('audit')?.classList.add(styles.none);
    }
    }
    private async approveRequest(){
        // const spCache = spfi(this._sp).using(Caching({store:"session"}));
        const user = await spfi(this._sp).web.ensureUser(this.props.userid);
        spfi(this._sp).web.lists.getByTitle("ProcessApprovalList").items.getById(277).update({
            Status: "Approved",
            ActionTakenById:user.data.Id,
            ActionTakenOn:new Date(),
            Remark:this.state.remarks,
          });
          Swal.fire({title:"Approved succesfully",icon:"success"});
    }
    private async rejectRequest(){
        // const spCache = spfi(this._sp).using(Caching({store:"session"}));
        const user = await spfi(this._sp).web.ensureUser(this.props.userid);
        spfi(this._sp).web.lists.getByTitle("ProcessApprovalList").items.getById(277).update({
          Status: "Rejected",
            ActionTakenById:user.data.Id,
            ActionTakenOn:new Date(),
            Remark:this.state.remarks,
          });
           Swal.fire({title:"Rejected successfully",icon:"success"});
    }
    private async reworkRequest(){
      // const spCache = spfi(this._sp).using(Caching({store:"session"}));
      const user = await spfi(this._sp).web.ensureUser(this.props.userid);
      spfi(this._sp).web.lists.getByTitle("ProcessApprovalList").items.getById(277).update({
        Status: "Rework",
          ActionTakenById:user.data.Id,
          ActionTakenOn:new Date(),
          Remark:this.state.remarks,
        });
         Swal.fire({title:"Rework successfull",icon:"success"});
    }
    private onRemarksChange(event:any){
      this.setState({remarks:event.target.value});
    }
    private cancelRequest(){
    //  history.go(1);
    
    }
    
}