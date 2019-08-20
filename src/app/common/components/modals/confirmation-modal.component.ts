import { Component } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";

@Component({
  selector: 'confirm-modal',
  template: `<div class="modal-content">
                   <div class="modal-header">
                     <h5 class="modal-title"  [attr.dir]="rightJustify ? 'rtl' : 'ltr'">{{title || 'Confirm'}}</h5>
                     <button type="button" class="close" (click)="close()" >&times;</button>
                   </div>
                   <div class="modal-body" [attr.dir]="rightJustify ? 'rtl' : 'ltr'" *ngIf="message">
                     <p [class.text-right]="rightJustify">{{message}}</p>
                   </div>
                   <div class="modal-footer" [class.text-right]="hideCancel">
                     <button class="button" [style.width.%]="hideCancel ? 50 : 100" (click)="confirm()">{{okText || 'OK'}}</button>
                     <button *ngIf="!hideCancel" class="button btn-disabled" (click)="close()" >Cancel</button>
                   </div>
                 </div>`
})
  
export class ConfirmModalComponent extends DialogComponent {
  constructor(dialogService: DialogService) {
    super(dialogService);
  }
  confirm() {
    // on click on confirm button we set dialog result as true,
    // then we can get dialog result from caller code
    this.result = true;
    this.close();
  }
}
