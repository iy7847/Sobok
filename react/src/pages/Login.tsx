import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Mail, Lock, Building, User, Phone, Briefcase, Loader2, Sparkles, ArrowRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../hooks/usePWAInstall';

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

    const { isInstallable, installApp } = usePWAInstall(); // Hook usage

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
            <div className="h-screen flex flex-col items-center justify-center bg-[#0a0f1d]">
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                <p className="text-gray-400">사용자 확인 중...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0f1d] relative overflow-hidden font-pretendard transition-colors duration-300">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-white to-purple-100/50 dark:from-indigo-900/20 dark:via-[#0a0f1d] dark:to-purple-900/20 z-0 transition-colors duration-300"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10 px-4"
            >
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-8 relative overflow-hidden transition-colors duration-300">
                    {/* Glass Reflection effect */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/5 dark:via-black/20 to-transparent"></div>

                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <img
                                    src={`${import.meta.env.BASE_URL}pwa-192x192.png`}
                                    alt="Sobok Logo"
                                    className="relative w-24 h-24 rounded-2xl shadow-xl object-cover ring-1 ring-white/10"
                                />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-2">
                            소복 (Sobok)
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            복잡함은 덜고, 이익은 채우는 원가 파트너
                        </p>
                    </div>



                    {/* Toggle Switch */}
                    <div className="flex bg-gray-100 dark:bg-black/20 rounded-lg p-1 mb-6 relative">
                        <div
                            className="absolute bg-white dark:bg-indigo-600 shadow-sm dark:shadow-none rounded-md h-[calc(100%-8px)] transition-all duration-300 ease-out"
                            style={{
                                width: 'calc(50% - 4px)',
                                left: isLoginMode ? '4px' : '50%'
                            }}
                        />
                        <button
                            onClick={() => { setIsLoginMode(true); setError(null); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-md relative z-10 transition-colors duration-300 ${isLoginMode ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            로그인
                        </button>
                        <button
                            onClick={() => { setIsLoginMode(false); setError(null); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-md relative z-10 transition-colors duration-300 ${!isLoginMode ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            회원가입
                        </button>
                    </div>

                    {/* App Install Button */}
                    <div className="flex justify-end mb-6 gap-3">
                        {isInstallable && (
                            <button
                                onClick={installApp}
                                className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors flex items-center space-x-1 font-bold"
                            >
                                <Download className="w-3 h-3" />
                                <span className="border-b border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 dark:hover:border-indigo-400 pb-0.5 transition-colors">앱 설치하기</span>
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/install-guide')}
                            className="text-xs text-gray-400 hover:text-indigo-400 transition-colors flex items-center space-x-1"
                        >
                            <span className="border-b border-gray-600 hover:border-indigo-400 pb-0.5 transition-colors">설치 방법 가이드</span>
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <form onSubmit={isLoginMode ? handleSignIn : handleSignUp} className="space-y-5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLoginMode ? 'login' : 'signup'}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300 ml-1">이메일</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                            placeholder="example@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300 ml-1">비밀번호</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {!isLoginMode && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 pt-2"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 ml-1">비밀번호 확인</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        <div className="h-px bg-gray-200 dark:bg-white/10 my-4" />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 ml-1">대표자명</label>
                                                <div className="relative group">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={representativeName}
                                                        onChange={(e) => setRepresentativeName(e.target.value)}
                                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                                        placeholder="홍길동"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 ml-1">연락처</label>
                                                <div className="relative group">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={phoneNumber}
                                                        onChange={handlePhoneNumberChange}
                                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                                        placeholder="010-0000-0000"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 ml-1">상호명</label>
                                            <div className="relative group">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                                    placeholder="소복 베이커리"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 ml-1">업태/종목 (선택)</label>
                                            <div className="relative group">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={businessType}
                                                    onChange={(e) => setBusinessType(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                                    placeholder="카페 / 제과점"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl py-3.5 font-medium shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLoginMode ? <LogIn size={20} className="mr-2" /> : <UserPlus size={20} className="mr-2" />}
                                    <span>{isLoginMode ? '로그인하기' : '소복 시작하기'}</span>
                                    {isLoginMode && <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-600 text-xs mt-6">
                    © 2025 Sobok. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
