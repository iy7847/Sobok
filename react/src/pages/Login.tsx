import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Mail, Lock, Building, User, Phone, Briefcase, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage: React.FC = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [representativeName, setRepresentativeName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [businessType, setBusinessType] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && user) {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/[^0-9]/g, '');
        let formatted = input;
        if (input.length <= 3) formatted = input;
        else if (input.length <= 7) formatted = `${input.slice(0, 3)}-${input.slice(3)}`;
        else formatted = `${input.slice(0, 3)}-${input.slice(3, 7)}-${input.slice(7, 11)}`;
        setPhoneNumber(formatted);
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            navigate('/');
        } catch (err: any) {
            setError(err.message === 'Invalid login credentials' ? '이메일 또는 비밀번호가 일치하지 않습니다.' : err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) throw signUpError;

            if (newUser) {
                const { error: profileError } = await supabase
                    .from('Profiles')
                    .insert({
                        id: newUser.id,
                        email,
                        name: representativeName,
                        company_name: companyName,
                        representative_name: representativeName,
                        phone_number: phoneNumber.replace(/-/g, ''),
                        business_type: businessType,
                        subscription_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                    });

                if (profileError) throw profileError;
                alert('회원가입이 완료되었습니다! 로그인 해주세요.');
                setIsLoginMode(true);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-bg-dark">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <p className="text-text-muted">사용자 확인 중...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-dark p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[480px] glass p-8 md:p-10 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <h1 className="text-3xl font-black text-primary italic">S</h1>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">소복 (Sobok)</h2>
                    <p className="text-text-muted">복잡함은 덜고, 이익은 채우는 원가 파트너</p>
                </div>

                <div className="flex gap-4 mb-8 p-1 bg-white/5 rounded-xl">
                    <button
                        onClick={() => setIsLoginMode(true)}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${isLoginMode ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                    >
                        로그인
                    </button>
                    <button
                        onClick={() => setIsLoginMode(false)}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${!isLoginMode ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                    >
                        회원가입
                    </button>
                </div>

                <form onSubmit={isLoginMode ? handleSignIn : handleSignUp} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted ml-1">이메일</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="email"
                                required
                                className="input-field pl-12"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted ml-1">비밀번호</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="password"
                                required
                                className="input-field pl-12"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!isLoginMode && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-4 overflow-hidden"
                            >
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text-muted ml-1">비밀번호 확인</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input
                                            type="password"
                                            required
                                            className="input-field pl-12"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-white/10 my-4" />
                                <p className="text-sm font-bold text-primary">가게 정보 입력</p>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text-muted ml-1">상호명</label>
                                    <div className="relative">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input
                                            type="text"
                                            required
                                            className="input-field pl-12"
                                            placeholder="소복 베이커리"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-text-muted ml-1">대표자명</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                            <input
                                                type="text"
                                                required
                                                className="input-field pl-12"
                                                placeholder="박일용"
                                                value={representativeName}
                                                onChange={(e) => setRepresentativeName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-text-muted ml-1">연락처</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                            <input
                                                type="tel"
                                                required
                                                className="input-field pl-12"
                                                placeholder="010-0000-0000"
                                                value={phoneNumber}
                                                onChange={handlePhoneNumberChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text-muted ml-1">업태/종목 (선택)</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input
                                            type="text"
                                            className="input-field pl-12"
                                            placeholder="카페 / 제과점"
                                            value={businessType}
                                            onChange={(e) => setBusinessType(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full py-4 text-lg mt-6 shadow-indigo-500/20 shadow-xl"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <span className="flex items-center gap-2">
                                {isLoginMode ? <LogIn size={20} /> : <UserPlus size={20} />}
                                {isLoginMode ? '로그인하기' : '소복 시작하기'}
                            </span>
                        )}
                    </button>
                </form>

                <p className="text-center text-text-muted text-xs mt-8">
                    &copy; 2025 Sobok. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
