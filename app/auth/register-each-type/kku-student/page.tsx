'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Upload, X, Loader2, ChevronDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import  FacultyCombobox  from '@/components/ui/faculty-combobox';
import SimpleCombobox from '@/components/ui/simple-combobox';

// ---------- types ----------
type FormState = {
  prefix: string;
  prefix_other: string;
  first_name: string;
  last_name: string;
  student_id: string;
  year: string;
  faculty: string;
  faculty_other: string;
  major: string;
  kku_mail: string;
  phone: string;
  photo?: File | null;
};

type FieldName = keyof FormState;

// เก็บ error ต่อฟิลด์ (ถ้าไม่มี ให้เป็น undefined)
type ErrorState = Partial<Record<FieldName, string>>;

// ---------- data ----------
const faculties = [
    // กลุ่มวิทยาศาสตร์และเทคโนโลยี
    'คณะเกษตรศาสตร์',
    'คณะเทคโนโลยี',
    'คณะวิศวกรรมศาสตร์',
    'คณะวิทยาศาสตร์',
    'คณะสถาปัตยกรรมศาสตร์',
    'วิทยาลัยการคอมพิวเตอร์',

    // กลุ่มวิทยาศาสตร์สุขภาพ
    'คณะพยาบาลศาสตร์',
    'คณะแพทยศาสตร์',
    'คณะเทคนิคการแพทย์',
    'คณะสาธารณสุขศาสตร์',
    'คณะทันตแพทยศาสตร์',
    'คณะเภสัชศาสตร์',
    'คณะสัตวแพทยศาสตร์',

    // กลุ่มมนุษยศาสตร์และสังคมศาสตร์
    'คณะศึกษาศาสตร์',
    'คณะมนุษยศาสตร์และสังคมศาสตร์',
    'คณะศิลปกรรมศาสตร์',
    'คณะนิติศาสตร์',
    'คณะเศรษฐศาสตร์',
    'คณะบริหารธุรกิจและการบัญชี',

    // วิทยาลัย/บัณฑิตศึกษา (หากเปิดรับในระบบเดียวกัน)
    'วิทยาลัยการปกครองท้องถิ่น',
    'วิทยาลัยนานาชาติ',
    'วิทยาลัยบัณฑิตศึกษาการจัดการ',
    'บัณฑิตวิทยาลัย',

    // เผื่อกรอกชื่อหน่วยงานอื่น ๆ เอง
    'อื่น ๆ',
] as const;

const prefixes = ['นาย','นาง','นางสาว','อื่น ๆ'] as const;

