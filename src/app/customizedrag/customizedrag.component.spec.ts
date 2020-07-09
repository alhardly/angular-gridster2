import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizedragComponent } from './customizedrag.component';

describe('CustomizedragComponent', () => {
  let component: CustomizedragComponent;
  let fixture: ComponentFixture<CustomizedragComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomizedragComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomizedragComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
