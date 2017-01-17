import { ActivatedRoute, Data } from '@angular/router';
import { Component } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';

// Load the implementations that should be tested
import { BenefitsTableComponent } from './benefits-table.component';

describe('BenefitsTable', () => {
  // provide our implementations or mocks to the dependency injector
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      // provide a better mock
      {
        provide: ActivatedRoute,
        useValue: {
          data: {
            subscribe: (fn: (value: Data) => void) => fn({
              yourData: 'yolo'
            })
          }
        }
      },
      BenefitsTableComponent
    ]
  }));

  it('should log ngOnInit', inject([BenefitsTableComponent], (benefitsTable: BenefitsTableComponent) => {
    spyOn(console, 'log');
    expect(console.log).not.toHaveBeenCalled();

    benefitsTable.ngOnInit();
    expect(console.log).toHaveBeenCalled();
  }));

});
