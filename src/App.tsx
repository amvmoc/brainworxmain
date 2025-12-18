import { Brain, Users, Target, Zap, MessageSquare, ArrowRight, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { GetStartedOptions } from './components/GetStartedOptions';
import { FranchiseLogin } from './components/FranchiseLogin';
import { LoginModal } from './components/LoginModal';
import { FranchiseDashboard } from './components/FranchiseDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { EmailVerification } from './components/EmailVerification';
import { SampleAnalysisDemo } from './components/SampleAnalysisDemo';
import NeuralImprintPatterns from './components/NeuralImprintPatterns';
import { SelfAssessmentsPage } from './components/SelfAssessmentsPage';
import { DisclaimerPage } from './components/DisclaimerPage';
import { Library } from './components/Library';
import { PublicBookingPage } from './components/PublicBookingPage';
import { PublicResultsView } from './components/PublicResultsView';
import NIP3Assessment from './components/NIP3Assessment';
import { supabase } from './lib/supabase';

function App() {
  const MAINTENANCE_MODE = false;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);
  const [showSampleAnalysis, setShowSampleAnalysis] = useState(false);
  const [showNeuralPatterns, setShowNeuralPatterns] = useState(false);
  const [showSelfAssessments, setShowSelfAssessments] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showNIP3, setShowNIP3] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [franchiseData, setFranchiseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [franchiseCode, setFranchiseCode] = useState<string | null>(null);
  const [bookingFranchiseCode, setBookingFranchiseCode] = useState<string | null>(null);
  const [preselectedPaymentType, setPreselectedPaymentType] = useState<'tcf' | 'tadhd' | 'pcadhd' | 'nipa' | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);

  useEffect(() => {
    const currentPath = window.location.pathname;

    // Check for NIP3 route
    if (currentPath === '/nip3' || currentPath === '/nip3/') {
      setShowNIP3(true);
      setLoading(false);
      return;
    }

    const resultsMatch = currentPath.match(/\/results\/([a-f0-9-]+)/);

    if (resultsMatch && resultsMatch[1]) {
      setShareToken(resultsMatch[1]);
      setLoading(false);
      return;
    }

    // Check for booking link with path-based routing
    const bookingMatch = currentPath.match(/\/book\/([a-zA-Z0-9]+)/);
    if (bookingMatch && bookingMatch[1]) {
      setBookingFranchiseCode(bookingMatch[1]);
      setShowBooking(true);
      setLoading(false);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get('verify_token');
    const fhCode = urlParams.get('fh');
    const coupon = urlParams.get('coupon');
    const bookCode = urlParams.get('book');

    if (fhCode) {
      setFranchiseCode(fhCode);
      sessionStorage.setItem('franchise_code', fhCode);
    } else {
      const savedCode = sessionStorage.getItem('franchise_code');
      if (savedCode) {
        setFranchiseCode(savedCode);
      }
    }

    if (bookCode) {
      setBookingFranchiseCode(bookCode);
      setShowBooking(true);
      setLoading(false);
      return;
    }

    if (coupon) {
      setCouponCode(coupon);
      setShowGetStarted(true);
    }

    if (verifyToken) {
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        loadFranchiseData(session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const loadFranchiseData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('franchise_owners')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading franchise data:', error);
      }

      setFranchiseData(data);
    } catch (err) {
      console.error('Unexpected error loading franchise data:', err);
    } finally {
      setLoading(false);
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const verifyToken = urlParams.get('verify_token');

  if (shareToken) {
    return <PublicResultsView shareToken={shareToken} />;
  }

  if (MAINTENANCE_MODE) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2A5E] to-[#3DB3E3] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="mb-8">
            <div className="inline-block bg-yellow-100 rounded-full p-6 mb-6">
              <svg className="w-16 h-16 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-[#0A2A5E] mb-4">Not Available at Present</h1>
            <p className="text-xl text-gray-600 mb-6">
              The BrainWorx platform is temporarily unavailable.
            </p>
            <div className="bg-[#E6E9EF] rounded-xl p-6 mb-6">
              <p className="text-lg text-[#0A2A5E] font-semibold mb-2">
                Service Temporarily Unavailable
              </p>
              <p className="text-gray-600">
                Please check back soon.
              </p>
            </div>
            <div className="text-gray-500 text-sm">
              <p>Thank you for your patience.</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <img src="/THE REAL PNG LOGO.png" alt="BrainWorx" className="h-11 mx-auto opacity-50" />
          </div>
        </div>
      </div>
    );
  }

  if (verifyToken) {
    return <EmailVerification token={verifyToken} />;
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // CRITICAL: Don't show admin dashboards if user is in public flow (coupon, get started, assessments)
  const isInPublicFlow = showGetStarted || showSelfAssessments || showNeuralPatterns || showBooking || showNIP3 || couponCode;

  if (currentUser && franchiseData && !isInPublicFlow) {
    if (franchiseData.is_super_admin) {
      return (
        <SuperAdminDashboard
          franchiseOwnerId={currentUser.id}
          franchiseOwnerName={franchiseData.name}
          onLogout={() => {
            supabase.auth.signOut();
            setCurrentUser(null);
            setFranchiseData(null);
          }}
        />
      );
    }

    return (
      <FranchiseDashboard
        franchiseOwnerId={currentUser.id}
        franchiseOwnerCode={franchiseData.unique_link_code}
        franchiseOwnerName={franchiseData.name}
        franchiseOwnerEmail={franchiseData.email}
        isSuperAdmin={franchiseData.is_super_admin}
        onLogout={() => {
          supabase.auth.signOut();
          setCurrentUser(null);
          setFranchiseData(null);
        }}
      />
    );
  }

  if (currentUser && !franchiseData && !isInPublicFlow) {
    return <FranchiseLogin
      onLoginSuccess={() => window.location.reload()}
      onClose={async () => {
        await supabase.auth.signOut();
        window.location.reload();
      }}
    />;
  }

  const services = [
    {
      icon: Brain,
      title: 'Cognitive Transformation',
      description: 'Unlock your brain\'s full potential through neuroplasticity-based programs and cutting-edge methodologies.',
      color: 'from-[#0A2A5E] to-[#3DB3E3]'
    },
    {
      icon: Users,
      title: 'Leadership Development',
      description: 'Transform into a responsive, adaptive leader with our comprehensive leadership training programs.',
      color: 'from-[#3DB3E3] to-[#1FAFA3]'
    },
    {
      icon: Target,
      title: 'Organizational Intelligence',
      description: 'Elevate your organization\'s collective intelligence and foster a culture of innovation and growth.',
      color: 'from-[#1FAFA3] to-[#0A2A5E]'
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'Maximize human potential through scientifically-proven strategies for peak performance.',
      color: 'from-[#E6E9EF] to-[#3DB3E3]'
    }
  ];

  const programs = [
    {
      title: 'Executive Transformation Program',
      duration: '12 Weeks',
      description: 'Intensive leadership development for C-suite executives and senior leaders.'
    },
    {
      title: 'Team Intelligence Workshops',
      duration: '3 Days',
      description: 'Interactive sessions designed to enhance team cohesion and collective intelligence.'
    },
    {
      title: 'Individual Coaching Sessions',
      duration: 'Ongoing',
      description: 'Personalized one-on-one coaching to unlock your unique potential.'
    },
    {
      title: 'Youth Development Camp',
      duration: '5 Days',
      description: 'Transform young minds through experiential learning and cognitive training.'
    }
  ];

  if (showBooking && bookingFranchiseCode) {
    return (
      <PublicBookingPage
        franchiseCode={bookingFranchiseCode}
        onBack={() => {
          setShowBooking(false);
          setBookingFranchiseCode(null);
          window.history.pushState({}, '', window.location.pathname);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/THE REAL PNG LOGO.png" alt="Brainworx" className="h-11 w-auto" />
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium">Home</a>
              <a href="#services" className="text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium">Services</a>
              <a href="#programs" className="text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium">Programs</a>
              <button
                onClick={() => setShowNeuralPatterns(true)}
                className="text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium"
              >
                Neural Patterns
              </button>
              <button
                onClick={() => setShowSelfAssessments(true)}
                className="text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium"
              >
                Self Assessment
              </button>
              <button
                onClick={() => setShowLibrary(true)}
                className="text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium"
              >
                Library
              </button>
              <a href="#about" className="text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium">About</a>
              <button
                onClick={() => setShowDisclaimer(true)}
                className="text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium"
              >
                Disclaimers
              </button>
              <button
                onClick={() => setShowGetStarted(true)}
                className="bg-[#3DB3E3] text-white px-6 py-2 rounded-full hover:bg-[#1FAFA3] transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-[#0A2A5E] text-white px-6 py-2 rounded-full hover:bg-[#3DB3E3] transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Login
              </button>
            </div>

            <button
              className="md:hidden text-[#0A2A5E]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <a href="#home" className="block text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium">Home</a>
              <a href="#services" className="block text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium">Services</a>
              <a href="#programs" className="block text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium">Programs</a>
              <button
                onClick={() => setShowNeuralPatterns(true)}
                className="block text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium text-left"
              >
                Neural Patterns
              </button>
              <button
                onClick={() => setShowSelfAssessments(true)}
                className="block text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium text-left"
              >
                Self Assessment
              </button>
              <button
                onClick={() => setShowLibrary(true)}
                className="block text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium text-left"
              >
                Library
              </button>
              <a href="#about" className="block text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium">About</a>
              <button
                onClick={() => setShowDisclaimer(true)}
                className="block text-[#0A2A5E] hover:text-[#3DB3E3] transition-colors font-medium text-left"
              >
                Disclaimers
              </button>
              <button
                onClick={() => setShowGetStarted(true)}
                className="block bg-[#3DB3E3] text-white px-6 py-2 rounded-full text-center w-full"
              >
                Get Started
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="block bg-[#0A2A5E] text-white px-6 py-2 rounded-full text-center w-full"
              >
                Login
              </button>
            </div>
          )}
        </nav>
      </header>

      <main>
        <section id="home" className="pt-32 pb-20 px-6 bg-gradient-to-br from-[#E6E9EF] via-white to-[#E6E9EF]">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8 items-start mb-8">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-[#0A2A5E] leading-tight">
                  We All Have Patterns.
                  <span className="block bg-gradient-to-r from-[#3DB3E3] to-[#1FAFA3] bg-clip-text text-transparent">
                    Let's Understand Yours.
                  </span>
                </h2>
              </div>
              <div className="relative">
                <div className="relative z-10">
                  <img
                    src="/THE REAL PNG LOGO.png"
                    alt="Brain Transformation"
                    className="w-full max-w-xs mx-auto drop-shadow-2xl"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#3DB3E3]/20 to-[#1FAFA3]/20 blur-3xl rounded-full"></div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="text-lg text-gray-700 leading-relaxed space-y-4">
                <p>
                  Life can feel overwhelming when you don't understand why you think or behave the way you do. At Brainworx, we've created a space where curiosity meets clarity—a place to explore the questions you've been carrying without judgment.
                </p>
                <p>
                  Through Neural Imprint Pattern Assessment (NIPA), we help you identify the invisible threads that shape your thoughts, emotions, relationships, and reactions. We're not therapists or psychologists—we're passionate advocates for self-awareness who believe everyone deserves a place to start. A mirror to see yourself clearly. A language to describe what you've always felt but couldn't name.
                </p>
                <p>
                  Our assessments provide tangible insights that open doors to deeper conversations with professionals, loved ones, or yourself. Sometimes the hardest part isn't solving the problem; it's knowing where to start looking.
                </p>
                <p className="font-semibold text-[#0A2A5E]">
                  Because understanding is the beginning of transformation.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowGetStarted(true)}
                  className="inline-flex items-center justify-center bg-[#0A2A5E] text-white px-8 py-4 rounded-full hover:bg-[#3DB3E3] transition-all duration-300 font-medium shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Get Started
                  <ArrowRight className="ml-2" size={20} />
                </button>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center border-2 border-[#0A2A5E] text-[#0A2A5E] px-8 py-4 rounded-full hover:bg-[#0A2A5E] hover:text-white transition-all duration-300 font-medium"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-gradient-to-br from-[#0A2A5E] to-[#1a4a7e]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Are you ready to discover your Neural Imprint Patterns?
              </h2>
              <p className="text-2xl md:text-3xl text-white font-semibold mb-4">
                For only R950, you get the Assessment + 45min debrief, sign up!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <button
                onClick={() => setShowGetStarted(true)}
                className="bg-[#3DB3E3] text-white px-12 py-6 rounded-xl hover:bg-white hover:text-[#0A2A5E] transition-all duration-300 font-bold text-xl shadow-2xl hover:scale-105"
              >
                Sign up Here
              </button>
              <button
                onClick={() => window.location.href = '#franchise'}
                className="bg-[#1FAFA3] text-white px-12 py-6 rounded-xl hover:bg-white hover:text-[#0A2A5E] transition-all duration-300 font-bold text-xl shadow-2xl hover:scale-105"
              >
                FOR NIPA COACHES
              </button>
            </div>

            <div className="relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

              <div className="relative px-8 md:px-16 py-12 md:py-16">
                <div className="max-w-3xl">
                  <blockquote className="text-2xl md:text-4xl font-bold text-white leading-tight mb-6">
                    "The real you is not your public story, but the hidden wiring that keeps repeating in the background."
                  </blockquote>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-[#3DB3E3]/20 to-transparent rounded-tl-full"></div>
            </div>
          </div>
        </section>

        <section id="franchise" className="py-20 px-6 bg-gradient-to-br from-[#0A2A5E] via-[#1a4a7e] to-[#3DB3E3]">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                OWN YOUR FUTURE WITH NIPA
              </h2>
              <p className="text-2xl text-[#E6E9EF] font-semibold mb-4">
                Work from home. Change lives. Build a real business.
              </p>
              <p className="text-lg text-white max-w-3xl mx-auto leading-relaxed">
                Are you passionate about people, growth, and transformation – and ready to turn that passion into a sustainable income?
              </p>
            </div>

            <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20 mb-12">
              <div className="space-y-8 text-white">
                <div>
                  <p className="text-lg leading-relaxed mb-6">
                    Become a <strong className="text-[#1FAFA3]">Neural Imprint Patterns Assessment (NIPA)</strong> Franchisee and be part of an exciting movement that helps individuals, Churches, Schools, Social Workers and Companies understand how the brain, experiences, and environment shape everyday life.
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                  <h3 className="text-2xl font-bold mb-4 text-[#1FAFA3]">What is NIPA?</h3>
                  <p className="text-[#E6E9EF] mb-4">
                    The Neural Imprint Patterns Assessment (NIPA) is a powerful self-reflection and coaching tool that helps people:
                  </p>
                  <ul className="space-y-2 text-[#E6E9EF] ml-6 list-disc">
                    <li>Identify habitual thought, emotion, and behaviour patterns ("neural imprints")</li>
                    <li>Explore how family, culture, work, finances, and beliefs have shaped these patterns</li>
                    <li>Highlight strengths, resilience, and growth potential</li>
                    <li>Flag areas where extra support, coaching, or therapeutic input may be helpful</li>
                  </ul>
                  <p className="text-white mt-4 font-semibold">
                    NIPA does not label, shame, or diagnose.
                  </p>
                  <p className="text-[#E6E9EF] mt-2">
                    It creates a safe, structured and respectful conversation about how a person's brain, story, and environment work together – and where change is possible.
                  </p>
                  <p className="text-white mt-4">
                    As a franchisee, you bring this powerful tool into your community… and build a business around it.
                  </p>
                </div>

                <div>
                  <h3 className="text-3xl font-bold mb-6 text-center">Why Become a NIPA Franchisee?</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                      <div className="text-3xl mb-2">💻</div>
                      <h4 className="text-xl font-bold mb-2 text-[#1FAFA3]">Work from Home</h4>
                      <p className="text-[#E6E9EF]">Run a professional, impact-driven business from your home office – flexible hours, low overheads.</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                      <div className="text-3xl mb-2">💡</div>
                      <h4 className="text-xl font-bold mb-2 text-[#1FAFA3]">Innovative, High-Impact Tool</h4>
                      <p className="text-[#E6E9EF]">You're not "just another coach." You're working with a distinctive assessment that opens deep, meaningful conversations quickly and respectfully.</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                      <div className="text-3xl mb-2">🌍</div>
                      <h4 className="text-xl font-bold mb-2 text-[#1FAFA3]">Serve Multiple Markets</h4>
                      <p className="text-[#E6E9EF] mb-2">Use NIPA with:</p>
                      <ul className="text-[#E6E9EF] text-sm space-y-1 ml-4 list-disc">
                        <li>Individuals & couples</li>
                        <li>Churches & faith communities</li>
                        <li>Schools & youth programs & Social Workers</li>
                        <li>Businesses, teams & HR departments</li>
                        <li>Coaches, counsellors, and practitioners</li>
                      </ul>
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                      <div className="text-3xl mb-2">💰</div>
                      <h4 className="text-xl font-bold mb-2 text-[#1FAFA3]">Create Multiple Income Streams</h4>
                      <p className="text-[#E6E9EF] mb-2">Earn through:</p>
                      <ul className="text-[#E6E9EF] text-sm space-y-1 ml-4 list-disc">
                        <li>Selling NIPA assessments</li>
                        <li>One-on-one feedback sessions</li>
                        <li>Group workshops and seminars</li>
                        <li>Ongoing coaching and follow-up programs</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-6 border border-white/20 mt-6">
                    <div className="text-3xl mb-2">🧩</div>
                    <h4 className="text-xl font-bold mb-2 text-[#1FAFA3]">No Clinical Qualification Needed (for coaching use)</h4>
                    <p className="text-[#E6E9EF]">NIPA is a conversation and coaching tool, not a diagnostic test. It fits perfectly with growth-minded coaches, mentors, teachers, pastors, and people-helpers.</p>
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                  <h3 className="text-2xl font-bold mb-4 text-[#1FAFA3]">What You Get as a NIPA Franchisee</h3>
                  <ul className="space-y-3 text-[#E6E9EF]">
                    <li className="flex items-start">
                      <span className="text-[#1FAFA3] mr-2">✔️</span>
                      <span>Rights to use the NIPA brand and assessment in your area</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#1FAFA3] mr-2">✔️</span>
                      <span>Training & onboarding in how to interpret and use the assessment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#1FAFA3] mr-2">✔️</span>
                      <span>Ready-made session templates, scripts, and worksheets</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#1FAFA3] mr-2">✔️</span>
                      <span>Marketing support – adverts, brochures, and social media ideas</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#1FAFA3] mr-2">✔️</span>
                      <span>Ongoing community, mentorship, and updates as the system grows</span>
                    </li>
                  </ul>
                  <p className="text-white mt-4 font-semibold">
                    You're never alone. You plug into a growing network of like-minded people who believe in transformation, not just "talking about change."
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                  <h3 className="text-2xl font-bold mb-4 text-[#1FAFA3]">Is This for You?</h3>
                  <p className="text-[#E6E9EF] mb-4">You'll thrive as a NIPA Franchisee if you are:</p>
                  <ul className="space-y-2 text-[#E6E9EF] ml-6 list-disc">
                    <li>A Coach, Counsellor, Pastor, Teacher, Social Worker, Business Owner, Company CEO, HR Practitioner, or Mentor, OR</li>
                    <li>An entrepreneur who loves working with people and wants a meaningful, future-focused business</li>
                    <li>Someone who believes people can change when they understand how their brain and story work</li>
                  </ul>
                  <p className="text-white mt-6 text-lg font-semibold italic">
                    If you've ever thought, "I want my own business, but I also want to make a real difference,"
                  </p>
                  <p className="text-[#1FAFA3] text-lg font-bold">
                    Then NIPA was designed with you in mind.
                  </p>
                </div>

                <div className="text-center py-8">
                  <h3 className="text-3xl font-bold mb-6">Take the Next Step</h3>
                  <p className="text-lg mb-6">
                    Become part of this exciting venture and build your own work-from-home business with NIPA.
                  </p>
                  <p className="text-xl font-semibold mb-8 text-[#1FAFA3]">
                    Start changing lives – including your own.
                  </p>
                  <div className="max-w-2xl mx-auto space-y-4 text-lg">
                    <p className="text-[#E6E9EF]">You bring the heart.</p>
                    <p className="text-[#E6E9EF]">NIPA brings the framework.</p>
                    <p className="text-white font-bold text-xl">
                      Together, you build a business that transforms minds, stories, and futures.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowGetStarted(true)}
                    className="mt-8 bg-[#1FAFA3] text-white px-12 py-4 rounded-full hover:bg-white hover:text-[#0A2A5E] transition-all duration-300 font-bold text-lg shadow-2xl hover:scale-105"
                  >
                    Get Started as a Franchisee
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-20 px-6 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[#0A2A5E] mb-4">Our Services</h2>
              <p className="text-lg text-[#3DB3E3] max-w-2xl mx-auto">
                Comprehensive solutions designed to transform individuals and organizations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-[#E6E9EF]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className="bg-gradient-to-br from-[#3DB3E3] to-[#1FAFA3] w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <service.icon className="text-white" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-[#0A2A5E] mb-3">{service.title}</h3>
                    <p className="text-[#3DB3E3] leading-relaxed">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="programs" className="py-20 px-6 bg-gradient-to-br from-[#0A2A5E] to-[#3DB3E3]">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Featured Programs</h2>
              <p className="text-lg text-[#E6E9EF] max-w-2xl mx-auto">
                Structured pathways to unlock your potential and achieve transformative results
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {programs.map((program, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">{program.title}</h3>
                    <span className="bg-[#1FAFA3] text-white px-4 py-1 rounded-full text-sm font-medium">
                      {program.duration}
                    </span>
                  </div>
                  <p className="text-[#E6E9EF] leading-relaxed mb-6">{program.description}</p>
                  <button className="inline-flex items-center text-white font-medium hover:text-[#1FAFA3] transition-colors">
                    Learn More
                    <ArrowRight className="ml-2" size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-20 px-6 bg-[#E6E9EF]">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-[#0A2A5E] mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-[#3DB3E3] leading-relaxed mb-6">
                  BrainWorx is dedicated to raising a generation of optimized humans who operate at peak cognitive and emotional capacity. We believe in developing intrinsic motivation, adaptive thinking, and responsive leadership.
                </p>
                <p className="text-lg text-[#3DB3E3] leading-relaxed mb-6">
                  Through our evidence-based approach combining neuroscience, psychology, and transformative methodologies, we help individuals and organizations shift from reactive patterns to proactive excellence.
                </p>
                <blockquote className="border-l-4 border-[#3DB3E3] pl-6 italic text-[#0A2A5E] text-xl">
                  "Growth starts the moment comfort ends."
                </blockquote>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-4xl font-bold text-[#3DB3E3] mb-2">500+</div>
                  <div className="text-[#0A2A5E] font-medium">Leaders Transformed</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-4xl font-bold text-[#3DB3E3] mb-2">50+</div>
                  <div className="text-[#0A2A5E] font-medium">Organizations</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-4xl font-bold text-[#3DB3E3] mb-2">15+</div>
                  <div className="text-[#0A2A5E] font-medium">Years Experience</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-4xl font-bold text-[#3DB3E3] mb-2">95%</div>
                  <div className="text-[#0A2A5E] font-medium">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20 px-6 bg-white">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-[#0A2A5E] mb-4">Begin Your Transformation</h2>
              <p className="text-lg text-[#3DB3E3]">
                Ready to unlock your potential? Get in touch with us today.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#E6E9EF] to-white rounded-3xl p-8 md:p-12 shadow-xl">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#0A2A5E] font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E9EF] focus:border-[#3DB3E3] focus:outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[#0A2A5E] font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E9EF] focus:border-[#3DB3E3] focus:outline-none transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#0A2A5E] font-medium mb-2">Interest</label>
                  <select className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E9EF] focus:border-[#3DB3E3] focus:outline-none transition-colors">
                    <option>Executive Transformation Program</option>
                    <option>Team Intelligence Workshops</option>
                    <option>Individual Coaching Sessions</option>
                    <option>Youth Development Camp</option>
                    <option>General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#0A2A5E] font-medium mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E9EF] focus:border-[#3DB3E3] focus:outline-none transition-colors"
                    placeholder="Tell us about your goals and how we can help..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] text-white px-8 py-4 rounded-full hover:shadow-2xl transition-all duration-300 font-medium text-lg hover:scale-105 flex items-center justify-center"
                >
                  <MessageSquare className="mr-2" size={20} />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0A2A5E] text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/THE REAL PNG LOGO.png" alt="Brainworx" className="h-8 w-auto" />
              </div>
              <p className="text-[#E6E9EF] text-sm leading-relaxed">
                Empowering individuals and organizations to achieve peak performance through cognitive transformation.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-[#E6E9EF]">
                <li><a href="#home" className="hover:text-[#3DB3E3] transition-colors">Home</a></li>
                <li><a href="#services" className="hover:text-[#3DB3E3] transition-colors">Services</a></li>
                <li><a href="#programs" className="hover:text-[#3DB3E3] transition-colors">Programs</a></li>
                <li><a href="#about" className="hover:text-[#3DB3E3] transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Programs</h4>
              <ul className="space-y-2 text-[#E6E9EF]">
                <li><a href="#" className="hover:text-[#3DB3E3] transition-colors">Executive Transformation</a></li>
                <li><a href="#" className="hover:text-[#3DB3E3] transition-colors">Team Workshops</a></li>
                <li><a href="#" className="hover:text-[#3DB3E3] transition-colors">Individual Coaching</a></li>
                <li><a href="#" className="hover:text-[#3DB3E3] transition-colors">Youth Camp</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-[#E6E9EF]">
                <li><a href="#contact" className="hover:text-[#3DB3E3] transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-[#3DB3E3] transition-colors">info@brainworx.com</a></li>
                <li><a href="#" className="hover:text-[#3DB3E3] transition-colors">+1 (555) 123-4567</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-[#E6E9EF]">
            <p>&copy; 2025 BrainWorx. All rights reserved. Transform. Evolve. Thrive.</p>
            <p className="mt-2 text-sm text-[#E6E9EF]/60">v1.0.3</p>
          </div>
        </div>
      </footer>

      {showGetStarted && (
        <GetStartedOptions
          onClose={() => {
            setShowGetStarted(false);
            setPreselectedPaymentType(null);
            setCouponCode(null);
          }}
          franchiseCode={franchiseCode}
          preselectedPaymentType={preselectedPaymentType}
          initialCouponCode={couponCode}
        />
      )}

      {showSampleAnalysis && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="relative">
            <button
              onClick={() => setShowSampleAnalysis(false)}
              className="fixed top-4 right-4 z-[60] bg-white text-gray-600 hover:text-gray-900 rounded-full p-3 shadow-lg"
            >
              <X size={24} />
            </button>
            <SampleAnalysisDemo />
          </div>
        </div>
      )}

      {showNeuralPatterns && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
          <button
            onClick={() => setShowNeuralPatterns(false)}
            className="fixed top-4 right-4 z-[60] bg-white text-gray-600 hover:text-gray-900 rounded-full p-3 shadow-lg border-2 border-gray-300"
          >
            <X size={24} />
          </button>
          <NeuralImprintPatterns />
        </div>
      )}

      {showSelfAssessments && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
          <SelfAssessmentsPage
            onClose={() => setShowSelfAssessments(false)}
            onStartPayment={(paymentType) => {
              setPreselectedPaymentType(paymentType);
              setShowSelfAssessments(false);
              setShowGetStarted(true);
            }}
          />
        </div>
      )}

      {showDisclaimer && (
        <DisclaimerPage onClose={() => setShowDisclaimer(false)} />
      )}

      {showLibrary && (
        <Library onClose={() => setShowLibrary(false)} />
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={() => {
              window.location.reload();
            }}
          />
        </div>
      )}

      {showNIP3 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
          <NIP3Assessment onClose={() => {
            setShowNIP3(false);
            window.history.pushState({}, '', window.location.pathname.replace('/nip3', ''));
          }} />
        </div>
      )}
    </div>
  );
}

export default App;
