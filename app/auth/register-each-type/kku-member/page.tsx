'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Upload, X, Loader2, ChevronDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import SimpleCombobox from '@/components/ui/simple-combobox';

const BUCKET = 'avatars';

// ---------- types ----------
type FormState = {
  prefix: string;
  prefix_other: string;
  first_name: string;
  last_name: string;

  phone: string;
  unit: string;
  unit_position: string;

  applicantPhoto?: File | null;   // รูปผู้สมัคร (avatar)
  citizen_card_url?: File | null; // บัตรประชาชน
  staff_card_url?: File | null;   // บัตรบุคลากรภายใน
};

type FieldName = keyof FormState;

// Error ต่อฟิลด์
type ErrorState = Partial<Record<FieldName, string>>;

// ---------- data ----------
const prefixes = ['นาย', 'นาง', 'นางสาว', 'อื่น ๆ'] as const;

// ---------- small input ----------
interface InputFieldProps {
  name: FieldName;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  pattern?: string;
  isSelect?: boolean;               // ไว้ใช้กับ <select> (ถ้าต้องการ)
  options?: readonly string[];
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  name, label, placeholder, value, onChange, type='text',
  inputMode, pattern, isSelect=false, options, error
}) => {
  // โฮเวอร์/โฟกัส สไตล์เดียวกับ combobox
  const baseCommon =
    "w-full rounded-lg border bg-white pl-4 pr-10 py-2 text-sm shadow-sm outline-none " +
    "transition-colors duration-150 ease-in-out focus:ring-1";
  const normalState =
    "border-gray-300 hover:border-gray-400 focus:border-gray-600 focus:ring-gray-600";
  const errorState = "border-red-500 focus:border-red-600 focus:ring-red-600";

  return (
    <div className="mb-4">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">{label}</label>

      {isSelect ? (
        <div className="relative">
          <select
            id={name}
            name={name}
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
            className={[
              baseCommon,
              error ? errorState : normalState,
              "appearance-none",
              value ? "text-gray-800" : "text-gray-400",
            ].join(" ")}
          >
            <option value="" disabled hidden>{placeholder}</option>
            {options?.map((option) => (
              <option key={option} value={option} className="py-2 px-3 text-sm text-gray-800">
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>
      ) : (
        <Input
          id={name}
          name={name}
          required
          type={type}
          inputMode={inputMode}
          pattern={pattern}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={[baseCommon, error ? errorState : normalState].join(" ")}
        />
      )}

      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

// ---------- page ----------
export default function KkuMemberForm() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [submitting, setSubmitting] = useState(false);

  const [applicantPreview, setApplicantPreview] = useState<string | null>(null);
  const [citizenPreview, setCitizenPreview] = useState<string | null>(null);
  const [staffPreview, setStaffPreview] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    prefix:'', prefix_other:'', first_name:'', last_name:'',
    phone:'', unit:'', unit_position:'',
    applicantPhoto: null, citizen_card_url: null, staff_card_url: null,
  });

  const [errors, setErrors] = useState<ErrorState>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log('SESSION:', !!data.session, data.session?.user?.email);
    });
    return () => {
      if (applicantPreview) URL.revokeObjectURL(applicantPreview);
      if (citizenPreview) URL.revokeObjectURL(citizenPreview);
      if (staffPreview) URL.revokeObjectURL(staffPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((s) => ({ ...s, [key]: val }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e)); // เคลียร์ error ช่องนั้น
  }

  // ===== preview handlers =====
  function onApplicantChange(file?: File | null) {
    handleChange('applicantPhoto', file ?? null);
    if (applicantPreview) URL.revokeObjectURL(applicantPreview);
    setApplicantPreview(file ? URL.createObjectURL(file) : null);
  }
  function onCitizenChange(file?: File | null) {
    handleChange('citizen_card_url', file ?? null);
    if (citizenPreview) URL.revokeObjectURL(citizenPreview);
    setCitizenPreview(file ? URL.createObjectURL(file) : null);
  }
  function onStaffChange(file?: File | null) {
    handleChange('staff_card_url', file ?? null);
    if (staffPreview) URL.revokeObjectURL(staffPreview);
    setStaffPreview(file ? URL.createObjectURL(file) : null);
  }

  // ===== smooth focus =====
  function getScrollParent(el: HTMLElement): HTMLElement | Window {
    let p: HTMLElement | null = el.parentElement;
    while (p) {
      const style = getComputedStyle(p);
      const canScroll =
        /(auto|scroll)/.test(style.overflowY) ||
        /(auto|scroll)/.test(style.overflow);
      if (canScroll && p.scrollHeight > p.clientHeight) return p;
      p = p.parentElement;
    }
    return window;
  }

  function focusFieldByName(name: string) {
    const el = document.querySelector<HTMLElement>(
      `[name="${name}"], [data-name="${name}"]`
    );
    if (!el) return;

    el.focus({ preventScroll: true } as any);

    const scroller = getScrollParent(el);
    if (scroller === window) {
      const rect = el.getBoundingClientRect();
      const targetY = rect.top + window.scrollY - window.innerHeight / 2;
      window.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
    } else {
      const parent = scroller as HTMLElement;
      const offsetTop = el.getBoundingClientRect().top - parent.getBoundingClientRect().top;
      const targetY = offsetTop + parent.scrollTop - parent.clientHeight / 2;
      parent.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
    }
  }

  // ===== helpers =====
  function normalizePhoneInput(v: string) {
    let s = v.replace(/\D/g, '');
    if (s.startsWith('66')) s = '0' + s.slice(2);
    return s.slice(0, 10);
  }

  /** upload แบบชื่อคงที่ + upsert */
  async function uploadFixed(file: File, userId: string, folder: 'avatar'|'citizen'|'staffcard') {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const key = `users/${userId}/${folder}/current.${ext}`;
    const { data, error } = await supabase.storage.from(BUCKET).upload(key, file, {
      upsert: true,
      cacheControl: '0',
      contentType: file.type || `image/${ext}`,
    });
    if (error) throw error;
    return data.path;
  }

  // ===== validate ทั้งฟอร์ม =====
  function validateAll(s: FormState) {
    const nextErrors: ErrorState = {};
    const prefixResolved = s.prefix === 'อื่น ๆ' ? s.prefix_other.trim() : s.prefix;

    if (!prefixResolved) nextErrors.prefix = 'โปรดระบุคำนำหน้า';
    if (s.prefix === 'อื่น ๆ' && !s.prefix_other.trim()) nextErrors.prefix_other = 'โปรดระบุคำนำหน้า';

    if (!s.first_name.trim()) nextErrors.first_name = 'โปรดกรอกชื่อ';
    if (!s.last_name.trim()) nextErrors.last_name = 'โปรดกรอกนามสกุล';

    if (!s.unit.trim()) nextErrors.unit = 'โปรดระบุสังกัด';
    if (!s.unit_position.trim()) nextErrors.unit_position = 'โปรดระบุตำแหน่ง';

    // phone (อนุโลมให้ว่างได้ แต่ถ้าใส่ต้องถูก)
    const digits = s.phone.trim().replace(/\D/g, '');
    if (!digits) {
      nextErrors.phone = 'โปรดกรอกเบอร์โทรติดต่อ';
    } else if (!/^0[689]/.test(digits)) {
      nextErrors.phone = 'เบอร์มือถือไทยต้องขึ้นต้น 06/08/09';
    } else if (digits.length < 10) {
      nextErrors.phone = 'กรุณากรอกให้ครบ 10 หลัก';
    } else if (!/^0[689]\d{8}$/.test(digits)) {
      nextErrors.phone = 'รูปแบบเบอร์ไม่ถูกต้อง';
    }

    // files (ต้องมีทั้งสามแบบ และ ≤ 1MB)
    if (!s.applicantPhoto) nextErrors.applicantPhoto = 'กรุณาอัปโหลดรูปถ่ายผู้สมัคร (ไม่เกิน 1MB)';
    else if (s.applicantPhoto.size > 1_000_000) nextErrors.applicantPhoto = 'รูปผู้สมัครเกิน 1MB';

    if (!s.citizen_card_url) nextErrors.citizen_card_url = 'กรุณาอัปโหลดสำเนาบัตรประชาชน (ไม่เกิน 1MB)';
    else if (s.citizen_card_url.size > 1_000_000) nextErrors.citizen_card_url = 'สำเนาบัตรประชาชนเกิน 1MB';

    if (!s.staff_card_url) nextErrors.staff_card_url = 'กรุณาอัปโหลดบัตรบุคลากร (ไม่เกิน 1MB)';
    else if (s.staff_card_url.size > 1_000_000) nextErrors.staff_card_url = 'บัตรบุคลากรเกิน 1MB';

    return { errors: nextErrors, prefixResolved };
  }

  // ===== submit =====
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const statusEl = document.getElementById('form-status');

    try {
      const { errors: nextErrors, prefixResolved } = validateAll(form);
      setErrors(nextErrors);

      const firstErrorKey = Object.keys(nextErrors)[0] as FieldName | undefined;
      if (firstErrorKey) {
        focusFieldByName(firstErrorKey);
        throw new Error('FORM_INVALID');
      }

      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error('กรุณาเข้าสู่ระบบก่อนลงทะเบียน');

      // uploads
      const avatarPath = await uploadFixed(form.applicantPhoto!, user.id, 'avatar');
      const citizenPath = await uploadFixed(form.citizen_card_url!, user.id, 'citizen');
      const staffPath = await uploadFixed(form.staff_card_url!, user.id, 'staffcard');

      const payload = {
        id: user.id,
        role: 'staff',
        prefix: prefixResolved,
        first_name: form.first_name,
        last_name: form.last_name,

        phone: form.phone || null,
        unit: form.unit,
        unit_position: form.unit_position,

        avatar_url: avatarPath,
        citizen_card_url: citizenPath,
        staff_card_url: staffPath,

        // เฉพาะ member: ฟิลด์อื่นไม่ใช้
        student_id: null,
        year: null,
        faculty: null,
        major: null,
        job: null,
        address: null,
        kku_mail: null,

        email_login: user.email ?? '',
      };

      const { error: upsertErr } = await supabase.from('user').upsert(payload, { onConflict: 'id' });
      if (upsertErr) throw upsertErr;

      if (statusEl) {
        statusEl.innerText = 'ส่งข้อมูลสำเร็จ';
        statusEl.className = 'mt-4 text-center text-green-600 font-bold';
      }
      router.push('/content/profile');
    } catch (err: any) {
      if (err?.message !== 'FORM_INVALID') {
        const statusEl = document.getElementById('form-status');
        if (statusEl) {
          statusEl.innerText = err?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล';
          statusEl.className = 'mt-4 text-center text-red-600 font-bold';
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-50 py-10">
      <div className="w-full max-w-xl px-4 md:px-0">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-700">ลงทะเบียนสมัครแข่งขัน</h1>
        </div>

        <div className="mb-12 flex w-full items-center gap-3 text-gray-500">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="text-sm md:text-base">บุคลากรมหาวิทยาลัยขอนแก่น</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-[0_0_25px_5px_rgba(0,0,0,0.07)] border border-gray-100 sm:p-8">
          <form onSubmit={onSubmit} noValidate>
            {/* คำนำหน้า: ใช้ SimpleCombobox (ไม่มีช่องค้นหา) */}
            <SimpleCombobox
              name="prefix"
              label="คำนำหน้า"
              placeholder="เลือกคำนำหน้า"
              value={form.prefix}
              onChange={(v) => handleChange('prefix', v)}
              options={prefixes}
              error={errors.prefix}
            />

            {form.prefix === 'อื่น ๆ' && (
              <div className="mt-2">
                <label htmlFor="prefix_other" className="mb-1 block text-xs text-gray-500">ระบุคำนำหน้า</label>
                <Input
                  id="prefix_other" name="prefix_other"
                  required value={form.prefix_other}
                  onChange={(e) => handleChange('prefix_other', e.target.value)}
                  placeholder="เช่น ดร., อาจารย์, คุณ, Mr., Ms."
                  maxLength={20} aria-label="ระบุคำนำหน้าเอง"
                  aria-invalid={!!errors.prefix_other}
                  aria-describedby={errors.prefix_other ? 'prefix_other-error' : undefined}
                  className={errors.prefix_other ? 'border-red-500 focus-visible:ring-red-600 focus-visible:border-red-600' : ''}
                />
                {errors.prefix_other
                  ? <p id="prefix_other-error" className="mt-1 mb-3 text-xs text-red-600">{errors.prefix_other}</p>
                  : <p className="mt-[5px] mb-3 px-2 text-[11px] text-gray-400">กำหนดเองได้สูงสุด 20 ตัวอักษร</p>
                }
              </div>
            )}

            <InputField
              name="first_name"
              label="ชื่อ"
              placeholder="ชื่อ (ไม่ต้องใส่คำนำหน้า)"
              value={form.first_name}
              onChange={(v) => handleChange('first_name', v)}
              error={errors.first_name}
            />
            <InputField
              name="last_name"
              label="นามสกุล"
              placeholder="นามสกุล"
              value={form.last_name}
              onChange={(v) => handleChange('last_name', v)}
              error={errors.last_name}
            />

            <InputField
              name="phone"
              label="เบอร์โทรติดต่อ"
              placeholder="0XXXXXXXXX"
              value={form.phone}
              type="tel"
              inputMode="tel"
              onChange={(v) => handleChange('phone', normalizePhoneInput(v))}
              pattern="^0[689]\d{8}$"
              error={errors.phone}
            />

            <InputField
              name="unit"
              label="สังกัด"
              placeholder="คณะ/หน่วยงาน"
              value={form.unit}
              onChange={(v) => handleChange('unit', v)}
              error={errors.unit}
            />
            <InputField
              name="unit_position"
              label="ตำแหน่ง"
              placeholder="เช่น อาจารย์, นักวิชาการคอมพิวเตอร์"
              value={form.unit_position}
              onChange={(v) => handleChange('unit_position', v)}
              error={errors.unit_position}
            />

            {/* รูปผู้สมัคร */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">รูปถ่ายผู้สมัคร</label>
              <div className="relative">
                <label
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-white px-4 py-2 text-sm shadow-sm transition
                    ${errors.applicantPhoto
                      ? 'border-red-500 hover:border-red-600'
                      : applicantPreview
                        ? 'border-green-400 hover:border-green-500'
                        : 'border-dashed border-gray-300 hover:border-gray-400'}`}
                  data-name="applicantPhoto"
                >
                  <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${applicantPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {form.applicantPhoto ? form.applicantPhoto.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                    </span>
                  </div>
                  <input
                    id="applicantPhoto" name="applicantPhoto"
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => onApplicantChange(e.target.files?.[0])} required
                    aria-invalid={!!errors.applicantPhoto}
                    aria-describedby={errors.applicantPhoto ? 'applicantPhoto-error' : undefined}
                  />
                </label>

                {errors.applicantPhoto && (
                  <p id="applicantPhoto-error" className="mt-1 text-xs text-red-600">{errors.applicantPhoto}</p>
                )}

                {applicantPreview && (
                  <div className={`mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 shadow-md
                    ${errors.applicantPhoto ? 'border-red-500' : 'border-green-500'}`}>
                    <button
                      type="button" onClick={() => onApplicantChange(null)}
                      className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition"
                      aria-label="ลบรูปภาพ"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={applicantPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* สำเนาบัตรประชาชน */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">สำเนาบัตรประชาชน</label>
              <div className="relative">
                <label
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-white px-4 py-2 text-sm shadow-sm transition
                    ${errors.citizen_card_url
                      ? 'border-red-500 hover:border-red-600'
                      : citizenPreview
                        ? 'border-green-400 hover:border-green-500'
                        : 'border-dashed border-gray-300 hover:border-gray-400'}`}
                  data-name="citizen_card_url"
                >
                  <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${citizenPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {form.citizen_card_url ? form.citizen_card_url.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                    </span>
                  </div>
                  <input
                    id="citizen_card_url" name="citizen_card_url"
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => onCitizenChange(e.target.files?.[0])} required
                    aria-invalid={!!errors.citizen_card_url}
                    aria-describedby={errors.citizen_card_url ? 'citizen_card_url-error' : undefined}
                  />
                </label>

                {errors.citizen_card_url && (
                  <p id="citizen_card_url-error" className="mt-1 text-xs text-red-600">{errors.citizen_card_url}</p>
                )}

                {citizenPreview && (
                  <div className={`mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 shadow-md
                    ${errors.citizen_card_url ? 'border-red-500' : 'border-green-500'}`}>
                    <button
                      type="button" onClick={() => onCitizenChange(null)}
                      className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition"
                      aria-label="ลบรูปภาพ"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={citizenPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* บัตรบุคลากร */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">บัตรแสดงตนว่าเป็นบุคลากรภายใน</label>
              <div className="relative">
                <label
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-white px-4 py-2 text-sm shadow-sm transition
                    ${errors.staff_card_url
                      ? 'border-red-500 hover:border-red-600'
                      : staffPreview
                        ? 'border-green-400 hover:border-green-500'
                        : 'border-dashed border-gray-300 hover:border-gray-400'}`}
                  data-name="staff_card_url"
                >
                  <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${staffPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {form.staff_card_url ? form.staff_card_url.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                    </span>
                  </div>
                  <input
                    id="staff_card_url" name="staff_card_url"
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => onStaffChange(e.target.files?.[0])} required
                    aria-invalid={!!errors.staff_card_url}
                    aria-describedby={errors.staff_card_url ? 'staff_card_url-error' : undefined}
                  />
                </label>

                {errors.staff_card_url && (
                  <p id="staff_card_url-error" className="mt-1 text-xs text-red-600">{errors.staff_card_url}</p>
                )}

                {staffPreview && (
                  <div className={`mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 shadow-md
                    ${errors.staff_card_url ? 'border-red-500' : 'border-green-500'}`}>
                    <button
                      type="button" onClick={() => onStaffChange(null)}
                      className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition"
                      aria-label="ลบรูปภาพ"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={staffPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit" disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-500 px-5 py-3 text-white text-base font-semibold shadow-[0_0_25px_5px_rgba(0,0,0,0.07)] transition duration-300 hover:bg-green-600 disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังส่งข้อมูล...
                </span>
              ) : 'ยืนยันการลงทะเบียน'}
            </button>
            <div id="form-status" className="mt-4 text-center text-sm"></div>
          </form>
        </div>

        <div className="mt-8 text-xs text-gray-500 text-center">
          ระบบลงทะเบียนแข่งขันยิงปืน มหาวิทยาลัยขอนแก่น
        </div>
      </div>
    </div>
  );
}
