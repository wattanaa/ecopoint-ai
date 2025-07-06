import React, { useState, useEffect } from 'react';
import { useUser } from '../App';
import { Leaf } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const { login } = useUser();

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setStep('otp');
    } else {
      alert('กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง');
    }
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') {
      login(phone);
    } else {
      alert('รหัส OTP ไม่ถูกต้อง');
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
  };

  useEffect(() => {
    if (step === 'otp') {
      const timer = setTimeout(() => {
        setOtp('123456');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step]);


  return (
    <div className="flex flex-col justify-center min-h-[80vh]">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Leaf size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            ยินดีต้อนรับสู่ EcoPoint AI
          </h2>
          <p className="text-slate-500">ระบบแลกขวดอัจฉริยะเพื่อสิ่งแวดล้อม</p>
        </div>

        {step === 'phone' && (
          <div className="space-y-6">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">หมายเลขโทรศัพท์</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="08X-XXX-XXXX"
              />
            </div>
            <button onClick={handleSendOtp} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md hover:shadow-lg">
              ส่งรหัส OTP
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-6">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">รหัส OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-2xl tracking-widest transition"
                placeholder="123456"
                maxLength={6}
              />
              <p className="text-sm text-slate-500 mt-2 text-center">รหัสถูกส่งไปยัง <span className="font-semibold text-emerald-600">{phone}</span></p>
            </div>
            <div className="space-y-3">
              <button onClick={handleVerifyOtp} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md hover:shadow-lg">
                ยืนยันรหัส OTP
              </button>
              <button onClick={handleBackToPhone} className="w-full text-slate-600 py-2 hover:bg-slate-100 rounded-lg transition-all">
                กลับไปแก้ไขเบอร์โทร
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;