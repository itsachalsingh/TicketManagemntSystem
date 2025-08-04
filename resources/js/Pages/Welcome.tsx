import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Zod schema
const loginSchema = z
  .object({
    identifier: z
      .string()
      .min(1, 'Email or mobile is required')
      .refine(
        val => /^[\d]{10}$/.test(val) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        { message: 'Must be a valid email or 10-digit mobile number' }
      ),
    password: z
      .string()
      .transform(val => (val === '' ? undefined : val))
      .optional()
      .refine(val => val === undefined || val.length >= 6, {
        message: 'Password must be at least 6 characters',
      }),
    otp: z
      .string()
      .transform(val => (val === '' ? undefined : val))
      .optional()
      .refine(val => val === undefined || /^[0-9]{6}$/.test(val), {
        message: 'OTP must be 6 digits',
      }),
    loginWithOtp: z.boolean(),
  })
  .refine(
    data =>
      (data.loginWithOtp && data.otp && !data.password) ||
      (!data.loginWithOtp && data.password && !data.otp),
    {
      message: 'Either password or OTP is required, not both',
      path: ['form'], // <-- set path to 'form' to catch global error
    }
  );

export default function Welcome({
  auth,
  laravelVersion,
  phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    otp: '',
    loginWithOtp: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpSending, setOtpSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({});
  };

  const toggleOtpMode = () => {
    setFormData(prev => ({
      ...prev,
      loginWithOtp: !prev.loginWithOtp,
      password: '',
      otp: '',
    }));
    setErrors({});
  };

  const handleSendOtp = async () => {
    if (!formData.identifier.match(/^\d{10}$/)) {
      setErrors({ identifier: 'Enter a valid 10-digit mobile number' });
      return;
    }

    try {
      setOtpSending(true);
      const res = await axios.post('/send-otp', {
        mobile: formData.identifier,
      });

      toast.success(res?.data?.message || 'OTP sent successfully');
      if (res.data.otp) {
        toast.info(`Debug OTP: ${res.data.otp}`);
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors: Record<string, string[]> = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        for (const key in apiErrors) {
          formattedErrors[key] = Array.isArray(apiErrors[key])
            ? apiErrors[key][0]
            : apiErrors[key];
        }
        setErrors(formattedErrors);
      } else {
        toast.error('Failed to send OTP');
      }
    } finally {
      setOtpSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const { identifier, password, otp, loginWithOtp } = result.data;
    const payload: Record<string, any> = {
      remember: true,
    };

    if (loginWithOtp) {
      payload.phone = identifier;
      payload.otp = otp;
    } else {
      payload.email = identifier;
      payload.password = password;
    }

    try {
      const response = await axios.post('/login', payload);
      toast.success('Login successful!');
      window.location.href = '/dashboard';
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors: Record<string, string[]> = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        for (const key in apiErrors) {
          formattedErrors[key] = Array.isArray(apiErrors[key])
            ? apiErrors[key][0]
            : apiErrors[key];
        }
        setErrors(formattedErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
  };

  useEffect(() => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField && firstErrorField !== 'form') {
      (document.querySelector(`[name="${firstErrorField}"]`) as HTMLInputElement | null)?.focus();
    }
  }, [errors]);

  return (
    <>
      <Head title="Welcome" />
      <div className="relative min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div id="background" className="absolute inset-0 bg-cover bg-center z-0 opacity-30"></div>
        <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>

        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 bg-white p-4 rounded-full shadow-lg">
          <img
            src="https://ucc.uk.gov.in/portal/assets/uk-logo-DkcNO7TS.png"
            alt="UK Government Logo"
            className="h-16 w-auto"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Welcome to the <span className="text-blue-400"><br />Grievance Cell</span>
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Streamline issue tracking, improve efficiency, and monitor resolutions with ease.
            </p>
          </div>

          <div className="bg-white text-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            <form onSubmit={handleSubmit}>
              {/* Global Form Errors */}
              {errors.form && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                  {errors.form}
                </div>
              )}

              {/* Identifier */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Email or Mobile</label>
                <input
                  name="identifier"
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email or mobile"
                  value={formData.identifier}
                  onChange={handleChange}
                />
                {errors.identifier && <p className="text-red-500 text-sm mt-1">{errors.identifier}</p>}
              </div>

              {/* Password or OTP */}
              {!formData.loginWithOtp ? (
                <div className="mb-6">
                  <label className="block mb-1 font-medium">Password</label>
                  <input
                    name="password"
                    type="password"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block mb-1 font-medium">OTP</label>
                  <input
                    name="otp"
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter OTP"
                    value={formData.otp}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="text-blue-600 text-sm mt-2 hover:underline disabled:opacity-50"
                    onClick={handleSendOtp}
                    disabled={otpSending}
                  >
                    {otpSending ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                  {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Sign In
              </button>

              {/* Toggle Mode */}
              <div className="text-center mt-3">
                <button
                  type="button"
                  className="text-sm text-blue-500 hover:underline"
                  onClick={toggleOtpMode}
                >
                  {formData.loginWithOtp ? 'Login with Password' : 'Login with OTP'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 text-center text-gray-400">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Ticket Management System. All rights reserved.
          </p>
          <div className="hidden">
            <p className="text-xs">
              Developed by{' '}
              <a href="https://example.com" className="text-blue-500 hover:underline">
                Achal Singh
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
