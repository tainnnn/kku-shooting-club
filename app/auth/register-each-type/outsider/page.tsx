'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import SimpleCombobox from '@/components/ui/simple-combobox';
import FacultyCombobox from '@/components/ui/faculty-combobox'; // ใช้เป็น combobox แบบมี search สำหรับ "อาชีพ"

const BUCKET = 'avatars'; // ใช้ bucket ที่ตั้ง policy แล้ว (private + RLS)

/* ---------- types ---------- */
type FormState = {
  prefix: string;
  prefix_other: string;
  first_name: string;
  last_name: string;
  phone: string;

  job: string;         // ใช้ combobox
  job_other: string;   // กรอกเองเมื่อเลือก "อื่น ๆ"

  address: string;

  applicantPhoto?: File | null;   // avatar (required)
  citizen_card_url?: File | null; // บัตรประชาชน (required)
};

type FieldName = keyof FormState;
type ErrorState = Partial<Record<FieldName, string>>;

const prefixes = ['นาย', 'นาง', 'นางสาว', 'อื่น ๆ'] as const;

// ตัวอย่างอาชีพยอดฮิต + “อื่น ๆ”
const jobOptions = [
  'นักเรียน/นักศึกษา','อาจารย์','ข้าราชการ','พนักงานมหาวิทยาลัย',
  'แพทย์','พยาบาล','วิศวกร','นักวิชาการคอมพิวเตอร์',
  'พนักงานบริษัทเอกชน','ผู้ประกอบการ/เจ้าของกิจการ',
  'ฟรีแลนซ์','เกษตรกร','ว่างงาน','เกษียณอายุ',
  'อื่น ๆ',
] as const;

