// Simple 'focus' Directive
import {Directive, Input, ElementRef, Inject} from '@angular/core';

@Directive({
    selector: '[focus]'
})
export class FocusDirective {
    @Input()
    focus:boolean;
    constructor(private element: ElementRef) {}
    protected ngOnChanges() {
        this.element.nativeElement.focus();
    }
}