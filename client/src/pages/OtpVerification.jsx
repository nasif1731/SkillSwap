import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const OtpVerification = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const token = localStorage.getItem('token');

  const sendOtp = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/auth/send-otp',
        { phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtpSent(true);
      toast.success('OTP sent to your phone!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const verifyOtp = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/auth/verify-otp',
        { phone, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Phone verified successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-xl rounded-xl">
        {!otpSent ? (
          <>
            <input
              type="text"
              placeholder="Phone Number"
              className="border p-3 mb-4 rounded w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              onClick={sendOtp}
              className="bg-blue-500 text-white p-3 rounded w-full"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="border p-3 mb-4 rounded w-full"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={verifyOtp}
              className="bg-green-500 text-white p-3 rounded w-full"
            >
              Verify OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OtpVerification;
