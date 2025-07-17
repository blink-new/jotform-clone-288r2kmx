import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  FileText, 
  Zap, 
  Users, 
  BarChart3, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react'
import { blink } from '../blink/client'

export default function LandingPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = async () => {
    setIsLoading(true)
    try {
      await blink.auth.login('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: FileText,
      title: 'Drag & Drop Builder',
      description: 'Create beautiful forms with our intuitive drag-and-drop interface'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Build and deploy forms in minutes, not hours'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with your team on form creation and management'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Get insights into form performance and user behavior'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for your forms and data'
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Forms that look great on any device'
    }
  ]

  const templates = [
    { name: 'Contact Form', category: 'Business', popular: true },
    { name: 'Survey Form', category: 'Research', popular: false },
    { name: 'Registration Form', category: 'Events', popular: true },
    { name: 'Feedback Form', category: 'Customer Service', popular: false },
    { name: 'Order Form', category: 'E-commerce', popular: true },
    { name: 'Application Form', category: 'HR', popular: false }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">FormBuilder</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#templates" className="text-sm font-medium hover:text-primary transition-colors">Templates</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleGetStarted}>Sign In</Button>
            <Button onClick={handleGetStarted} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Get Started'}
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-indigo-50">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20">
            ✨ New: AI-powered form suggestions
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Build Beautiful Forms
            <br />
            <span className="text-primary">In Minutes</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create professional forms with our drag-and-drop builder. 
            Collect responses, analyze data, and grow your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={handleGetStarted} disabled={isLoading} className="text-lg px-8 py-6">
              {isLoading ? 'Loading...' : 'Start Building for Free'}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Free forever plan
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Setup in 2 minutes
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to build forms</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features that make form building simple and efficient
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-0 bg-white/50 backdrop-blur">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Start with a template</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from hundreds of professionally designed templates
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                    {template.popular && (
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs ml-1">Popular</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {template.name}
                  </h3>
                  <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              View All Templates
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of businesses using FormBuilder to create amazing forms
          </p>
          <Button size="lg" variant="secondary" onClick={handleGetStarted} disabled={isLoading} className="text-lg px-8 py-6">
            {isLoading ? 'Loading...' : 'Start Building Now'}
            {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">FormBuilder</span>
              </div>
              <p className="text-gray-400">
                The easiest way to create beautiful, professional forms.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FormBuilder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}