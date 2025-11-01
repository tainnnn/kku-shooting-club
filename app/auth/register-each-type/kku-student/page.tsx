'use client'

import { useState, FormEvent } from 'react'
import { Upload, X, Loader2, ChevronDown } from 'lucide-react'
import { Input } from "@/components/ui/input";

type FormState = {
  prefix: string
  prefix_other: string
  first_name: string
  last_name: string
  student_id: string
  year: string
  faculty: string
  faculty_other: string   // ✅ เพิ่มฟิลด์นี้
  major: string
  kku_mail: string
  phone: string
  photo?: File | null
}

const faculties = [
  'วิศวกรรมศาสตร์',
  'วิทยาศาสตร์',
  'เทคโนโลยีสารสนเทศและการสื่อสาร',
  'ศึกษาศาสตร์',
  'บริหารธุรกิจและการบัญชี',
  'มนุษยศาสตร์และสังคมศาสตร์',
  'แพทยศาสตร์',
  'ทันตแพทยศาสตร์',
  'เภสัชศาสตร์',
  'พยาบาลศาสตร์',
  'สถาปัตยกรรมศาสตร์',
  'อื่น ๆ',
]

const prefixes = ['นาย', 'นาง', 'นางสาว', 'อื่น ๆ']

// Component สำหรับแสดง Input Field
interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  pattern?: string;
  isSelect?: boolean;
  options?: string[];
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  inputMode,
  pattern,
  isSelect = false,
  options
}) => (
  <div className="mb-4">
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    {isSelect ? (
      <div className="relative">
        <select
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-10 py-2 text-sm shadow-sm outline-none transition duration-150 ease-in-out focus:border-gray-600 focus:ring-1 focus:ring-gray-600 dark:bg-white text-gray-400 ${value ? 'text-gray-800' : 'text-gray-400'}`}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options?.map((option) => (
            <option key={option} value={option} className="py-2 px-3 text-sm text-gray-800">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    ) : (
      <Input
        required
        type={type}
        inputMode={inputMode}
        pattern={pattern}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

// Component หลัก
export default function RegistrationForm() {
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>({
    prefix: '',
    prefix_other: '',
    first_name: '',
    last_name: '',
    student_id: '',
    year: '',
    faculty: '',
    faculty_other: '',   // ✅ ค่าเริ่มต้น
    major: '',
    kku_mail: '',
    phone: '',
    photo: null,
  })

  function handleChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((s) => ({ ...s, [key]: val }))
  }

  function onPhotoChange(file?: File | null) {
    handleChange('photo', file ?? null)
    if (file) setPreview(URL.createObjectURL(file))
    else setPreview(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      // ป้องกันกรณีเลือก "อื่น ๆ" แต่ไม่พิมพ์คำนำหน้า/คณะ
      const prefixResolved = form.prefix === 'อื่น ๆ' ? form.prefix_other.trim() : form.prefix
      const facultyResolved = form.faculty === 'อื่น ๆ' ? form.faculty_other.trim() : form.faculty

      if (!prefixResolved) {
        const el = document.getElementById('form-status')
        if (el) {
          el.innerText = 'โปรดระบุคำนำหน้า'
          el.className = 'mt-4 text-center text-red-600 font-bold'
        }
        return
      }
      if (!facultyResolved) {
        const el = document.getElementById('form-status')
        if (el) {
          el.innerText = 'โปรดระบุคณะ'
          el.className = 'mt-4 text-center text-red-600 font-bold'
        }
        return
      }

      // เดโม่: จำลองการส่งข้อมูล
      await new Promise(resolve => setTimeout(resolve, 1500))

      const payload = {
        prefix: prefixResolved,
        first_name: form.first_name,
        last_name: form.last_name,
        student_id: form.student_id,
        year: form.year,
        faculty: facultyResolved,   // ✅ ใช้ค่าที่ resolve แล้ว
        major: form.major,
        kku_mail: form.kku_mail,
        phone: form.phone,
        // ไม่ส่งไฟล์ใน payload ตรง ๆ (อัปโหลดไฟล์ควรใช้ storage แยก)
      }
      console.log('submit:', payload, form.photo)

      const el = document.getElementById('form-status')
      if (el) {
        el.innerText = 'ส่งข้อมูลสำเร็จ (เดโม: โปรดเปลี่ยน flow นี้ภายหลัง)'
        el.className = 'mt-4 text-center text-green-600 font-bold'
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-50 py-10">
      <div className="w-full max-w-xl px-4 md:px-0">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-700">ลงทะเบียนสมัครแข่งขัน</h1>
        </div>

        {/* Divider */}
        <div className="mb-12 flex w-full items-center gap-3 text-gray-500">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="text-sm md:text-base">นักศึกษามหาวิทยาลัยขอนแก่น</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        {/* Form Card Container */}
        <div className="rounded-2xl bg-white p-6 shadow-[0_0_25px_5px_rgba(0,0,0,0.07)] border border-gray-100 sm:p-8">
          <form onSubmit={onSubmit} noValidate>

            {/* คำนำหน้า */}
            <InputField
              label="คำนำหน้า"
              placeholder="เลือกคำนำหน้า"
              value={form.prefix}
              onChange={(v) => handleChange('prefix', v)}
              isSelect
              options={prefixes}
            />
            {form.prefix === 'อื่น ๆ' && (
              <div className="mt-2">
                <label className="mb-1 block text-xs text-gray-500">ระบุคำนำหน้า</label>
                <Input
                  required
                  value={form.prefix_other}
                  onChange={(e) => handleChange('prefix_other', e.target.value)}
                  placeholder="เช่น ดร., อาจารย์, คุณ, Mr., Ms."
                  maxLength={20}
                  aria-label="ระบุคำนำหน้าเอง"
                />
                <p className="mt-[5px] mb-3 px-2 text-[11px] text-gray-400">กำหนดเองได้สูงสุด 20 ตัวอักษร</p>
              </div>
            )}

            {/* ชื่อ */}
            <InputField
              label="ชื่อ"
              placeholder="ชื่อ (ไม่ต้องใส่คำนำหน้า)"
              value={form.first_name}
              onChange={(v) => handleChange('first_name', v)}
            />

            {/* นามสกุล */}
            <InputField
              label="นามสกุล"
              placeholder="นามสกุล"
              value={form.last_name}
              onChange={(v) => handleChange('last_name', v)}
            />

            {/* รหัสนักศึกษา */}
            <InputField
              label="รหัสนักศึกษา (ไม่ใส่ขีด)"
              placeholder="รหัสนักศึกษา"
              value={form.student_id}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(v) => handleChange('student_id', v.replace(/\D/g, ''))}
            />

            {/* ชั้นปี */}
            <InputField
              label="ชั้นปี"
              placeholder="เลือกชั้นปี"
              value={form.year}
              onChange={(v) => handleChange('year', v)}
              isSelect
              options={[1,2,3,4,5,6].map(String)}
            />

            {/* คณะ */}
            <InputField
              label="คณะ"
              placeholder="เลือกคณะ"
              value={form.faculty}
              onChange={(v) => handleChange('faculty', v)}
              isSelect
              options={faculties}
            />
            {form.faculty === 'อื่น ๆ' && (
              <div className="mt-2">
                <label className="mb-1 block text-xs text-gray-500">ระบุคณะ</label>
                <Input
                  required
                  value={form.faculty_other}
                  onChange={(e) => handleChange('faculty_other', e.target.value)}
                  placeholder="กรอกชื่อคณะ/หน่วยงาน"
                  maxLength={100}
                  aria-label="ระบุคณะเอง"
                />
                <p className="mt-[5px] mb-3 px-2 text-[11px] text-gray-400">ระบุชื่อคณะได้สูงสุด 100 ตัวอักษร</p>
              </div>
            )}

            {/* สาขา */}
            <InputField
              label="สาขา"
              placeholder="สาขาที่ศึกษา"
              value={form.major}
              onChange={(v) => handleChange('major', v)}
            />

            {/* kku_mail */}
            <InputField
              label="KKU Mail"
              placeholder="example@kku.ac.th"
              value={form.kku_mail}
              type="email"
              onChange={(v) => handleChange('kku_mail', v)}
            />

            {/* เบอร์โทร */}
            <InputField
              label="เบอร์โทรติดต่อ"
              placeholder="08X-XXXXXXX"
              value={form.phone}
              type="tel"
              inputMode="tel"
              onChange={(v) => handleChange('phone', v.replace(/[^\d+]/g, ''))}
            />

            {/* รูปถ่ายผู้สมัคร */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">รูปถ่ายผู้สมัคร</label>
              <div className="relative">
                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${preview ? 'border-green-400' : 'border-dashed border-gray-300'} bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-400`}>
                  <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${preview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {form.photo ? form.photo.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPhotoChange(e.target.files?.[0])}
                    required
                  />
                </label>

                {preview && (
                  <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                    <button
                      type="button"
                      onClick={() => onPhotoChange(null)}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-500 px-5 py-3 text-white text-base font-semibold shadow-[0_0_25px_5px_rgba(0,0,0,0.07)] transition duration-300 hover:bg-green-600 disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังส่งข้อมูล...
                </span>
              ) : (
                'ยืนยันการลงทะเบียน'
              )}
            </button>
            <div id="form-status" className="mt-4 text-center text-sm"></div>
          </form>
        </div>

        {/* Footer Space */}
        <div className="mt-8 text-xs text-gray-500 text-center">
          ระบบลงทะเบียนแข่งขันยิงปืน มหาวิทยาลัยขอนแก่น
        </div>
      </div>
    </div>
  )
}
