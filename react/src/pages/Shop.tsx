import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import type { UserProfile, FormElement, Item } from '../types';
import {
    Store,
    Calendar,
    AlertCircle,
    Loader2,
    ChevronDown,
    Check,
    Package
} from 'lucide-react';

const ShopPage: React.FC = () => {
    const { shopId } = useParams<{ shopId: string }>();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [shopProfile, setShopProfile] = useState<UserProfile | null>(null);
    const [formElements, setFormElements] = useState<FormElement[]>([]);

    // Product Selection State
    const [products, setProducts] = useState<Item[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);

    // Form State
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    useEffect(() => {
        if (shopId) {
            fetchShopData(shopId);
        }
    }, [shopId]);

    const fetchShopData = async (id: string) => {
        try {
            // Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('Profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (profileError) throw profileError;
            setShopProfile(profileData);

            if (profileData.order_form_config) {
                try {
                    setFormElements(JSON.parse(profileData.order_form_config));
                } catch (e) {
                    console.error('Failed to parse config', e);
                }
            }

            // Fetch Products (Items where type='Product')
            const { data: itemsData, error: itemsError } = await supabase
                .from('Items')
                .select('*')
                .eq('user_id', id)
                .eq('type', 'Product');

            if (!itemsError && itemsData) {
                setProducts(itemsData);
            }

        } catch (err) {
            console.error(err);
            alert('상점 정보를 불러올 수 없습니다. 링크를 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to extract price from option string "Option Name (+1000)"
    const extractPrice = (option: string): number => {
        const match = option.match(/\(\+(\d+)\)/);
        return match ? parseInt(match[1], 10) : 0;
    };

    // Calculate total estimated price
    const totalPrice = useMemo(() => {
        let total = selectedProduct ? selectedProduct.selling_price : 0;

        formElements.forEach(el => {
            const answer = answers[el.id];
            if (!answer) return;

            if (el.type === 'Select' || el.type === 'Radio') {
                total += extractPrice(answer as string);
            } else if (el.type === 'Checkbox' && Array.isArray(answer)) {
                answer.forEach(opt => {
                    total += extractPrice(opt);
                });
            }
        });
        return total;
    }, [answers, formElements, selectedProduct]);

    const handleInputChange = (id: string, value: any) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleCheckboxChange = (id: string, option: string, checked: boolean) => {
        setAnswers(prev => {
            const current = (prev[id] as string[]) || [];
            if (checked) {
                return { ...prev, [id]: [...current, option] };
            } else {
                return { ...prev, [id]: current.filter(item => item !== option) };
            }
        });
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        // Simple auto-hyphen logic for display
        let formatted = value;
        if (value.length > 3 && value.length <= 7) {
            formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else if (value.length > 7) {
            formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
        }
        setCustomerPhone(formatted);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopId || !shopProfile) return;

        // Validation
        const missingRequired = formElements.some(el => el.required && !answers[el.id] && el.type !== 'Notice' && el.type !== 'Image');
        if (missingRequired || !customerName || !customerPhone) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }

        if (products.length > 0 && !selectedProduct) {
            alert('주문하실 상품을 선택해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            // Construct Order Object
            const orderData = {
                shop_id: shopId,
                customer_name: customerName,
                customer_phone: customerPhone,
                total_amount: totalPrice,
                status: '신규',
                request_note: selectedProduct ? `상품: ${selectedProduct.name}` : '',
                custom_data: {
                    selected_product: selectedProduct,
                    answers,
                    form_version: new Date().toISOString()
                },
                created_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('Orders')
                .insert(orderData);

            if (error) throw error;

            alert('주문이 접수되었습니다! 감사합니다.');
            setAnswers({});
            setCustomerName('');
            setCustomerPhone('');
            setSelectedProduct(null);
            window.scrollTo(0, 0);

        } catch (err: any) {
            console.error(err);
            alert('주문 접수 중 오류가 발생했습니다: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!shopProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4 text-center">
                <div className="space-y-4">
                    <AlertCircle className="mx-auto text-red-400" size={48} />
                    <h1 className="text-2xl font-bold">상점을 찾을 수 없습니다</h1>
                    <p className="text-text-muted">올바른 링크인지 확인해주세요.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-20">
            {/* Header */}
            <div className="bg-gray-900/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-10">
                <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Store className="text-primary" size={24} />
                        <h1 className="font-bold text-lg text-white">{shopProfile.company_name || '소복 상점'}</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-xl mx-auto p-6 space-y-8">
                {/* Shop Notice */}
                {(shopProfile.shop_notice || shopProfile.bank_account) && (
                    <div className="glass p-6 space-y-4 border-l-4 border-l-primary bg-primary/5">
                        {shopProfile.shop_notice && (
                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
                                {shopProfile.shop_notice}
                            </div>
                        )}
                        {shopProfile.bank_account && (
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-xs font-bold text-primary mb-1">입금 계좌</p>
                                <p className="font-mono bg-white/5 p-2 rounded text-sm select-all">{shopProfile.bank_account}</p>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Product Selection (Visible only if products exist) */}
                    {products.length > 0 && (
                        <div className="glass p-6 space-y-4 border-2 border-primary/20">
                            <h3 className="font-bold flex items-center gap-2 text-lg text-white">
                                <Package className="text-primary" size={20} />
                                상품 선택 <span className="text-red-400">*</span>
                            </h3>
                            <div className="space-y-2">
                                {products.map((product) => (
                                    <label
                                        key={product.id}
                                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedProduct?.id === product.id ? 'bg-primary/20 border-primary ring-1 ring-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="radio"
                                                name="main-product"
                                                className="w-5 h-5 text-primary bg-transparent border-white/30 focus:ring-primary"
                                                checked={selectedProduct?.id === product.id}
                                                onChange={() => setSelectedProduct(product)}
                                            />
                                            <div>
                                                <p className="font-bold text-white">{product.name}</p>
                                                <p className="text-xs text-text-muted">{product.selling_price.toLocaleString()}원</p>
                                            </div>
                                        </div>
                                        <div className="font-bold text-primary">
                                            {product.selling_price.toLocaleString()}원
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dynamic Form Elements */}
                    {formElements.map((el) => (
                        <div key={el.id} className="glass p-5 space-y-3">
                            {/* Label */}
                            {el.type !== 'Image' && el.type !== 'Notice' && (
                                <label className="block text-sm font-bold flex items-center gap-1">
                                    {el.label}
                                    {el.required && <span className="text-red-400">*</span>}
                                </label>
                            )}

                            {/* Render Input based on type */}
                            {el.type === 'Text' && (
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder={el.placeholder}
                                    value={answers[el.id] || ''}
                                    onChange={(e) => handleInputChange(el.id, e.target.value)}
                                    required={el.required}
                                />
                            )}

                            {el.type === 'TextArea' && (
                                <textarea
                                    className="input-field min-h-[100px]"
                                    placeholder={el.placeholder}
                                    value={answers[el.id] || ''}
                                    onChange={(e) => handleInputChange(el.id, e.target.value)}
                                    required={el.required}
                                />
                            )}

                            {el.type === 'Date' && (
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="input-field pl-12" // Increased padding
                                        value={answers[el.id] || ''}
                                        onChange={(e) => handleInputChange(el.id, e.target.value)}
                                        required={el.required}
                                    />
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                                </div>
                            )}

                            {el.type === 'Select' && (
                                <div className="relative">
                                    <select
                                        className="input-field appearance-none"
                                        value={answers[el.id] || ''}
                                        onChange={(e) => handleInputChange(el.id, e.target.value)}
                                        required={el.required}
                                    >
                                        <option value="">선택해주세요</option>
                                        {el.options.split(',').map((opt, i) => (
                                            <option key={i} value={opt.trim()}>{opt.trim()}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                                </div>
                            )}

                            {el.type === 'Radio' && (
                                <div className="space-y-2">
                                    {el.options.split(',').map((opt, i) => {
                                        const optionTrimmed = opt.trim();
                                        const isSelected = answers[el.id] === optionTrimmed;
                                        return (
                                            <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border-primary text-white' : 'border-white/10 hover:bg-white/5 text-text-muted'}`}>
                                                <input
                                                    type="radio"
                                                    name={`radio-${el.id}`}
                                                    value={optionTrimmed}
                                                    checked={isSelected}
                                                    onChange={(e) => handleInputChange(el.id, e.target.value)}
                                                    className="hidden"
                                                    required={el.required}
                                                />
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-primary' : 'border-white/30'}`}>
                                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                </div>
                                                <span className="text-sm font-medium">{optionTrimmed}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {el.type === 'Checkbox' && (
                                <div className="space-y-2">
                                    {el.options.split(',').map((opt, i) => {
                                        const optionTrimmed = opt.trim();
                                        const currentAnswers = (answers[el.id] as string[]) || [];
                                        const isChecked = currentAnswers.includes(optionTrimmed);
                                        return (
                                            <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-primary/10 border-primary text-white' : 'border-white/10 hover:bg-white/5 text-text-muted'}`}>
                                                <input
                                                    type="checkbox"
                                                    value={optionTrimmed}
                                                    checked={isChecked}
                                                    onChange={(e) => handleCheckboxChange(el.id, optionTrimmed, e.target.checked)}
                                                    className="hidden"
                                                />
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${isChecked ? 'bg-primary border-primary' : 'border-white/30'}`}>
                                                    {isChecked && <Check size={14} className="text-black" />}
                                                </div>
                                                <span className="text-sm font-medium">{optionTrimmed}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {el.type === 'Notice' && (
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm whitespace-pre-wrap text-text-muted leading-relaxed">
                                    {el.label}
                                </div>
                            )}

                            {el.type === 'Image' && el.options && (
                                <div className="rounded-xl overflow-hidden shadow-lg">
                                    <img src={el.options} alt="Shop Asset" className="w-full object-cover" />
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="glass p-6 space-y-6 border-t-2 border-t-emerald-500">
                        <h3 className="font-bold flex items-center gap-2">
                            <span className="w-2 h-6 bg-emerald-500 rounded-full" />
                            주문자 정보
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold">주문자 성함 <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="성함을 입력해주세요"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">연락처 <span className="text-red-400">*</span></label>
                                <input
                                    type="tel"
                                    className="input-field"
                                    placeholder="예: 010-1234-5678"
                                    value={customerPhone}
                                    onChange={handlePhoneChange}
                                    required
                                    maxLength={13}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 sticky bottom-6 border border-emerald-500/30 bg-gray-900/90 backdrop-blur shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-text-muted font-bold">총 주문 금액</span>
                            <span className="text-2xl font-black text-emerald-400">{totalPrice.toLocaleString()}원</span>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full btn btn-primary py-4 text-lg font-black shadow-xl shadow-primary/20"
                        >
                            {submitting ? <Loader2 className="animate-spin mx-auto" /> : '주문하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShopPage;
