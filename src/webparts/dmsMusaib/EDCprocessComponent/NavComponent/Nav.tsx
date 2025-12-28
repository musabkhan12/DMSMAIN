import * as React from 'react';
import type { INavProps } from './INavProps';
import { INavLinkGroup, Nav } from 'office-ui-fabric-react';


const group:INavLinkGroup[]=[{
  links:[
   { name:"FormComponent", url:"#/form"},
   { name:"ListingComponent", url:"#/listing"},
   {name:"EditComponent",url:"#/edit"}
  ]
}];
export class Navigation extends React.Component<INavProps> {
  public render(): React.ReactElement<INavProps> {   
   


    return <Nav groups={group}></Nav>

    
  }
 

}