/* ---------- InputField (hover + error, รองรับ textarea auto-resize) ---------- */
interface InputFieldProps {
  name: FieldName;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  pattern?: string;
  isTextArea?: boolean;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  name, label, placeholder, value, onChange, type='text', inputMode, pattern, isTextArea=false, error
}) => {
  const baseCommon =
    "w-full rounded-lg border bg-white text-sm shadow-sm outline-none " +
    "transition-colors duration-150 ease-in-out focus:ring-1";
  const normalState =
    "border-gray-300 hover:border-gray-400 focus:border-gray-600 focus:ring-gray-600";
  const errorState =
    "border-red-500 focus:border-red-600 focus:ring-red-600";

  // auto-resize สำหรับ textarea
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (isTextArea && taRef.current) {
      const ta = taRef.current;
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [isTextArea, value]);

  return (
    <div className="mb-4">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">{label}</label>

      {isTextArea ? (
        <textarea
          id={name} name={name} ref={taRef}
          required
          rows={2} // เริ่มต้นประมาณ 2 บรรทัด
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={[
            baseCommon,
            error ? errorState : normalState,
            "px-4 py-2 text-gray-800 overflow-hidden resize-none"
          ].join(" ")}
        />
      ) : (
        <Input
          id={name} name={name}
          required type={type} inputMode={inputMode} pattern={pattern}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={[
            baseCommon,
            error ? errorState : normalState,
            "px-4 py-2"
          ].join(" ")}
        />
      )}

      {error && <p id={`${name}-error`} className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

/* ---------- page ---------- */
export default function OutsideRegistrationForm() {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [submitting, setSubmitting] = useState(false);
  const [applicantPhotoPreview, setApplicantPhotoPreview] = useState<string | null>(null);
  const [citizenPreview,   setCitizenPreview] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    prefix:'', prefix_other:'', first_name:'', last_name:'',
    phone:'', job:'', job_other:'', address:'',
    applicantPhoto: null, citizen_card_url: null,
  });

  const [errors, setErrors] = useState<ErrorState>({});

  useEffect(() => {
    return () => {
      if (applicantPhotoPreview) URL.revokeObjectURL(applicantPhotoPreview);
      if (citizenPreview) URL.revokeObjectURL(citizenPreview);
    };
  }, [applicantPhotoPreview, citizenPreview]);

  function handleChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(s => ({ ...s, [key]: val }));
    setErrors(e => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function onApplicantPhotoChange(file?: File | null) {
    handleChange('applicantPhoto', file ?? null);
    setApplicantPhotoPreview(file ? URL.createObjectURL(file) : null);
  }
  function onCitizenChange(file?: File | null) {
    handleChange('citizen_card_url', file ?? null);
    setCitizenPreview(file ? URL.createObjectURL(file) : null);
  }

  // เบอร์ไทย: normalize เป็น 0XXXXXXXXX
  function normalizePhoneInput(v: string) {
    let s = v.replace(/\D/g, '');
    if (s.startsWith('66')) s = '0' + s.slice(2);
    return s.slice(0, 10);
  }

  /* ---------- smooth focus ---------- */
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
    const el = document.querySelector<HTMLElement>(`[name="${name}"], [data-name="${name}"]`);
    if (!el) return;
    (el as any).focus?.({ preventScroll: true });

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

  /** อัปโหลดชื่อไฟล์คงที่ + upsert กันการสร้างไฟล์ซ้ำ */
  async function uploadFixed(file: File, userId: string, folder: 'avatar'|'citizen') {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const key = `users/${userId}/${folder}/current.${ext}`;
    const { data, error } = await supabase.storage.from(BUCKET).upload(key, file, {
      upsert: true,
      cacheControl: '0',
      contentType: file.type || `image/${ext}`,
    });
    if (error) {
      if (error.message?.toLowerCase().includes('no api key')) {
        throw new Error('ไม่พบ API key: กรุณาเช็ค NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ใน .env.local แล้ว restart dev server');
      }
      throw error;
    }
    return data.path;
  }

  /* ---------- validate ---------- */
  function validateAll(s: FormState) {
    const next: ErrorState = {};

    // ---- คำนำหน้า: ถ้าเลือก "อื่น ๆ" ให้ชี้ error ไปช่องรองเท่านั้น
    const prefixResolved =
      s.prefix === 'อื่น ๆ' ? (s.prefix_other || '').trim() : (s.prefix || '').trim();

    if (s.prefix === 'อื่น ๆ') {
      if (!prefixResolved) next.prefix_other = 'โปรดระบุคำนำหน้า';
    } else {
      if (!prefixResolved) next.prefix = 'โปรดระบุคำนำหน้า';
    }

    // ---- ชื่อ / นามสกุล
    if (!s.first_name.trim()) next.first_name = 'โปรดกรอกชื่อ';
    if (!s.last_name.trim())  next.last_name  = 'โปรดกรอกนามสกุล';

    // ---- เบอร์โทร (บังคับ + ฟอร์แมตไทย)
    const digits = (s.phone ?? '').trim().replace(/\D/g, '');
    if (!digits) {
      next.phone = 'โปรดกรอกเบอร์โทรติดต่อ';
    } else if (!/^0[689]/.test(digits)) {
      next.phone = 'เบอร์มือถือไทยต้องขึ้นต้น 06/08/09';
    } else if (digits.length < 10) {
      next.phone = 'กรุณากรอกให้ครบ 10 หลัก';
    } else if (!/^0[689]\d{8}$/.test(digits)) {
      next.phone = 'รูปแบบเบอร์ไม่ถูกต้อง';
    }

    // ---- อาชีพ: ถ้าเลือก "อื่น ๆ" ให้ชี้ error ไปช่องรองเท่านั้น
    if (s.job === 'อื่น ๆ') {
      if (!(s.job_other || '').trim()) next.job_other = 'โปรดระบุอาชีพ';
    } else {
      if (!s.job) next.job = 'โปรดเลือกอาชีพ';
    }

    // ---- ที่อยู่ (บังคับ)
    if (!s.address.trim()) next.address = 'โปรดระบุที่อยู่';

    // ---- ไฟล์
    if (!s.applicantPhoto) next.applicantPhoto = 'กรุณาอัพโหลดรูปภาพ (ไม่เกิน 1MB)';
    else if (s.applicantPhoto.size > 1_000_000) next.applicantPhoto = 'รูปภาพเกิน 1MB';

    if (!s.citizen_card_url) next.citizen_card_url = 'กรุณาอัพโหลดสำเนาบัตรประชาชน (ไม่เกิน 1MB)';
    else if (s.citizen_card_url.size > 1_000_000) next.citizen_card_url = 'สำเนาบัตรประชาชนเกิน 1MB';

    return { errors: next, prefixResolved }; // เหมือนเดิม ไม่เพิ่ม/ลดค่า return อื่น
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const statusEl = document.getElementById('form-status');

    try {
      const { errors: nextErrors, prefixResolved } = validateAll(form);
      setErrors(nextErrors);

      const firstErrorKey = Object.keys(nextErrors)[0] as keyof ErrorState | undefined;
      if (firstErrorKey) {
        focusFieldByName(firstErrorKey);
        throw new Error('FORM_INVALID');
      }

      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error('กรุณาเข้าสู่ระบบก่อนลงทะเบียน');

      // อัปโหลด
      let avatarPath: string | null = null;
      let citizenPath: string | null = null;

      if (form.applicantPhoto) {
        avatarPath = await uploadFixed(form.applicantPhoto, user.id, 'avatar');
      }
      if (form.citizen_card_url) {
        citizenPath = await uploadFixed(form.citizen_card_url, user.id, 'citizen');
      }

      // ✅ คำนวณอาชีพที่ใช้จริง
      const jobResolved = form.job === 'อื่น ๆ'
        ? (form.job_other || '').trim()
        : form.job.trim();

      if (!prefixResolved) throw new Error('โปรดระบุคำนำหน้า');
      if (!jobResolved)    throw new Error('โปรดระบุอาชีพ');
      if (!form.address.trim()) throw new Error('โปรดระบุที่อยู่');

      const payload = {
        id: user.id,
        role: 'outside',
        prefix: prefixResolved,
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),

        phone: rawOrNull(form.phone),
        job:   jobResolved,
        address: form.address.trim(),

        avatar_url: avatarPath,
        citizen_card_url: citizenPath,
        staff_card_url: null,

        student_id: null,
        year: null,
        faculty: null,
        major: null,
        unit: null,
        unit_position: null,
        kku_mail: null,

        email_login: user.email ?? '',
      };

      const { error: upsertErr } = await supabase.from('user').upsert(payload, { onConflict: 'id' });
      if (upsertErr) {
        if (String(upsertErr.message).includes('user_kku_mail_role_check')) {
          throw new Error('ลงทะเบียนไม่ผ่าน: โปรดเช็ค constraint user_kku_mail_role_check ให้ allow role=outside ที่ kku_mail เป็น NULL');
        }
        throw upsertErr;
      }

      if (statusEl) {
        statusEl.innerText = 'ส่งข้อมูลสำเร็จ';
        statusEl.className = 'mt-4 text-center text-green-600 font-bold';
      }
      router.push('/content/profile');
    } catch (err: any) {
      if (err?.message !== 'FORM_INVALID') {
        if (statusEl) {
          statusEl.innerText = err?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล';
          statusEl.className = 'mt-4 text-center text-red-600 font-bold';
        }
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function rawOrNull(s: string) {
    const t = s.trim();
    return t ? t : null;
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-50 py-10">
      <div className="w-full max-w-xl px-4 md:px-0">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-700">ลงทะเบียนสมัครแข่งขัน</h1>
        </div>

        <div className="mb-12 flex w-full items-center gap-3 text-gray-500">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="text-sm md:text-base">บุคคลภายนอก</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-[0_0_25px_5px_rgba(0,0,0,0.07)] border border-gray-100 sm:p-8">
          <form onSubmit={onSubmit} noValidate>
            {/* คำนำหน้า – SimpleCombobox */}
            <SimpleCombobox
              name="prefix"
              label="คำนำหน้า"
              placeholder="เลือกคำนำหน้า"
              value={form.prefix}
              onChange={(v) => handleChange('prefix', v)}
              options={prefixes}
              error={form.prefix === 'อื่น ๆ' ? undefined : (errors as any).prefix}  // << ถ้าเลือก “อื่น ๆ” ไม่ส่ง error ให้ช่องหลัก
            />

            {form.prefix === 'อื่น ๆ' && (
              <div className="mt-2 mb-4">
                <label htmlFor="prefix_other" className="mb-1 block text-xs text-gray-500">ระบุคำนำหน้า</label>
                <Input
                  id="prefix_other"
                  name="prefix_other"
                  required
                  value={form.prefix_other}
                  onChange={(e) => handleChange('prefix_other', e.target.value)}
                  placeholder="เช่น ดร., อาจารย์, คุณ, Mr., Ms."
                  maxLength={20}
                  aria-invalid={!!(errors as any).prefix_other}
                  aria-describedby={(errors as any).prefix_other ? 'prefix_other-error' : undefined}
                  className={(errors as any).prefix_other ? 'border-red-500 focus-visible:ring-red-600 focus-visible:border-red-600' : ''}
            />
                {(errors as any).prefix_other && (
                  <p id="prefix_other-error" className="mt-1 mb-3 text-xs text-red-600">{(errors as any).prefix_other}</p>
                )}
              </div>
            )}

            <InputField
              name="first_name"
              label="ชื่อ"
              placeholder="ชื่อ (ไม่ต้องใส่คำนำหน้า)"
              value={form.first_name}
              onChange={(v)=>handleChange('first_name', v)}
              error={errors.first_name}
            />
            <InputField
              name="last_name"
              label="นามสกุล"
              placeholder="นามสกุล"
              value={form.last_name}
              onChange={(v)=>handleChange('last_name', v)}
              error={errors.last_name}
            />

            <InputField
              name="phone"
              label="เบอร์โทรติดต่อ"
              placeholder="0XXXXXXXXX"
              value={form.phone}
              type="tel"
              inputMode="tel"
              onChange={(v)=>handleChange('phone', normalizePhoneInput(v))}
              pattern="^0[689]\d{8}$"
              error={errors.phone}
            />

            {/* อาชีพ */}
            <SimpleCombobox
                name="job"
                label="อาชีพ"
                placeholder="ค้นหา/เลือกอาชีพ"
                value={form.job}
                onChange={(v) => handleChange('job', v)}
                options={jobOptions}
                error={errors?.job}
              />

            {form.job === 'อื่น ๆ' && (
              <div className="mt-2">
                <label htmlFor="job_other" className="mb-1 block text-xs text-gray-500">
                  ระบุอาชีพ
                </label>
                <Input
                  id="job_other"
                  name="job_other"
                  required
                  value={form.job_other ?? ''}
                  onChange={(e) => handleChange('job_other' as any, e.target.value)}
                  placeholder="กรอกชื่ออาชีพ"
                  aria-invalid={!!errors?.job_other}
                  aria-describedby={errors?.job_other ? 'job_other-error' : undefined}
                  className={errors?.job_other ? 'border-red-500 focus-visible:ring-red-600 focus-visible:border-red-600' : ''}
                />
                {errors?.job_other && (
                  <p id="job_other-error" className="mt-1 mb-3 text-xs text-red-600">
                    {errors.job_other}
                  </p>
                )}
              </div>
            )}

            <InputField
              name="address"
              label="ที่อยู่"
              placeholder="บ้านเลขที่, หมู่, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์"
              value={form.address}
              onChange={(v)=>handleChange('address', v)}
              isTextArea
              error={errors.address}
            />

            {/* รูปผู้สมัคร (required) */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">รูปถ่ายผู้สมัคร</label>
              <div className="relative">
                <label
                  className={[
                    "flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-white px-4 py-2 text-sm shadow-sm transition",
                    errors.applicantPhoto
                      ? "border-red-500 hover:border-red-600"
                      : applicantPhotoPreview
                        ? "border-green-400 hover:border-green-500"
                        : "border-dashed border-gray-300 hover:border-gray-400"
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${applicantPhotoPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {form.applicantPhoto ? form.applicantPhoto.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                    </span>
                  </div>
                  <input
                    id="applicantPhoto" name="applicantPhoto"
                    type="file" accept="image/*" className="hidden"
                    onChange={(e)=>onApplicantPhotoChange(e.target.files?.[0])} required
                    aria-invalid={!!errors.applicantPhoto}
                    aria-describedby={errors.applicantPhoto ? 'applicantPhoto-error' : undefined}
                  />
                </label>
                {errors.applicantPhoto && (
                  <p id="applicantPhoto-error" className="mt-1 text-xs text-red-600">{errors.applicantPhoto}</p>
                )}

                {applicantPhotoPreview && (
                  <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                    <button
                      type="button" onClick={()=>onApplicantPhotoChange(null)}
                      className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition"
                      aria-label="ลบรูปภาพ"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={applicantPhotoPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* สำเนาบัตรประชาชน (required) */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">สำเนาบัตรประชาชน</label>
              <div className="relative">
                <label
                  className={[
                    "flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-white px-4 py-2 text-sm shadow-sm transition",
                    errors.citizen_card_url
                      ? "border-red-500 hover:border-red-600"
                      : citizenPreview
                        ? "border-green-400 hover:border-green-500"
                        : "border-dashed border-gray-300 hover:border-gray-400"
                  ].join(" ")}
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
                    onChange={(e)=>onCitizenChange(e.target.files?.[0])} required
                    aria-invalid={!!errors.citizen_card_url}
                    aria-describedby={errors.citizen_card_url ? 'citizen_card_url-error' : undefined}
                  />
                </label>
                {errors.citizen_card_url && (
                  <p id="citizen_card_url-error" className="mt-1 text-xs text-red-600">{errors.citizen_card_url}</p>
                )}

                {citizenPreview && (
                  <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                    <button
                      type="button" onClick={()=>onCitizenChange(null)}
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