const BUCKET = 'avatars'; // ใช้บัคเก็ตนี้ตามที่ตั้งไว้ใน Supabase

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
  isSelect?: boolean;
  options?: readonly string[];
  error?: string; // << แสดงข้อความ error ใต้ฟิลด์
}

  const InputField: React.FC<InputFieldProps> = ({
    name, label, placeholder, value, onChange, type='text',
    inputMode, pattern, isSelect=false, options, error
  }) => {
    // สไตล์ฐาน + แยกสถานะปกติ/มี error (hover จะทำงานเฉพาะตอนไม่มี error)
    const baseCommon =
      "w-full rounded-lg border bg-white pl-4 pr-10 py-2 text-sm shadow-sm outline-none " +
      "transition-colors duration-150 ease-in-out focus:ring-1";

    const normalState =
      "border-gray-300 hover:border-gray-400 focus:border-gray-600 focus:ring-gray-600";

    const errorState =
      "border-red-500 focus:border-red-600 focus:ring-red-600";

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
            className={[
              baseCommon,
              error ? errorState : normalState,
            ].join(" ")}
          />
        )}

        {error && (
          <p id={`${name}-error`} className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  };

// ---------- page ----------
export default function RegistrationForm() {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    prefix:'', prefix_other:'', first_name:'', last_name:'',
    student_id:'', year:'', faculty:'', faculty_other:'',
    major:'', kku_mail:'', phone:'', photo:null,
  });

  const [errors, setErrors] = useState<ErrorState>({}); // << เก็บ error ต่อช่อง

  useEffect(() => {
    // debug session
    supabase.auth.getSession().then(({data})=>{
      console.log('SESSION USER:', data.session?.user?.email);
    });
  }, [supabase]);

  function handleChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((s) => ({ ...s, [key]: val }));
    // เคลียร์ error ของช่องที่แก้
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function onPhotoChange(file?: File | null) {
    handleChange('photo', file ?? null);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  // ปรับเบอร์ให้อยู่รูปแบบ 0XXXXXXXXX และไม่เกิน 10 หลัก
  function normalizePhoneInput(v: string) {
    let s = v.replace(/\D/g, '');
    if (s.startsWith('66')) s = '0' + s.slice(2); // +66 / 66 -> 0
    return s.slice(0, 10);
  }

    // หาพาเรนต์ที่เลื่อนได้
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

      // โฟกัสแบบไม่ให้เบราว์เซอร์เลื่อนเอง
      el.focus({ preventScroll: true } as any);

      const scroller = getScrollParent(el);

      if (scroller === window) {
        const rect = el.getBoundingClientRect();
        const targetY = rect.top + window.scrollY - window.innerHeight / 2;
        window.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
      } else {
        const parent = scroller as HTMLElement;
        // คำนวณตำแหน่งภายในพาเรนต์
        const offsetTop = el.getBoundingClientRect().top - parent.getBoundingClientRect().top;
        const targetY = offsetTop + parent.scrollTop - parent.clientHeight / 2;
        parent.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
      }
    }

  /** อัพโหลดแบบ "ทับไฟล์เดิม" เพื่อกันไฟล์ซ้ำสะสม */
  async function uploadFixed(file: File, userId: string) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const key = `users/${userId}/avatar/current.${ext}`; // ชื่อคงที่
    const { data, error } = await supabase.storage.from(BUCKET).upload(key, file, {
      upsert: true,        // <- สำคัญ: ทับไฟล์เดิม
      cacheControl: '0',
      contentType: file.type || `image/${ext}`,
    });
    if (error) throw error;
    return data.path; // เก็บ path นี้ลง DB
  }

  // ----- validate ทั้งฟอร์ม แล้วคืน errors + ค่าที่ resolve แล้ว -----
  function validateAll(s: FormState) {
    const nextErrors: ErrorState = {};
    const prefixResolved  = s.prefix  === 'อื่น ๆ' ? s.prefix_other.trim()  : s.prefix;
    const facultyResolved = s.faculty === 'อื่น ๆ' ? s.faculty_other.trim() : s.faculty;
    const rawPhone = s.phone.trim();
    const digits = rawPhone.replace(/\D/g, '');

    // required ขั้นพื้นฐาน
    if (!prefixResolved) nextErrors.prefix = 'โปรดระบุคำนำหน้า';
    if (s.prefix === 'อื่น ๆ' && !s.prefix_other.trim()) nextErrors.prefix_other = 'โปรดระบุคำนำหน้า';

    if (!s.first_name.trim()) nextErrors.first_name = 'โปรดกรอกชื่อ';
    if (!s.last_name.trim()) nextErrors.last_name = 'โปรดกรอกนามสกุล';

    if (!s.student_id.trim()) nextErrors.student_id = 'โปรดกรอกรหัสนักศึกษา';
    else if (!/^\d{10}$/.test(s.student_id.trim()))
      nextErrors.student_id = 'กรุณากรอกรหัสนักศึกษาให้ครบ 10 หลัก';

    if (!s.year) nextErrors.year = 'โปรดเลือกชั้นปี';
    else {
      const y = Number(s.year);
      if (!y || !Number.isInteger(y)) nextErrors.year = 'โปรดเลือกชั้นปีให้ถูกต้อง';
    }

    if (!facultyResolved) nextErrors.faculty = 'โปรดระบุคณะ';
    if (s.faculty === 'อื่น ๆ' && !s.faculty_other.trim()) nextErrors.faculty_other = 'โปรดระบุคณะ';

    if (!s.major.trim()) nextErrors.major = 'โปรดกรอกสาขา';

    if (!s.kku_mail.trim()) nextErrors.kku_mail = 'โปรดกรอกอีเมล';
    else if (!/^[^@]+@kkumail\.com$/i.test(s.kku_mail.trim())) nextErrors.kku_mail = 'กรุณาใช้อีเมล @kkumail.com';

    if (!digits) {
        nextErrors.phone = 'โปรดกรอกเบอร์โทร';
      } else {
        const hasGoodPrefix = /^0[689]/.test(digits); // แค่เช็กว่าขึ้นต้น 06/08/09 หรือยัง (ไม่จำเป็นต้องครบ 10)

        if (!hasGoodPrefix) {
          // ยังไม่กรอก 06/08/09 เลย
          nextErrors.phone = 'เบอร์มือถือไทยต้องขึ้นต้น 06/08/09';
        } else if (digits.length < 10) {
          // มี 06/08/09 แล้ว แต่ยังไม่ครบ 10 หลัก
          nextErrors.phone = 'กรุณากรอกเบอร์โทรติดต่อให้ครบ 10 หลัก';
        } else if (!/^0[689]\d{8}$/.test(digits)) {
          // ครบ 10 แต่รูปแบบหลุด (กันเคสยาวเกิน/อักขระแทรก)
          nextErrors.phone = 'เบอร์มือถือไทยต้องขึ้นต้น 06/08/09';
        }
      }

    if (!s.photo) nextErrors.photo = 'กรุณาอัพโหลดรูปภาพ (ไม่เกิน 1MB)';
    else if (s.photo.size > 1_000_000) nextErrors.photo = 'รูปภาพเกิน 1MB';

    return { errors: nextErrors, prefixResolved, facultyResolved };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const statusEl = document.getElementById('form-status');

    // helper แสดงข้อความบน status bar ด้านล่าง
    const showSuccess = (msg: string) => {
        if (statusEl) {
          statusEl.innerText = msg;
          statusEl.className = 'mt-4 text-center text-green-600 font-bold';
        }
      };

    try {
      // ===== (A) validate ทั้งหมดและชี้ error ทีละช่อง =====
      const { errors: nextErrors, prefixResolved, facultyResolved } = validateAll(form);
      setErrors(nextErrors);

      const firstErrorKey = Object.keys(nextErrors)[0] as FieldName | undefined;
      if (firstErrorKey) {
        focusFieldByName(firstErrorKey);
        throw new Error('FORM_INVALID');
      }

      // ===== (B) auth + upload + upsert =====
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error('กรุณาเข้าสู่ระบบก่อนลงทะเบียน');

      // upload avatar
      let avatarPath: string | null = null;
      if (form.photo) {
        avatarPath = await uploadFixed(form.photo, user.id);
      }

      const payload = {
        id: user.id,
        role: 'student',
        prefix: prefixResolved,
        first_name: form.first_name,
        last_name: form.last_name,
        student_id: form.student_id.trim(),
        year: Number(form.year),
        faculty: facultyResolved,
        major: form.major,
        kku_mail: form.kku_mail.trim(),
        phone: form.phone || null,
        avatar_url: avatarPath,
        citizen_card_url: null,
        staff_card_url: null,
        email_login: user.email ?? '',
        unit: null,
        unit_position: null,
        job: null,
        address: null,
      };

      const { error: upsertErr } = await supabase.from('user').upsert(payload, { onConflict: 'id' });
      if (upsertErr) throw upsertErr;

      showSuccess('ส่งข้อมูลสำเร็จ');
      router.push('/content/profile');
    } catch (err: any) {
      // ไม่ต้องเขียน error ลง statusEl อีกแล้ว
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
          <span className="text-sm md:text-base">นักศึกษามหาวิทยาลัยขอนแก่น</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-[0_0_25px_5px_rgba(0,0,0,0.07)] border border-gray-100 sm:p-8">
          <form onSubmit={onSubmit} noValidate>
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
                  placeholder="เช่น ดร., อาจารย์, คุณ, Mr., Ms." maxLength={20} aria-label="ระบุคำนำหน้าเอง"
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
              name="student_id"
              label="รหัสนักศึกษา (ไม่ใส่ขีด)"
              placeholder="รหัสนักศึกษา"
              value={form.student_id}
              type="text"
              inputMode="numeric"
              pattern="^\d{1,10}$"
              onChange={(v) => handleChange('student_id', v.replace(/\D/g, '').slice(0, 10))}
              error={errors.student_id}
            />

            <SimpleCombobox
            name="year"
            label="ชั้นปี"
            placeholder="เลือกชั้นปี"
            value={form.year}
            onChange={(v) => handleChange('year', v)}
            options={[1,2,3,4,5,6].map(String)}
            error={errors.year}
            />

            <FacultyCombobox
                name="faculty"
                value={form.faculty}
                onChange={(v) => handleChange('faculty', v)}
                options={faculties}
                error={errors.faculty}
            />
            {form.faculty === 'อื่น ๆ' && (
              <div className="mt-2">
                <label htmlFor="faculty_other" className="mb-1 block text-xs text-gray-500">ระบุคณะ</label>
                <Input
                  id="faculty_other" name="faculty_other"
                  required value={form.faculty_other}
                  onChange={(e) => handleChange('faculty_other', e.target.value)}
                  placeholder="กรอกชื่อคณะ/หน่วยงาน" maxLength={100} aria-label="ระบุคณะเอง"
                  aria-invalid={!!errors.faculty_other}
                  aria-describedby={errors.faculty_other ? 'faculty_other-error' : undefined}
                  className={errors.faculty_other ? 'border-red-500 focus-visible:ring-red-600 focus-visible:border-red-600' : ''}
                />
                {errors.faculty_other
                    ? <p id="faculty_other-error" className="mt-1 mb-3 text-xs text-red-600">{errors.faculty_other}</p>
                    : <p className="mt-[5px] mb-3 px-2 text-[11px] text-gray-400">ระบุชื่อคณะได้สูงสุด 100 ตัวอักษร</p>
                }
              </div>
            )}

            <InputField
              name="major"
              label="สาขา"
              placeholder="สาขาที่ศึกษา"
              value={form.major}
              onChange={(v) => handleChange('major', v)}
              error={errors.major}
            />

            <InputField
              name="kku_mail"
              label="KKU Mail"
              placeholder="example@kkumail.com"
              value={form.kku_mail}
              type="email"
              onChange={(v) => handleChange('kku_mail', v)}
              error={errors.kku_mail}
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

            {/* รูปถ่ายผู้สมัคร */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">รูปถ่ายผู้สมัคร</label>
              <div className="relative">
                <label
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-white px-4 py-2 text-sm shadow-sm transition
                    ${errors.photo
                      ? 'border-red-500 hover:border-red-600'
                      : preview
                        ? 'border-green-400 hover:border-green-500'
                        : 'border-dashed border-gray-300 hover:border-gray-400'}`}
                >
                  <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${preview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {form.photo ? form.photo.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                    </span>
                  </div>
                  <input
                    id="photo" name="photo"
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => onPhotoChange(e.target.files?.[0])} required
                    aria-invalid={!!errors.photo}
                    aria-describedby={errors.photo ? 'photo-error' : undefined}
                  />
                </label>

                {errors.photo && (
                  <p id="photo-error" className="mt-1 text-xs text-red-600">{errors.photo}</p>
                )}

                {preview && (
                  <div className={`mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 shadow-md
                    ${errors.photo ? 'border-red-500' : 'border-green-500'}`}>
                    <button
                      type="button" onClick={() => onPhotoChange(null)}
                      className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition"
                      aria-label="ลบรูปภาพ"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
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
