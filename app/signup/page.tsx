'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, User, Mail, Phone, Lock, Eye, EyeOff, GraduationCap, UserCheck, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'Student' | 'Faculty'>('Student');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      toast.error('All fields are required');
      return;
    }

    if (!formData.email.endsWith('@nitj.ac.in')) {
      toast.error('Only @nitj.ac.in emails allowed');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be 8+ characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.toLowerCase(),
          phone: formData.phone,
          password: formData.password,
          userType: role
        })
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.error);
        return;
      }

      toast.success(`Account created! Your Member ID: ${data.data.memberId}`);
      router.push('/login');

    } catch (err) {
      toast.error('Signup failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* same header as before */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="flex justify-center mb-10">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900">Citadel</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-600">Join NIT Jalandhar&apos;s smart library system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Anshuman Mishra"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 placeholder-gray-500 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-black"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="anshumanm.it.24@nitj.ac.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 placeholder-gray-500 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-black"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0,10) })}
                    className="w-full pl-12 pr-4 py-4 placeholder-gray-500 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-black"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">I am a</label>
              <div className="grid grid-cols-2 gap-4">
                {(['Student', 'Faculty'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    disabled={isLoading}
                    className={`p-6 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${
                      role === r
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {r === 'Student' ? <GraduationCap className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
                    <span className="font-medium">{r}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 placeholder-gray-500 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-black"
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Log in
            </Link>
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          © 2025 Citadel LMS • NIT Jalandhar
        </p>
      </div>
    </div>
  );
}