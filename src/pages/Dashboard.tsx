import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Copy, 
  Trash2,
  BarChart3,
  Users,
  FileText,
  Calendar
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { blink } from '../blink/client'

interface Form {
  id: string
  title: string
  description: string
  status: 'draft' | 'published'
  responses: number
  views: number
  createdAt: string
  updatedAt: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (!state.user && !state.isLoading) {
        navigate('/')
        return
      }
      setUser(state.user)
      if (state.user) {
        loadForms()
      }
    })
    return unsubscribe
  }, [navigate])

  const loadForms = async () => {
    try {
      setLoading(true)
      // Mock data for now - will be replaced with actual database calls
      const mockForms: Form[] = [
        {
          id: '1',
          title: 'Contact Form',
          description: 'Get in touch with potential customers',
          status: 'published',
          responses: 24,
          views: 156,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-16'
        },
        {
          id: '2',
          title: 'Customer Feedback Survey',
          description: 'Collect feedback from our users',
          status: 'draft',
          responses: 0,
          views: 0,
          createdAt: '2024-01-14',
          updatedAt: '2024-01-14'
        },
        {
          id: '3',
          title: 'Event Registration',
          description: 'Register for our upcoming webinar',
          status: 'published',
          responses: 87,
          views: 234,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-12'
        }
      ]
      setForms(mockForms)
    } catch (error) {
      console.error('Error loading forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateForm = () => {
    navigate('/builder')
  }

  const handleEditForm = (formId: string) => {
    navigate(`/builder/${formId}`)
  }

  const handleViewForm = (formId: string) => {
    navigate(`/preview/${formId}`)
  }

  const handleViewResponses = (formId: string) => {
    navigate(`/responses/${formId}`)
  }

  const handleLogout = () => {
    blink.auth.logout('/')
  }

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalResponses = forms.reduce((sum, form) => sum + form.responses, 0)
  const totalViews = forms.reduce((sum, form) => sum + form.views, 0)
  const publishedForms = forms.filter(form => form.status === 'published').length

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">FormBuilder</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
            <Button variant="ghost" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forms.length}</div>
              <p className="text-xs text-muted-foreground">
                {publishedForms} published
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalResponses}</div>
              <p className="text-xs text-muted-foreground">
                Across all forms
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews}</div>
              <p className="text-xs text-muted-foreground">
                Form impressions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalViews > 0 ? Math.round((totalResponses / totalViews) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Response rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Forms Section */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">My Forms</h2>
                <p className="text-gray-600">Create and manage your forms</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search forms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button onClick={handleCreateForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Form
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredForms.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? 'No forms found' : 'No forms yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Get started by creating your first form'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreateForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Form
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredForms.map((form) => (
                  <Card key={form.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{form.title}</h3>
                            <Badge variant={form.status === 'published' ? 'default' : 'secondary'}>
                              {form.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-4">{form.description}</p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {form.responses} responses
                            </div>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {form.views} views
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Updated {new Date(form.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewForm(form.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditForm(form.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewResponses(form.id)}>
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Responses
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}