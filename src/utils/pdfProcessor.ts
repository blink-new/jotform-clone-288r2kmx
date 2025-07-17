import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox, PDFButton, PDFSignature } from 'pdf-lib';
import { FormField } from '../types/FormField';

export class PDFProcessor {
  private pdfDoc: PDFDocument | null = null;
  private form: PDFForm | null = null;

  async loadPDF(file: File): Promise<{ success: boolean; error?: string }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      this.pdfDoc = await PDFDocument.load(arrayBuffer);
      this.form = this.pdfDoc.getForm();
      return { success: true };
    } catch (error) {
      console.error('Error loading PDF:', error);
      return { success: false, error: 'Failed to load PDF. Please ensure it\'s a valid PDF file.' };
    }
  }

  extractFormFields(): FormField[] {
    if (!this.form) return [];

    const fields: FormField[] = [];
    const formFields = this.form.getFields();

    formFields.forEach((field, index) => {
      const fieldName = field.getName();
      const fieldType = this.getFieldType(field);
      
      if (fieldType) {
        fields.push({
          id: `field_${index}`,
          name: fieldName,
          type: fieldType,
          label: this.formatFieldLabel(fieldName),
          value: this.getFieldValue(field),
          required: false, // PDF doesn't have required field info
          options: fieldType === 'radio' ? this.getFieldOptions(field) : undefined
        });
      }
    });

    return fields;
  }

  private getFieldType(field: any): FormField['type'] | null {
    if (field instanceof PDFTextField) {
      return 'text';
    } else if (field instanceof PDFCheckBox) {
      return 'checkbox';
    } else if (field instanceof PDFButton) {
      // Radio buttons are also PDFButton instances
      const fieldDict = field.acroField.dict;
      const flags = fieldDict.get('Ff')?.asNumber() || 0;
      const isRadio = (flags & (1 << 15)) !== 0; // Radio button flag
      return isRadio ? 'radio' : 'button';
    } else if (field instanceof PDFSignature) {
      return 'signature';
    }
    return null;
  }

  private getFieldValue(field: any): string | boolean | string[] {
    try {
      if (field instanceof PDFTextField) {
        return field.getText() || '';
      } else if (field instanceof PDFCheckBox) {
        return field.isChecked();
      } else if (field instanceof PDFButton) {
        // Handle radio buttons
        const fieldDict = field.acroField.dict;
        const flags = fieldDict.get('Ff')?.asNumber() || 0;
        const isRadio = (flags & (1 << 15)) !== 0;
        if (isRadio) {
          return field.isSelected() ? 'selected' : '';
        }
      }
    } catch (error) {
      console.error('Error getting field value:', error);
    }
    return '';
  }

  private getFieldOptions(field: any): string[] {
    // For radio buttons, extract available options
    try {
      if (field instanceof PDFButton) {
        const fieldDict = field.acroField.dict;
        const kids = fieldDict.get('Kids');
        if (kids && kids.asArray) {
          return kids.asArray().map((kid, index) => `Option ${index + 1}`);
        }
      }
    } catch (error) {
      console.error('Error getting field options:', error);
    }
    return [];
  }

  private formatFieldLabel(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  }

  async fillFormFields(formFields: FormField[]): Promise<{ success: boolean; error?: string }> {
    if (!this.form) {
      return { success: false, error: 'No PDF form loaded' };
    }

    try {
      for (const field of formFields) {
        const pdfField = this.form.getField(field.name);
        
        if (pdfField instanceof PDFTextField) {
          pdfField.setText(field.value as string);
        } else if (pdfField instanceof PDFCheckBox) {
          if (field.value as boolean) {
            pdfField.check();
          } else {
            pdfField.uncheck();
          }
        } else if (pdfField instanceof PDFButton) {
          // Handle radio buttons
          if (field.type === 'radio' && field.value) {
            pdfField.select();
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error filling form fields:', error);
      return { success: false, error: 'Failed to fill form fields' };
    }
  }

  async generateFilledPDF(): Promise<{ success: boolean; pdfBytes?: Uint8Array; error?: string }> {
    if (!this.pdfDoc) {
      return { success: false, error: 'No PDF document loaded' };
    }

    try {
      // Flatten the form to make it non-editable
      if (this.form) {
        this.form.flatten();
      }

      const pdfBytes = await this.pdfDoc.save();
      return { success: true, pdfBytes };
    } catch (error) {
      console.error('Error generating filled PDF:', error);
      return { success: false, error: 'Failed to generate filled PDF' };
    }
  }

  async getPageCount(): Promise<number> {
    if (!this.pdfDoc) return 0;
    return this.pdfDoc.getPageCount();
  }

  cleanup(): void {
    this.pdfDoc = null;
    this.form = null;
  }
}

export const pdfProcessor = new PDFProcessor();