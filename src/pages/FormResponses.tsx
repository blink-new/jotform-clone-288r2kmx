import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  Trash2,
  MoreVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { blink } from '../blink/client'

interface FormResponse {
  id: string
  submittedAt: string
  data: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

interface FormData {
  id: string
  title: string
  description: string
  fields: Array<{
    id: string
    label: string
    type: string
  }>
}

export default function FormResponses() {
  const navigate = useNavigate()
  const { formId } = useParams()
  const [formData, setFormData] = useState<FormData | null>(null)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadFormAndResponses()
  }, [formId, loadFormAndResponses])

  const loadFormAndResponses = useCallback(async () => {
    try {
      setLoading(true)
      
      // Mock data for now - will be replaced with actual database calls
      const mockForm: FormData = {
        id: formId!,
        title: 'Contact Form',
        description: 'Get in touch with us',
        fields: [
          { id: '1', label: 'Full Name', type: 'text' },
          { id: '2', label: 'Email Address', type: 'email' },
          { id: '3', label: 'Phone Number', type: 'phone' },
          { id: '4', label: 'How did you hear about us?', type: 'select' },
          { id: '5', label: 'Preferred Contact Method', type: 'radio' },
          { id: '6', label: 'Services Interested In', type: 'checkbox' },
          { id: '7', label: 'Message', type: 'textarea' }
        ]
      }

      const mockResponses: FormResponse[] = [
        {
          id: '1',
          submittedAt: '2024-01-16T10:30:00Z',
          data: {
            '1': 'John Smith',
            '2': 'john.smith@email.com',
            '3': '+1 (555) 123-4567',
            '4': 'Google Search',
            '5': 'Email',
            '6': ['Web Development', 'UI/UX Design'],
            '7': 'I need help building a new website for my business. Looking for modern design and good user experience.'
          }
        },
        {
          id: '2',
          submittedAt: '2024-01-16T14:15:00Z',
          data: {
            '1': 'Sarah Johnson',
            '2': 'sarah.j@company.com',
            '3': '+1 (555) 987-6543',
            '4': 'Friend Referral',
            '5': 'Phone',
            '6': ['Mobile App Development'],
            '7': 'We need a mobile app for our restaurant. Something simple for ordering and reservations.'
          }
        },
        {
          id: '3',
          submittedAt: '2024-01-15T16:45:00Z',
          data: {
            '1': 'Mike Chen',
            '2': 'mike.chen@startup.io',
            '3': '',
            '4': 'Social Media',
            '5': 'Email',
            '6': ['Web Development', 'Mobile App Development', 'Consulting'],
            '7': 'Looking for a technical partner for our startup. Need full-stack development and technical consulting.'
          }
        }
      ]

      setFormData(mockForm)
      setResponses(mockResponses)
    } catch (error) {
      console.error('Error loading form and responses:', error)
    } finally {
      setLoading(false)
    }
  }, [formId])

  const exportToCSV = () => {
    if (!formData || responses.length === 0) return

    // Create CSV headers
    const headers = ['Submitted At', ...formData.fields.map(field => field.label)]
    
    // Create CSV rows
    const rows = responses.map(response => [
      new Date(response.submittedAt).toLocaleString(),
      ...formData.fields.map(field => {
        const value = response.data[field.id]
        if (Array.isArray(value)) {
          return value.join(', ')
        }
        return value || ''
      })
    ])

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${formData.title.replace(/[^a-zA-Z0-9]/g, '_')}_responses.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const deleteResponse = (responseId: string) => {
    if (confirm('Are you sure you want to delete this response?')) {
      setResponses(prev => prev.filter(r => r.id !== responseId))
    }
  }

  const filteredResponses = responses.filter(response => {
    if (!searchQuery) return true
    
    return formData?.fields.some(field => {
      const value = response.data[field.id]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchQuery.toLowerCase())
      }
      if (Array.isArray(value)) {
        return value.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
      }
      return false
    })
  })

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
            <p className="text-gray-600 mb-4">The form you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
              <p className="text-sm text-gray-500">Form Responses</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => navigate(`/preview/${formId}`)}>
              <Eye className="w-4 h-4 mr-2" />
              View Form
            </Button>
            <Button onClick={exportToCSV} disabled={responses.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responses.length}</div>
              <p className="text-xs text-muted-foreground">
                All time submissions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {responses.filter(r => {
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return new Date(r.submittedAt) > weekAgo
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Recent submissions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">
                Form completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Responses Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Form Responses</CardTitle>
                <p className="text-sm text-gray-600">View and manage form submissions</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search responses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredResponses.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? 'No responses found' : 'No responses yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Responses will appear here once people start submitting your form'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate(`/preview/${formId}`)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Form
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submitted</TableHead>
                      {formData.fields.slice(0, 4).map((field) => (
                        <TableHead key={field.id}>{field.label}</TableHead>
                      ))}
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResponses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(response.submittedAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(response.submittedAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        {formData.fields.slice(0, 4).map((field) => (
                          <TableCell key={field.id}>
                            <div className="max-w-xs truncate">
                              {Array.isArray(response.data[field.id]) 
                                ? response.data[field.id].join(', ')
                                : response.data[field.id] || '-'
                              }
                            </div>
                          </TableCell>
                        ))}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => deleteResponse(response.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}