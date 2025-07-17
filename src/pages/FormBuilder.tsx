import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { 
  Save, 
  Eye, 
  Settings, 
  ArrowLeft,
  Type,
  Mail,
  Phone,
  Calendar,
  CheckSquare,
  Circle,
  List,
  FileText,
  Star,
  Hash,
  Link,
  Upload,
  Trash2,
  GripVertical
} from 'lucide-react'
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

const fieldTypes = [
  { type: 'text', label: 'Text Input', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'textarea', label: 'Long Text', icon: FileText },
  { type: 'select', label: 'Dropdown', icon: List },
  { type: 'radio', label: 'Multiple Choice', icon: Circle },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'url', label: 'Website URL', icon: Link },
  { type: 'file', label: 'File Upload', icon: Upload }
]

export default function FormBuilder() {
  const navigate = useNavigate()
  const { formId } = useParams()
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState<FormData>({
    title: 'Untitled Form',
    description: '',
    fields: []
  })
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (!state.user && !state.isLoading) {
        navigate('/')
        return
      }
      setUser(state.user)
      if (state.user && formId) {
        loadForm(formId)
      }
    })
    return unsubscribe
  }, [navigate, formId])

  const loadForm = async (id: string) => {
    try {
      // Mock data for now - will be replaced with actual database calls
      const mockForm: FormData = {
        id,
        title: 'Contact Form',
        description: 'Get in touch with us',
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
            placeholder: 'Enter your email',
            required: true
          }
        ]
      }
      setFormData(mockForm)
    } catch (error) {
      console.error('Error loading form:', error)
    }
  }

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: `${fieldTypes.find(ft => ft.type === type)?.label} Field`,
      placeholder: '',
      required: false,
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2'] : undefined
    }
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
    setSelectedField(newField.id)
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const deleteField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
    if (selectedField === fieldId) {
      setSelectedField(null)
    }
  }

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    setFormData(prev => {
      const fields = [...prev.fields]
      const index = fields.findIndex(f => f.id === fieldId)
      if (index === -1) return prev
      
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= fields.length) return prev
      
      const temp = fields[index];
      fields[index] = fields[newIndex];
      fields[newIndex] = temp;
      return { ...prev, fields }
    })
  }

  const saveForm = async () => {
    try {
      setSaving(true)
      // Mock save - will be replaced with actual database calls
      console.log('Saving form:', formData)
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error saving form:', error)
    } finally {
      setSaving(false)
    }
  }

  const previewForm = () => {
    navigate(`/preview/${formData.id || 'new'}`)
  }

  const selectedFieldData = formData.fields.find(f => f.id === selectedField)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <p className="text-sm text-gray-500">Form Builder</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={previewForm}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={saveForm} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Field Types */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Add Fields</h3>
            <div className="space-y-2">
              {fieldTypes.map((fieldType) => (
                <button
                  key={fieldType.type}
                  onClick={() => addField(fieldType.type)}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <fieldType.icon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">{fieldType.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Form Builder */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-8">
            {/* Form Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="form-title">Form Title</Label>
                    <Input
                      id="form-title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="text-lg font-semibold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="form-description">Description (Optional)</Label>
                    <Textarea
                      id="form-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this form is for..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Fields */}
            <div className="space-y-4">
              {formData.fields.map((field, index) => (
                <Card 
                  key={field.id} 
                  className={`cursor-pointer transition-all ${
                    selectedField === field.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedField(field.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex flex-col items-center space-y-1 mt-1">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        <span className="text-xs text-gray-400">{index + 1}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Label className="font-medium">{field.label}</Label>
                          {field.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                        </div>
                        
                        {/* Field Preview */}
                        {(field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'url' || field.type === 'number') ? (
                          <Input placeholder={field.placeholder} disabled />
                        ) : field.type === 'textarea' ? (
                          <Textarea placeholder={field.placeholder} disabled />
                        ) : field.type === 'select' ? (
                          <select className="w-full p-2 border rounded-md bg-gray-50" disabled>
                            <option>Select an option...</option>
                            {field.options?.map((option, i) => (
                              <option key={i}>{option}</option>
                            ))}
                          </select>
                        ) : field.type === 'radio' ? (
                          <div className="space-y-2">
                            {field.options?.map((option, i) => (
                              <div key={i} className="flex items-center space-x-2">
                                <input type="radio" disabled />
                                <span className="text-sm">{option}</span>
                              </div>
                            ))}
                          </div>
                        ) : field.type === 'checkbox' ? (
                          <div className="space-y-2">
                            {field.options?.map((option, i) => (
                              <div key={i} className="flex items-center space-x-2">
                                <input type="checkbox" disabled />
                                <span className="text-sm">{option}</span>
                              </div>
                            ))}
                          </div>
                        ) : field.type === 'date' ? (
                          <Input type="date" disabled />
                        ) : field.type === 'file' ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                            <Upload className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm">Click to upload or drag and drop</span>
                          </div>
                        ) : null}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteField(field.id)
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {formData.fields.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <Type className="w-12 h-12 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No fields yet</h3>
                      <p>Add fields from the sidebar to start building your form</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Field Settings */}
        {selectedFieldData && (
          <div className="w-80 bg-white border-l overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Field Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="field-label">Label</Label>
                  <Input
                    id="field-label"
                    value={selectedFieldData.label}
                    onChange={(e) => updateField(selectedField!, { label: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="field-placeholder">Placeholder</Label>
                  <Input
                    id="field-placeholder"
                    value={selectedFieldData.placeholder || ''}
                    onChange={(e) => updateField(selectedField!, { placeholder: e.target.value })}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="field-required"
                    checked={selectedFieldData.required}
                    onChange={(e) => updateField(selectedField!, { required: e.target.checked })}
                  />
                  <Label htmlFor="field-required">Required field</Label>
                </div>
                
                {(selectedFieldData.type === 'select' || selectedFieldData.type === 'radio' || selectedFieldData.type === 'checkbox') && (
                  <div>
                    <Label>Options</Label>
                    <div className="space-y-2 mt-2">
                      {selectedFieldData.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(selectedFieldData.options || [])]
                              newOptions[index] = e.target.value
                              updateField(selectedField!, { options: newOptions })
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newOptions = selectedFieldData.options?.filter((_, i) => i !== index)
                              updateField(selectedField!, { options: newOptions })
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = [...(selectedFieldData.options || []), `Option ${(selectedFieldData.options?.length || 0) + 1}`];
                          updateField(selectedField!, { options: newOptions });
                        }}
                      >
                        Add Option
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}