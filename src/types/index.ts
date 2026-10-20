export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'tel'
  | 'url'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[]; // for select, radio, checkbox
  defaultValue?: string | string[];
}

export interface FormSettings {
  maxSubmissions?: number;
  closeDate?: string;
  isClosed?: boolean;
  isOpen?: boolean;
  closeMessage?: string;
  redirectUrl?: string;
  notificationEmail?: string;
  accentColor?: string;
}

export interface Form {
  id: string;
  slug: string;
  hash: string; // Unique alphanumeric public hash, e.g. "f7x9a2" for forms.buildwithrex.me/{hash}
  title: string;
  description: string;
  category?: string;
  isPublished: boolean;
  fields: FormField[];
  themeColor?: string;
  submitButtonText?: string;
  successMessage?: string;
  settings?: FormSettings;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'selected'
  | 'rejected';

export interface FormSubmission {
  id: string;
  formId: string;
  submittedAt: string;
  status: ApplicationStatus;
  followUpNotes?: string;
  data: Record<string, any>; // fieldId -> value
}

export interface FormStats {
  formId: string;
  totalSubmissions: number;
  statusCounts: Record<ApplicationStatus, number>;
  lastSubmittedAt?: string;
}
