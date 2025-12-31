import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, Share, PlusSquare, MoreVertical, LayoutGrid, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppInstallGuide: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');

    return (
        <div className="min-h-screen bg-[#0a0f1d] text-white font-pretendard relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-[#0a0f1d] to-purple-900/20 z-0"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 h-screen flex flex-col">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate('/login')}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors mr-4 border border-white/10"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            앱 설치 방법
                        </h1>
                        <p className="text-sm text-gray-400">
                            홈 화면에 추가하여 앱처럼 사용하세요
                        </p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-black/20 rounded-xl p-1 mb-8 backdrop-blur-sm border border-white/10">
                    <button
                        onClick={() => setActiveTab('ios')}
                        className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 ${activeTab === 'ios'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <Smartphone className="w-5 h-5" />
                        <span className="font-medium">아이폰 (iOS)</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('android')}
                        className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 ${activeTab === 'android'
                                ? 'bg-[#3DDC84] text-black shadow-lg'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <Smartphone className="w-5 h-5" />
                        <span className="font-medium">안드로이드</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
                    <AnimatePresence mode="wait">
                        {activeTab === 'ios' ? (
                            <motion.div
                                key="ios"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg border border-blue-500/30">1</div>
                                        <h3 className="text-lg font-semibold text-gray-200">하단 공유 버튼 터치</h3>
                                    </div>
                                    <p className="text-gray-400 pl-14 mb-4">
                                        사파리 브라우저 하단 중앙에 있는 <b className="text-white">공유 아이콘</b>을 눌러주세요.
                                    </p>
                                    <div className="flex justify-center bg-black/30 rounded-xl p-4 border border-white/5">
                                        <Share className="w-8 h-8 text-blue-500" />
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg border border-blue-500/30">2</div>
                                        <h3 className="text-lg font-semibold text-gray-200">홈 화면에 추가 선택</h3>
                                    </div>
                                    <p className="text-gray-400 pl-14 mb-4">
                                        공유 메뉴에서 아래로 스크롤하여 <b className="text-white">'홈 화면에 추가'</b>를 선택하세요.
                                    </p>
                                    <div className="flex justify-center bg-black/30 rounded-xl p-4 border border-white/5 space-x-2 items-center">
                                        <PlusSquare className="w-6 h-6 text-gray-300" />
                                        <span className="text-gray-300">홈 화면에 추가</span>
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg border border-blue-500/30">3</div>
                                        <h3 className="text-lg font-semibold text-gray-200">추가 버튼 터치</h3>
                                    </div>
                                    <p className="text-gray-400 pl-14 mb-4">
                                        우측 상단의 <b className="text-blue-400">'추가'</b> 버튼을 누르면 설치가 완료됩니다.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="android"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-[#3DDC84]/20 flex items-center justify-center text-[#3DDC84] font-bold text-lg border border-[#3DDC84]/30">1</div>
                                        <h3 className="text-lg font-semibold text-gray-200">메뉴 버튼 터치</h3>
                                    </div>
                                    <p className="text-gray-400 pl-14 mb-4">
                                        크롬 브라우저 우측 상단의 <b className="text-white">점 세 개 메뉴</b>를 눌러주세요.
                                    </p>
                                    <div className="flex justify-center bg-black/30 rounded-xl p-4 border border-white/5">
                                        <MoreVertical className="w-8 h-8 text-gray-300" />
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-[#3DDC84]/20 flex items-center justify-center text-[#3DDC84] font-bold text-lg border border-[#3DDC84]/30">2</div>
                                        <h3 className="text-lg font-semibold text-gray-200">앱 설치 또는 홈 화면에 추가</h3>
                                    </div>
                                    <p className="text-gray-400 pl-14 mb-4">
                                        <b className="text-white">'앱 설치'</b> 또는 <b className="text-white">'홈 화면에 추가'</b> 메뉴를 선택하세요.
                                    </p>
                                    <div className="flex justify-center bg-black/30 rounded-xl p-4 border border-white/5 space-x-4">
                                        <div className="flex flex-col items-center space-y-2">
                                            <Download className="w-6 h-6 text-gray-300" />
                                            <span className="text-xs text-gray-400">앱 설치</span>
                                        </div>
                                        <div className="w-px h-10 bg-white/10"></div>
                                        <div className="flex flex-col items-center space-y-2">
                                            <LayoutGrid className="w-6 h-6 text-gray-300" />
                                            <span className="text-xs text-gray-400">홈 화면 추가</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-[#3DDC84]/20 flex items-center justify-center text-[#3DDC84] font-bold text-lg border border-[#3DDC84]/30">3</div>
                                        <h3 className="text-lg font-semibold text-gray-200">설치 완료</h3>
                                    </div>
                                    <p className="text-gray-400 pl-14 mb-4">
                                        안내 팝업에서 <b className="text-[#3DDC84]">'설치'</b> 혹은 <b className="text-[#3DDC84]">'추가'</b>를 누르면 완료됩니다.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AppInstallGuide;
