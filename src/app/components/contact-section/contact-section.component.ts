import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslocoPipe],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.scss'
})
export class ContactSectionComponent {
  contactForm: FormGroup;
  status: 'idle' | 'loading' | 'success' | 'error' = 'idle';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      emailConfirm: ['', [Validators.required]],
      projectType: ['', Validators.required],
      otherDetails: [''],
      budget: ['', Validators.required],
      message: ['', Validators.required],
      consent: [false, Validators.requiredTrue]
    }, { validators: this.emailMatchValidator });

    // Gestion de la validation dynamique pour 'Other'
    this.contactForm.get('projectType')?.valueChanges.subscribe(value => {
      const otherDetailsControl = this.contactForm.get('otherDetails');
      if (value === 'Other') {
        otherDetailsControl?.setValidators([Validators.required]);
      } else {
        otherDetailsControl?.clearValidators();
      }
      otherDetailsControl?.updateValueAndValidity();
    });
  }

  emailMatchValidator(group: FormGroup) {
    const email = group.get('email')?.value;
    const emailConfirm = group.get('emailConfirm')?.value;
    return email === emailConfirm ? null : { emailMismatch: true };
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.status = 'loading';

    // Formspree requires headers: Accept: application/json
    this.http.post(environment.formspreeEndpoint, this.contactForm.value, {
      headers: { 'Accept': 'application/json' }
    }).subscribe({
      next: () => {
        this.status = 'success';
        this.contactForm.reset();
        // Resetting consent to false explicitly just in case
        this.contactForm.patchValue({ consent: false });
      },
      error: () => {
        this.status = 'error';
      }
    });
  }
}
