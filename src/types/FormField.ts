export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'signature' | 'button';
  label: string;
  value: string | boolean | string[];
  required: boolean;
  options?: string[];
}