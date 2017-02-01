import { Component } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";

@Component({
    selector: 'prompt-modal',
    template: `<div class="modal-content">
                   <div class="modal-header">
                     <h5 class="modal-title">{{title || 'Prompt'}}</h5>
                     <button type="button" class="close" (click)="close()" >&times;</button>
                   </div>
                   <div class="modal-body">
                    <label>{{question}}</label><input type="text" class="form-control" [(ngModel)]="message" name="name" >
                   </div>
                   <div class="modal-footer">
                     <button class="button" (click)="apply()">OK</button>
                     <button class="button btn-disabled" (click)="close()" >Cancel</button>
                   </div>
                 </div>`
})

export class PromptModalComponent extends DialogComponent {
    message: string = '';
    constructor(dialogService: DialogService) {
        super(dialogService);
    }
    apply() {
        this.result = this.message;
        this.close();
    }
}
