import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Checkbox } from '../components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { ArrowLeft, Send, Eye, Code, Share2, Settings } from 'lucide-react'
import { blink } from '../blink/client'

interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number' | 'url' | 'file'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface FormData {
  id?: string
  title: string
  description: string
  fields: FormField[]
}

export default function FormPreview() {
  const navigate = useNavigate()
  const { formId } = useParams()
  const [formData, setFormData] = useState<FormData | null>(null)
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const loadForm = async () => {
      try {
        setLoading(true)
        // Mock data for now - will be replaced with actual database calls
        const mockForm: FormData = {
          id: formId,
          title: 'Contact Form',
          description: 'Get in touch with us and we\'ll get back to you as soon as possible.',
          fields: [
            {
              id: '1',
              type: 'text',
              label: 'Full Name',
              placeholder: 'Enter your full name',
              required: true
            },
            {
              id: '2',
              type: 'email',
              label: 'Email Address',
              placeholder: 'Enter your email address',
              required: true
            },
            {
              id: '3',
              type: 'phone',
              label: 'Phone Number',
              placeholder: 'Enter your phone number',
              required: false
            },
            {
              id: '4',
              type: 'select',
              label: 'How did you hear about us?',
              required: false,
              options: ['Google Search', 'Social Media', 'Friend Referral', 'Advertisement', 'Other']
            },
            {
              id: '5',
              type: 'radio',
              label: 'Preferred Contact Method',
              required: true,
              options: ['Email', 'Phone', 'Text Message']
            },
            {
              id: '6',
              type: 'checkbox',
              label: 'Services Interested In',
              required: false,
              options: ['Web Development', 'Mobile App Development', 'UI/UX Design', 'Consulting']
            },
            {
              id: '7',
              type: 'textarea',
              label: 'Message',
              placeholder: 'Tell us about your project or inquiry...',
              required: true
            }
          ]
        }
        setFormData(mockForm)
      } catch (error) {
        console.error('Error loading form:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadForm()
  }, [formId])

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    // Validate required fields
    const missingFields = formData.fields
      .filter(field => field.required)
      .filter(field => !formValues[field.id] || (Array.isArray(formValues[field.id]) && formValues[field.id].length === 0))

    if (missingFields.length > 0) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      // Mock submission - will be replaced with actual database calls
      console.log('Form submission:', formValues)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('There was an error submitting the form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formValues[field.id]

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
      case 'number':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        )

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            rows={4}
          />
        )

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        )

      case 'select':
        return (
          <Select value={value || ''} onValueChange={(val) => handleInputChange(field.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'radio':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={(val) => handleInputChange(field.id, val)}
          >
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'checkbox': {
        const checkboxValues = value || []
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${index}`}
                  checked={checkboxValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleInputChange(field.id, [...checkboxValues, option])
                    } else {
                      handleInputChange(field.id, checkboxValues.filter((v: string) => v !== option))
                    }
                  }}
                />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        )
      }

      case 'file':
        return (
          <Input
            type="file"
            onChange={(e) => handleInputChange(field.id, e.target.files?.[0])}
            required={field.required}
          />
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Form not found</h2>
            <p className="text-gray-600 mb-4">The form you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Thank you!</h2>
            <p className="text-gray-600 mb-4">Your form has been submitted successfully. We'll get back to you soon.</p>
            <Button onClick={() => window.location.reload()}>
              Submit Another Response
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - only show if user is authenticated */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="font-semibold">{formData.title}</h1>
              <p className="text-sm text-gray-500">Form Preview</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Code className="w-4 h-4 mr-2" />
              Embed
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/builder/${formId}`)}>
              <Settings className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{formData.title}</CardTitle>
              {formData.description && (
                <p className="text-gray-600">{formData.description}</p>
              )}
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {formData.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
                
                <div className="pt-4">
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Form
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}